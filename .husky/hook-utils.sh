#!/bin/sh
[ -z "$LOG_PREFIX" ] && LOG_PREFIX="[.husky/???]"

# as opposed to echo, interpret C escape sequences properly in all envs
replay() {
  printf '%s\n' "$*"
}

# Print to stdout as messages with a prefix of $LOG_PREFIX
log() {
  replay "$@" | awk -v "PREFIX=$LOG_PREFIX" -F '\\\\n' '{print PREFIX " " $1}'
}

# Print to stderr as messages with a prefix of $LOG_PREFIX
error() {
  replay "$@" | awk >&2 -v "PREFIX=$LOG_PREFIX" -F '\\\\n' '{print PREFIX " " $1}'
}

# Prints and runs command
explicit_run_cmd() {
  cmd="$1"
  log "$> $cmd"
  eval "$cmd"
}

# POSIX Compliant & portable (X-OS) realpath implementation
realpath() {
  OURPWD="$PWD"
  cd "$(dirname "$1")" || return 1
  LINK=$(readlink "$(basename "$1")") || true
  while [ "$LINK" ]; do
    cd "$(dirname "$LINK")" || return 1
    LINK=$(readlink "$(basename "$1")") || true
  done
  REALPATH="$PWD/$(basename "$1")"
  cd "$OURPWD" || return 1
  echo "$REALPATH"
  unset -v OURPWD LINK REALPATH
  return 0
}

# Resolves project directory
get_project_dir() {
  directory=""
  if ! directory="$(git rev-parse --show-toplevel)"; then
    error "ERROR: Unable to determine project directory."
    exit 1
  fi
  if ! directory="$(realpath "$directory")"; then
    error "ERROR: Unable to determine absolute path of project directory."
    exit 1
  fi
  replay "$directory"
  unset -v directory
  return 0
}

# Function to configure git repository to include project `.gitconfig`
config_git_project_gitconfig() {
  if ! output="$(git config --local --get include.path)"; then
    error "ERROR: unable to read local git configuration"
    unset -v output
    return 1
  fi
  if [ "$output" = "../.gitconfig" ]; then
    unset -v output
    return 0 # As desired, return silently
  fi
  unset -v output
  if ! git config --local include.path "../.gitconfig"; then
    error "ERROR: failed to add project .gitconfig to local git configuration."
    return 1
  fi
}

# Function to configure git repository to enforce GPG signed commits
config_git_commit_signing() {
  # check if configured properly
  if ! git config --get commit.gpgsign 1>/dev/null 2>&1; then
    error "ERROR: missing commit.gpgsign=true in git config."
    error "Commits are required to be signed for this repository."
    return 1
  fi
  if ! git config --get user.signingkey 1>/dev/null 2>&1; then
    log "==============================================================="
    log "                   USER ACTION REQUIRED!"
    log "---------------------------------------------------------------"
    log "GPG commit signing is required for this repository! Please"
    log "configure your repository with the following command:"
    log "" # prefixed-newline
    log "    git config --local user.signingkey <GPG_KEY_ID>"
    log "" # prefixed-newline
    log "==============================================================="
  elif [ "$IS_CLONING" = "true" ]; then
    log "Signature exists: user.signingkey=$(git config --get user.signingkey)"
  fi
}

# Function to activate designated node environment based on .nvmrc value
# facilitates installation if not existant
activate_nvm_env() {
  # Check if NVM is installed
  if ! command -v nvm >/dev/null 2>&1; then
    NVM_DEFAULT_PATH="$HOME/.nvm/nvm.sh"
    if ! [ -s "$NVM_DEFAULT_PATH" ] || replay "$SHELL" | grep dash; then
      # Abort [1], nvm not found
      # Abort [2], dash could fail on sourcing of nvm
      return 0
    fi
    # shellcheck disable=SC2034
    NVM_DIR="$(dirname "$NVM_DEFAULT_PATH")"
    # shellcheck disable=SC1090,SC2240
    . "$NVM_DEFAULT_PATH" --no-use # Load nvm into git hook's shell
  fi

  currentNodeVer="$(nvm current)"
  projDir="$(get_project_dir)"
  if ! [ -f "$projDir/.nvmrc" ] || grep -q "$currentNodeVer" "$projDir/.nvmrc"; then
    unset -v projDir currentNodeVer
    nvm unload
    return 0 # Matches current version, stop processing
  fi
  unset -v projDir currentNodeVer

  output=""
  if ! output="$(nvm use 2>&1 1>/dev/null)"; then
    if ! replay "$output" | grep --quiet "not yet installed"; then
      unset -v output
      nvm unload
      return 0 # Abort action
    fi
    VERSION=""
    VERSION="$(replay "$output" | grep 'nvm install' | sed -E 's/.*install v([0-9]+\.[0-9]+\.[0-9]+).*/\1/')"
    # enable user input, git by default runs in non-interactive mode
    if ! exec </dev/tty; then
      unset -v output VERSION
      nvm unload
      return 0 # Abort
    fi
    response=""
    confirmed=false
    while [ "$confirmed" = "false" ]; do
      printf '%s' "Would you like to install Node.js ${VERSION} via nvm (Y/n)? "
      read -r response;
      if replay "$response" | grep -q -i -E '^\s*(Y|YES|YEP)\s*$'; then  
        response="install"
      elif replay "$response" | grep -q -i -E '^\s*(N|NO|NOPE)\s*$'; then
        response=""
      else
        replay >&2 "Invalid response received. Try again."
        continue
      fi
      confirmed=true;
    done
    if [ "$response" = "install" ]; then
      log "Installing Node.js v$VERSION via nvm..."
      if ! nvm install "$VERSION"; then
        error "ERROR: nvm's installer failed, see error above."
        error "Your node version does not match with the expected dev environment version."
        nvm unload
        unset -v output VERSION response confirmed
        return 1
      fi
      if ! nvm install-latest-npm; then
        error "ERROR: failed to update to the latest npm."
        error "You will need to re-run the npm update manually."
        error ""
        error "  nvm use"
        error "  nvm install-latest-npm"
        error ""
        nvm unload
        unset -v output VERSION response confirmed
        return 1
      fi
      log "Installation successful, however you need to run:"
      log ""
      log "  nvm use"
      log ""
      log "to activate the expected node version in your shell environment."
    else
      error "NODE VERSION MIXMATCH: Expected dev environment Node.js version is not installed."
      error "The project author expects contributors to use the Node.js version defined in .nvmrc for development."
      error "Develop at your own risk!"
    fi
  else
    log "NODE VERSION CHANGE DETECTED"
    log "No installation required but you need to run:"
    log ""
    log "  nvm use"
    log ""
    log "to activate the expected node version for development."
  fi
  nvm unload
  unset -v output VERSION response confirmed
}

# Unset all functions/vars this utils file creates
cleanup() {
  unset -v LOG_PREFIX
  unset -f cleanup replay log error explicit_run_cmd \
           realpath get_project_dir activate_nvm_env \
           config_git_project_gitconfig config_git_commit_signing
}
