import { Run, RunResult } from "@/app/types";
import { execSync } from "child_process";
import {
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  writeFileSync,
} from "fs";
import { tmpdir } from "os";
import { dirname } from "path";

function copyRecursiveSync(source: string, target: string) {
  const targetFolder = target;
  if (!existsSync(targetFolder)) {
    mkdirSync(targetFolder);
  }

  if (lstatSync(source).isDirectory()) {
    const files = readdirSync(source);
    files.forEach(function (file) {
      const curSource = `${source}/${file}`;
      if (lstatSync(curSource).isDirectory()) {
        copyRecursiveSync(curSource, `${targetFolder}/${file}`);
      } else {
        copyFileSync(curSource, `${targetFolder}/${file}`);
      }
    });
  }
}

// Synchronous function to create a file with potentially missing parent directories
function createFileSync(filePath: string, content: string): void {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, content);
}

export function prepareAndRunTest(run: Run): RunResult {
  let tempDir: string;
  // preparing Stage
  try {
    tempDir = mkdtempSync(tmpdir());
    mkdirSync(`${tempDir}/piscine-go`);
    mkdirSync(`${tempDir}/go-tests/lib`, { recursive: true });

    copyRecursiveSync("./piscine-go-template", `${tempDir}/piscine-go/`);
    copyRecursiveSync("./go-tests/lib", `${tempDir}/go-tests/lib`);

    copyFileSync("./go-tests/go.mod", `${tempDir}/go-tests/go.mod`);
    copyFileSync("./go-tests/go.sum", `${tempDir}/go-tests/go.sum`);

    // Copy test files
    createFileSync(
      `${tempDir}/go-tests/tests/${run.question.name}_test/main.go`,
      ""
    );

    copyFileSync(
      `./go-tests/tests/${run.question.name}_test/main.go`,
      `${tempDir}/go-tests/tests/${run.question.name}_test/main.go`
    );

    // if the question is a program
    if (run.question.attrs.expectedFiles[0].endsWith("main.go")) {
      createFileSync(
        `${tempDir}/go-tests/solutions/${run.question.name}/main.go`,
        ""
      );
      copyFileSync(
        `./go-tests/solutions/${run.question.name}/main.go`,
        `${tempDir}/go-tests/solutions/${run.question.name}/main.go`
      );
    } else {
      // some soulutions dont exist like: `countcharacter`, answer is named `count-character`
      // error is thrown if the file does not exist
      if (!existsSync(`./go-tests/solutions/${run.question.name}.go`)) {
        throw new Error(
          `Solution file for ${run.question.name} not found,\nexpected: ./go-tests/solutions/${run.question.name}/main.go`
        );
      }

      createFileSync(
        `${tempDir}/go-tests/solutions/${run.question.name}.go`,
        ""
      );

      // some tests dont have answer files like: swapbits, its defined as a function in the lib/
      if (existsSync(`./go-tests/solutions/${run.question.name}.go`)) {
        copyFileSync(
          `./go-tests/solutions/${run.question.name}.go`,
          `${tempDir}/go-tests/solutions/${run.question.name}.go`
        );
      }
    }

    // Create student answer file
    createFileSync(
      `${tempDir}/piscine-go/${run.question.attrs.expectedFiles[0]}`,
      run.code
    );

    if (
      !lstatSync(`./go-tests/tests/${run.question.name}_test`).isDirectory()
    ) {
      throw new Error(`Test Dir for ${run.question.name} not found`);
    }
  } catch (error: any) {
    return {
      passed: false,
      output: `Error preparing test: ${error.message || error}`,
    };
  }

  // run go get student in $tempDir/go-tests
  try {
    execSync("go get student", { cwd: `${tempDir}/go-tests` });
  } catch (error: any) {
    execSync(`rm -rf ${tempDir}`);
    return {
      passed: false,
      output: error.message || error.toString(),
    };
  }

  if (run.type === "full") {
    // Run Imports check
    try {
      const res = execSync(
        `./rc/rc ${tempDir}/piscine-go/${
          run.question.attrs.expectedFiles[0]
        } ${run.question.attrs.allowedFunctions.join(" ")}`
      );
    } catch (error: any) {
      execSync(`rm -rf ${tempDir}`);
      return {
        passed: false,
        output: error.stdout.toString().trim() || error.toString(),
      };
    }
  }

  // Run Test
  try {
    execSync(`go run ./tests/${run.question.name}_test/main.go`, {
      cwd: `${tempDir}/go-tests`,
    });
  } catch (error: any) {
    execSync(`rm -rf ${tempDir}`);
    console.log(tempDir);
    return {
      passed: false,
      output: error.message || error.toString(),
    };
  }

  return {
    passed: true,
    output: "",
  };
}
