#!/bin/bash

set -e
set -x

# Clean last run
rm -rf piscine-go-template
rm -rf rc
rm -rf go-tests

# Make student directory template
mkdir piscine-go-template
cd piscine-go-template
go mod init student
cd ../

# install and build static checker
git clone --quiet "https://github.com/01-edu/rc"

cd rc
go build
cd ../

# Install Tests for the project
git clone --quiet "https://github.com/01-edu/go-tests"

cd go-tests

# apply patch to allow concurrency in tests
git apply ../challenge.patch
