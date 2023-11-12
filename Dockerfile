FROM golang:1.21.3

WORKDIR /app

COPY . .

RUN ./prepare.sh

EXPOSE 2004

CMD [ "go", "run", "cmd/tester/main.go" ]