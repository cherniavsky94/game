FROM mcr.microsoft.com/devcontainers/typescript-node:20

# Install PostgreSQL client for Prisma
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends postgresql-client \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Install global npm packages
RUN npm install -g concurrently tsx prisma
