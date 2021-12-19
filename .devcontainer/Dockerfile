# See here for image contents: https://github.com/microsoft/vscode-dev-containers/tree/v0.205.1/containers/typescript-node/.devcontainer/base.Dockerfile

ARG VARIANT="16-bullseye"
FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:${VARIANT}

RUN apt update && export DEBIAN_FRONTEND=noninteractive \
    # remove pre-installed yarn (from javascript-node base image) to
    # prevent developer confusion/misuse, this repo expects npm
    && apt remove -y yarn \
    # && apt -y install --no-install-recommends <your-package-list-here>
  
    # Ensure github:22 is a known-host
    && echo "github.com ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBEmKSENjQEezOmxkZMy7opKgwFB9nkt5YRrYMjNuG5N87uRgg6CLrbo5wAdT/y6v0mKV0U2w0WZ2YB/++Tpockg=" > /etc/ssh/ssh_known_hosts \
    && ssh-keygen -H -f /etc/ssh/ssh_known_hosts \
    && rm /etc/ssh/ssh_known_hosts.old \
    && chmod 444 /etc/ssh/ssh_known_hosts \
    && printf "\
Host github.com\n\
  HostName github.com\n\
  CheckHostIP no\n\
" > /etc/ssh/ssh_config.d/servers.conf
