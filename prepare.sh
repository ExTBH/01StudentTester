#!/bin/bash

set -e
set -x

rm -rf GoTester

mkdir GoTester
cd GoTester

mkdir piscine-go
cd piscine-go
go mod init student
cd ../

git clone --quiet "https://github.com/01-edu/rc"

cd rc
go build
cd ../

git clone --quiet "https://github.com/01-edu/go-tests"

cd go-tests
go mod tidy
go get student
