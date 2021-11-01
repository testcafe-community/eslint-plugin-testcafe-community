#!/bin/sh
[ -z "$LOG_PREFIX" ] && LOG_PREFIX="[.husky/???]"

log() {
  echo "${LOG_PREFIX} $@"
}

error() {
  echo >&2 "${LOG_PREFIX} $@"
}
