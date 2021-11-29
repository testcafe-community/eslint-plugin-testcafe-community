# See here for image contents: https://github.com/microsoft/vscode-dev-containers/tree/v0.205.1/containers/typescript-node/.devcontainer/base.Dockerfile

ARG VARIANT="16-bullseye"
FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:${VARIANT}

# [Optional] Uncomment this section to install additional OS packages.
RUN apt update && export DEBIAN_FRONTEND=noninteractive \
    && apt uninstall -y yarn
    # && apt -y install --no-install-recommends <your-package-list-here>
