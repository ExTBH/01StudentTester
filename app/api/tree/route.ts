import { NextResponse } from "next/server";
import { TreeNode } from "primereact/treenode";
import { Checkpoint } from "@/app/types";

let tests: TreeNode[];

export async function GET(req: Request) {
  if (tests) {
    return NextResponse.json(tests);
  }

  let checkpoint: Checkpoint;

  try {
    // revalidate every 5 hours
    const response = await fetch(
      "https://learn.reboot01.com/api/object/bahrain",
      { next: { revalidate: 1 } }
    );
    const data = await response.json();
    checkpoint = data["children"]["bh-module"]["children"][
      "checkpoint"
    ] as Checkpoint;
  } catch (error) {
    return NextResponse.json(
      { error: `An error occurred while fetching tree data: ${error}` },
      { status: 500 }
    );
  }

  const nodes: TreeNode[] = [];

  const groupedNodes: { [prog: number]: TreeNode[] } = {};

  for (const [key, question] of Object.entries(checkpoint.children)) {
    const group = question.attrs.group;

    if (!groupedNodes[group]) {
      groupedNodes[group] = [];
    }

    const node: TreeNode = {
      key,
      label: question.name,
      children: [],
      data: question,
    };

    groupedNodes[group].push(node);
  }

  for (const group in groupedNodes) {
    const groupNode: TreeNode = {
      key: `group-${group}`,
      label: `Level ${group}`,
      children: groupedNodes[group],
    };

    nodes.push(groupNode);
  }

  tests = nodes;

  return NextResponse.json(nodes);
}
