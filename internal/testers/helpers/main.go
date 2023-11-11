package helpers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

type Test struct {
	Name             string
	ExpectedFiles    []string
	AllowedFunctions []string
	BaseSkills       map[string]int
}

func Tests() []Test {
	resp, err := http.Get("https://learn.reboot01.com/api/object/bahrain")
	if err != nil {
		log.Fatalln(err.Error())
		return nil
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		log.Fatalln("Status not 200", resp.Status)
	}

	// Decode the JSON response into a map of interface{}
	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		fmt.Println(err)
		return nil
	}
	modules := result["children"].(map[string]interface{})
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

		t := Test{
			Name:             name.(string),
			AllowedFunctions: allowedFunctions,
			ExpectedFiles:    expectedFiles,
			BaseSkills:       baseSkills,
		}
		tests = append(tests, t)
	}
	return tests
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
