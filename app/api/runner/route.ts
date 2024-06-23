import { Run, RunResult } from "@/app/types";
import { exec, spawn } from "child_process";
import { NextResponse } from "next/server";

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
  const startTime = Date.now();
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

  const runRes = await runTest(run);

  const endTime = Date.now();
  const durationInSeconds = (endTime - startTime) / 1000;
  console.log(`Duration: ${durationInSeconds} seconds`);

  return NextResponse.json({ passed: runRes.passed, message: runRes.output, durationInSeconds });
}
