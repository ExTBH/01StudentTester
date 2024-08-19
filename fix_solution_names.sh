#!/bin/bash

# Check if the solution file exists and rename it
if [ -f "/app/go-tests/solutions/count-character.go" ]; then
    mv /app/go-tests/solutions/count-character.go /app/go-tests/solutions/countcharacter.go
fi
