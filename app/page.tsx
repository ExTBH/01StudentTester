"use client";
import "primereact/resources/themes/lara-dark-pink/theme.css";
import 'primeicons/primeicons.css';
import styles from "./page.module.css";
import { Tree } from "primereact/tree";
import { TreeNode } from "primereact/treenode";
import { Suspense, useEffect, useState } from "react";

export default function Home() {
  const [nodes, setNodes] = useState<TreeNode[]>();

  useEffect(() => {
    setNodes([
      {
        key: "0",
        label: "Checkpoint",
        data: "Checkpoint Levels",
        children: [
          {
            key: "0-0",
            label: "Level 1",
            data: "Level 1 questions",
            icon: "pi pi-list",
            children: [
              {
                key: "0-0-0",
                label: "Expenses.doc",
                icon: "pi pi-fw pi-file",
                data: "Expenses Document",
              },
              {
                key: "0-0-1",
                label: "Resume.doc",
                icon: "pi pi-fw pi-file",
                data: "Resume Document",
              },
            ],
          },
          {
            key: "0-1",
            label: "Home",
            data: "Home Folder",
            icon: "pi pi-fw pi-home",
            children: [
              {
                key: "0-1-0",
                label: "Invoices.txt",
                icon: "pi pi-fw pi-file",
                data: "Invoices for this month",
              },
            ],
          },
        ],
      },
    ]);
  }, []);

  return (
    <main>
      <div className={styles.treeContainer}>
        <Tree value={nodes} className={styles.tree} />
      </div>
    </main>
  );
}
