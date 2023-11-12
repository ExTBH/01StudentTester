package helpers

import (
	"encoding/json"
	"log"
	"net/http"
	"slices"
)

type Test struct {
	Name             string
	ExpectedFiles    []string
	AllowedFunctions []string
	BaseSkills       map[string]int
	SubjectPath      string
	Index            int
	Type             string // required, optional..
}

type Quest struct {
	Name     string
	Index    int
	Type     string
	Children []Test
}

var bh_campus map[string]interface{}

func SortTestsProg(a, b Test) int {
	if a.BaseSkills["prog"] == b.BaseSkills["prog"] {
		return 0
	}
	if a.BaseSkills["prog"] < b.BaseSkills["prog"] {
		return -1
	}
	return 1
}

func SortTestsIndex(a, b Test) int {
	if a.Index == b.Index {
		return 0
	}
	if a.Index < b.Index {
		return -1
	}
	return 1
}

func SortQuests(a, b Quest) int {
	if a.Index == b.Index {
		return 0
	}
	if a.Index < b.Index {
		return -1
	}
	return 1
}

func GetCampus() map[string]interface{} {
	if bh_campus != nil {
		return bh_campus
	}
	resp, err := http.Get("https://learn.reboot01.com/api/object/bahrain")
	if err != nil {
		log.Fatalln(err.Error())
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		log.Fatalln("Status not 200", resp.Status)
	}

	// Decode the JSON response into a map of interface{}
	if err := json.NewDecoder(resp.Body).Decode(&bh_campus); err != nil {
		log.Fatal(err)
	}
	return bh_campus
}

func GoTests() []Test {
	campus := GetCampus()
	if campus == nil {
		return nil
	}
	modules := campus["children"].(map[string]interface{})
	bh_module := modules["bh-module"].(map[string]interface{})
	module_children := bh_module["children"].(map[string]interface{})
	checkpoint := module_children["checkpoint"].(map[string]interface{})

	tests := []Test(nil)

	for _, item := range checkpoint["children"].(map[string]interface{}) {
		item_dict := item.(map[string]interface{})
		attrs := item_dict["attrs"].(map[string]interface{})

		name := item_dict["name"]
		allowedFunctions := intrToArr(attrs["allowedFunctions"].([]interface{}))
		expectedFiles := intrToArr(attrs["expectedFiles"].([]interface{}))
		baseSkills := skillsConverter(attrs["baseSkills"].(map[string]interface{}))
		subjectPath := "https://learn.reboot01.com" + attrs["subject"].(string)

		t := Test{
			Name:             name.(string),
			AllowedFunctions: allowedFunctions,
			ExpectedFiles:    expectedFiles,
			BaseSkills:       baseSkills,
			SubjectPath:      subjectPath,
		}
		tests = append(tests, t)
	}
	return tests
}

func JsQuests() []Quest {
	campus := GetCampus()
	if campus == nil {
		return nil
	}
	modules := campus["children"].(map[string]interface{})
	bh_module := modules["bh-module"].(map[string]interface{})
	module_children := bh_module["children"].(map[string]interface{})
	js_piscine := module_children["piscine-js"].(map[string]interface{})

	quests := []Quest(nil)

	for _, item := range js_piscine["children"].(map[string]interface{}) {
		item_dict := item.(map[string]interface{})
		name := item_dict["name"].(string)
		index := int(item_dict["index"].(float64))
		children := []Test(nil)
		if item_dict["type"].(string) != "raid" {
			children_dict := item_dict["children"].(map[string]interface{})

			for _, child := range children_dict {
				child_dict := child.(map[string]interface{})
				child_attrs := child_dict["attrs"].(map[string]interface{})
				children = append(children, Test{
					Name:          child_dict["name"].(string),
					SubjectPath:   "https://learn.reboot01.com" + child_attrs["subject"].(string),
					ExpectedFiles: intrToArr(child_attrs["expectedFiles"].([]interface{})),
					Index:         int(child_dict["index"].(float64)),
					Type:          child_attrs["category"].(string),
				})
			}
		}

		slices.SortFunc(children, SortTestsIndex)

		quests = append(quests, Quest{
			Name:     name,
			Index:    index,
			Type:     item_dict["type"].(string),
			Children: children,
		})
	}
	return quests
}

func intrToArr(in []interface{}) []string {
	a := []string(nil)
	for _, i := range in {
		a = append(a, i.(string))
	}
	return a
}

func skillsConverter(m map[string]interface{}) map[string]int {
	m2 := make(map[string]int)
	for k, v := range m {
		m2[k] = int(v.(float64))
	}
	return m2
}

func FindTestWithName(name string, tests []Test) *Test {
	for _, test := range tests {
		if test.Name == name {
			return &test
		}
	}
	return nil
}
