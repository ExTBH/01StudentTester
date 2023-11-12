package gotester

import (
	"encoding/json"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path"
	"path/filepath"
	"slices"

	"github.com/ExTBH/01StudentTester/internal/testers/helpers"
)

var homeTmplt *template.Template
var testTmplt *template.Template
var tests []helpers.Test

func Home(w http.ResponseWriter, r *http.Request) {
	if homeTmplt == nil {
		t, err := template.ParseFiles("web/html/tests_page.html")
		if err != nil {
			log.Panic(err.Error())
		}
		homeTmplt = t
	}

	if tests == nil {
		tests = helpers.GoTests()
	}

	slices.SortFunc(tests, helpers.SortTestsProg)
	homeTmplt.Execute(w, tests)
}

func SingleTest(w http.ResponseWriter, r *http.Request) {
	if testTmplt == nil {
		t, err := template.ParseFiles("web/html/single_test.html")
		if err != nil {
			log.Panic(err.Error())
		}
		testTmplt = t
	}

	testName := path.Base(r.URL.Path)
	if tests == nil {
		tests = helpers.GoTests()
	}
	test := helpers.FindTestWithName(testName, tests)

	if test == nil {
		http.Error(w, "Test Not Found", http.StatusNotFound)
		return
	}
	data := struct {
		Test    *helpers.Test
		AceMode string
	}{
		Test:    test,
		AceMode: "golang",
	}
	testTmplt.Execute(w, data)

}

func RunTest(w http.ResponseWriter, r *http.Request) {
	testName := path.Base(r.URL.Path)
	if tests == nil {
		tests = helpers.GoTests()
	}
	test := helpers.FindTestWithName(testName, tests)
	if test == nil {
		http.Redirect(w, r, "/go-tester", http.StatusTemporaryRedirect)
		return
	}

	var result map[string]string
	if err := json.NewDecoder(r.Body).Decode(&result); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		log.Println(err.Error())
		fmt.Fprint(w, err.Error())
		return
	}
	path := "GoTester/piscine-go/" + test.ExpectedFiles[0]

	err := os.MkdirAll(filepath.Dir(path), os.ModePerm)
	if err != nil {
		log.Println("Error creating directories:", err)
		return
	}
	err = os.WriteFile(path, []byte(result["code"]), 0644)
	if err != nil {
		log.Println(err.Error())
		return
	}
	defer os.RemoveAll(filepath.Dir(path))

	// maybe you wanna run without imports check?
	if result["runType"] == "check" {
		args := []string{path}
		args = append(args, test.AllowedFunctions...)

		cmd := exec.Command("./GoTester/rc/rc", args...)
		output, err := cmd.CombinedOutput()
		if err != nil {
			w.Write(output)
			return
		}
	}
	// Run test
	cmd := exec.Command("./single_test.sh", testName)
	output, err := cmd.CombinedOutput()
	if err != nil {
		w.Write(output)
		return
	}
	fmt.Fprint(w, "Congrats, Passed All Cases!")
}
