# Use the official Ubuntu image as a base
FROM ubuntu:22.04

# Set environment variables for non-interactive installation
ENV DEBIAN_FRONTEND=noninteractive

# Update the package list and install prerequisites
RUN apt-get update && \
    apt-get install -y \
    curl \
    gnupg \
    software-properties-common \
    build-essential \
    git && \
    rm -rf /var/lib/apt/lists/*

# Install Node.js 22
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs

# Install Go 1.18
RUN add-apt-repository ppa:longsleep/golang-backports -y && \
    apt-get update && \
    apt-get install -y golang-1.18-go && \
    ln -s /usr/lib/go-1.18/bin/go /usr/local/bin/go


WORKDIR /app

COPY . /app

RUN npm install

EXPOSE 3000


RUN ./prepare.sh

CMD ["npm", "run", "dev"]