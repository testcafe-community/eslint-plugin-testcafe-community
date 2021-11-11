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
  output=""
  if ! output="$(nvm use 2>&1 1>/dev/null)"; then
    if ! replay "$output" | grep --quiet "not yet installed"; then
      unset -v output
      return 0 # Abort action
    fi
    VERSION=""
    VERSION="$(replay "$output" | grep 'nvm install' | sed -E 's/.*install v([0-9]+\.[0-9]+\.[0-9]+).*/\1/')"
    # enable user input, git by default runs in non-interactive mode
    if ! exec </dev/tty; then
      unset -v output VERSION
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
        unset -v output VERSION response confirmed
        return 1
      fi
      if ! nvm install-latest-npm; then
        error "ERROR: failed to update to the latest npm."
        error "You will need to re-run the npm update manually."
        error "\n  nvm install-latest-npm\n"
        unset -v output VERSION response confirmed
        return 1
      fi
    else
      error "NODE VERSION MIXMATCH: Expected dev environment Node.js version is not installed."
      error "Authors expect to contributors to use the Node.js version defined in .nvmrc for development."
      error "dev at your own risk!"
    fi
  fi
  unset -v output VERSION response confirmed
}

# Unset all functions/vars this utils file creates
cleanup() {
  unset -v LOG_PREFIX
  unset -f cleanup replay log error explicit_run_cmd activate_nvm_env
}
