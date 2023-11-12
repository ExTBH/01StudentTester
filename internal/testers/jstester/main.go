package jstester

import (
	"fmt"
	"html/template"
	"log"
	"net/http"
	"path"
	"strings"

	"slices"

	"github.com/ExTBH/01StudentTester/internal/testers/helpers"
)

var homeTmplt *template.Template
var testTmplt *template.Template
var quests []helpers.Quest

func Home(w http.ResponseWriter, r *http.Request) {
	if homeTmplt == nil {
		t, err := template.ParseFiles("web/html/quests_page.html")
		if err != nil {
			log.Panic(err.Error())
		}
		homeTmplt = t
	}

	if quests == nil {
		quests = helpers.JsQuests()
	}

	slices.SortFunc(quests, helpers.SortQuests)
	homeTmplt.Execute(w, quests)
}

func SingleTest(w http.ResponseWriter, r *http.Request) {
	if testTmplt == nil {
		t, err := template.ParseFiles("web/html/single_test.html")
		if err != nil {
			log.Panic(err.Error())
		}
		testTmplt = t
	}

	slashes := strings.Count(r.URL.Path, "/")
	// its a quest/raid
	if slashes == 3 {
		questName := path.Base(r.URL.Path)
		quest := findQuestWithName(questName)
		fmt.Fprintf(w, "This is Raid %s", quest.Name)
		return
	}
	comp := strings.Split(r.URL.Path, "/")
	questName := comp[3]
	testName := comp[4]

	quest := findQuestWithName(questName)
	if quest == nil {
		http.Error(w, "Invalid Quest", http.StatusNotFound)
		return
	}
	test := helpers.FindTestWithName(testName, quest.Children)
	if test == nil {
		http.Error(w, "Invalid Test", http.StatusNotFound)
		return
	}

	data := struct {
		Test    *helpers.Test
		AceMode string
	}{
		Test:    test,
		AceMode: "javascript",
	}

	testTmplt.Execute(w, data)

}

func findQuestWithName(name string) *helpers.Quest {
	if quests == nil {
		quests = helpers.JsQuests()
	}
	for _, quest := range quests {
		if quest.Name == name {
			return &quest
		}
	}
	return nil
}
