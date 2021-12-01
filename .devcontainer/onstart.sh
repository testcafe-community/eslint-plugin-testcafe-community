#!/bin/sh
# FILE: onstart.sh
# -----------------------------------

[ -z "$LOG_PREFIX" ] && LOG_PREFIX="[STARTUP]"

PROJECT_DIR=""
if ! PROJECT_DIR="$(git rev-parse --show-toplevel)"; then
    printf >&2 '%s\n' "$LOG_PREFIX ERROR: something bad happened."
fi

# shellcheck source=.husky/hook-utils.sh
. "$PROJECT_DIR/.husky/hook-utils.sh"

VALID_GIT_CONFIG="true"

# [1] Ensure correct dependencies are installed
if ! npm install --no-audit --no-fund --prefer-offline; then
    error "**********************************************"
    error "* Dependency update failed, see error above! *"
    error "**********************************************"
    error ""
fi

# [2] Validate git configuration is intact
if ! config_git_project_gitconfig; then
    VALID_GIT_CONFIG="false"
fi
if ! config_git_commit_signing; then
    VALID_GIT_CONFIG="false"
fi
if [ "$VALID_GIT_CONFIG" = "true" ]; then
    log "SUCCESS: verified git config"
fi

unset -v PROJECT_DIR VALID_GIT_CONFIG
cleanup
