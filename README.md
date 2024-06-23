# 01 Student Tester
A simple tool that helps testing quests/exams/...

## How to Run
### New Docker way
> this will take a while to download it if its the first time so wait until you see `listening on http://localhost:2004`
```sh
docker run --name tester -p 2004:2004 ghcr.io/extbh/01studenttester:latest
```
and to stop it
```sh
docker stop tester
```

### Old way
Start with running 
```sh
./prepare.sh
```
to prepare everything to run.

if all was good then you can start the server with
```sh
go run cmd/tester/main.go
```

now just head to http://localhost:2004 and use it.

> Only go tester works now :<
