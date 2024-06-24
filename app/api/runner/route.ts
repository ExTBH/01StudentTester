import { Run, RunResult } from "@/app/types";
import { exec } from "child_process";
import { NextResponse } from "next/server";
import { Mutex } from "async-mutex";
import { prepareAndRunTest } from "./helpers";

const MAX_CONCURRENT_TESTS = 10;
const semaphore = new Mutex();

let runningTests = 0;

async function runTestWithSemaphore(run: Run) {
  await semaphore.acquire();
  try {
    runningTests++;
    const result = prepareAndRunTest(run);
    return result;
  } finally {
    runningTests--;
    semaphore.release();
  }
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
