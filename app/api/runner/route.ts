import { Run, RunResult } from "@/app/types";
import { exec,  } from "child_process";
import { NextResponse } from "next/server";
import { Mutex } from 'async-mutex';


const MAX_CONCURRENT_TESTS = 10;
const semaphore = new Mutex();

let runningTests = 0;

async function runTestWithSemaphore(run: Run) {
  await semaphore.acquire();
  try {
    runningTests++;
    const result = await runTest(run);
    return result;
  } finally {
    runningTests--;
    semaphore.release();
  }
}

async function runTest(run: Run): Promise<RunResult> {
  return new Promise((resolve) => {
    const child = exec(
      `./run_test.sh ${run.question.name} ${
        run.question.attrs.expectedFiles[0]
      } ${run.question.attrs.allowedFunctions.join(" ")}`,
      (error, stdout, stderr) => {
        console.log(stdout);
        if (error) {
          resolve({
            passed: false,
            output: stderr,
          });
        }
        resolve({
          passed: true,
          output: stdout,
        });
      }
    );
    child.stdin?.write(run.code);
    child.stdin?.end();
  });
}


export async function POST(req: Request) {
  const run: Run = await req.json();

  if (!run) {
    return NextResponse.json({ passed: false, message: "No Run Provided" });
  }

  if (!run.question) {
    return NextResponse.json({
      passed: false,
      message: "No Question Provided",
    });
  }

  if (!run.code || run.code.trim().length === 0) {
    return NextResponse.json({ passed: false, message: "No Code Provided" });
  }

  if (runningTests >= MAX_CONCURRENT_TESTS) {
    await semaphore.waitForUnlock();
  }

  const runRes = await runTestWithSemaphore(run);

  return NextResponse.json({ passed: runRes.passed, message: runRes.output });
}
