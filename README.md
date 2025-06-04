# 01 Student Tester

A simple tool that helps testing quests/exams/...

## How to Run

> this will take a while to download it if its the first time so wait until you see `listening on http://localhost:3000`

```sh
docker run --name tester -p 3000:3000 ghcr.io/extbh/01studenttester:latest
```

and to stop it

```sh
docker stop tester
```

then you can start it anytime with

```sh
docker start tester
```

## What to do when a new update happens?

1. Stop and delete container and image

```sh
docker stop tester
docker rm tester
docker rmi ghcr.io/extbh/01studenttester:latest
```

2. Run again

```sh
docker run --name tester -p 3000:3000 ghcr.io/extbh/01studenttester:latest
```
