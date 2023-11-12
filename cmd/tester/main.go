package main

import (
	"fmt"
	"html/template"
	"log"
	"net/http"

	"github.com/ExTBH/01StudentTester/internal/testers/gotester"
	"github.com/ExTBH/01StudentTester/internal/testers/jstester"
)

var homeTmplt *template.Template

func main() {
	t, err := template.ParseFiles("web/html/index.html")
	if err != nil {
		log.Panic(err.Error())
	}
	homeTmplt = t
	mux := http.NewServeMux()

	mux.HandleFunc("/", home)
	mux.HandleFunc("/go-tester", gotester.Home)
	mux.HandleFunc("/go-tester/test/", gotester.SingleTest)
	mux.HandleFunc("/go-tester/run/", gotester.RunTest)

	mux.HandleFunc("/js-tester", jstester.Home)
	mux.HandleFunc("/js-tester/run/", jstester.SingleTest)

	cssFS := http.FileServer(http.Dir("web/css"))
	mux.Handle("/css/", http.StripPrefix("/css/", cssFS))

	fmt.Println("Listening on http://localhost:2004/")
	http.ListenAndServe(":2004", mux)
}

func home(w http.ResponseWriter, r *http.Request) {
	homeTmplt.Execute(w, nil)
}
