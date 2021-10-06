#!/bin/sh
[ -z "$LOG_PREFIX" ] && LOG_PREFIX="[.husky/???]"

log() {
  echo "${LOG_PREFIX} $1"
}

error() {
  echo >&2 "${LOG_PREFIX} $1"
}
