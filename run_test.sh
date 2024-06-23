#!/usr/bin/env bash

set -e

# check if args are at least 2
if [ "$#" -lt 2 ]; then
    echo "Usage: $0 <test-name> <student-file-name> [<allowed-functions>]"
    exit 1
fi


RC_BIN="$(pwd)/rc/rc"

# Read STDIN while preserving new lines
CODE=""
while IFS= read -r line || [ -n "$line" ]; do
    CODE+="$line\n"
done


temp_dir=$(mktemp -d)


mkdir $temp_dir/piscine-go
mkdir -p $temp_dir/go-tests/lib

cp -r piscine-go-template/* $temp_dir/piscine-go/
cp -r go-tests/lib $temp_dir/go-tests/
cp go-tests/go.* $temp_dir/go-tests/



# check if test exists
if [ ! -d "go-tests/tests/$1_test" ]; then
    echo "Test $1 does not exist"
    exit 1
fi

# copy test to temp dir
mkdir -p $temp_dir/go-tests/tests/$1_test
cp -r go-tests/tests/$1_test $temp_dir/go-tests/tests/

# copy solution to temp dir
mkdir -p $temp_dir/go-tests/solutions/$1
cp -r go-tests/solutions/$1 $temp_dir/go-tests/solutions/


# if the  student file ends with main.go, create parent directories for it in piscine-go
if [[ $2 == *main.go ]]; then
    mkdir -p $temp_dir/piscine-go/$(dirname $2)
fi

# pipe code from stdin to the student file
echo -e $CODE > $temp_dir/piscine-go/$2


# run test
cd $temp_dir/go-tests
go get student

set +e

# pass import checks as arguments
output=$($RC_BIN "$temp_dir/piscine-go/$2" "$@")
exit_code=$?

if [ $exit_code -ne 0 ]; then
    echo -e "$output" >&2
    exit $exit_code
fi

output=$(go run ./tests/$1_test/main.go)
exit_code=$?

rm -rf $temp_dir

exit $exit_code