"use client";
import "primereact/resources/themes/md-dark-deeppurple/theme.css";
import "primeicons/primeicons.css";
import styles from "./page.module.css";
import { Tree } from "primereact/tree";
import { TreeNode } from "primereact/treenode";
import { Key, useEffect, useRef, useState } from "react";
import { Toast } from "primereact/toast";
import Editor from "@monaco-editor/react";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { Dialog } from "primereact/dialog";
import { Sidebar } from "primereact/sidebar";
import { Question } from "./types";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";

export default function Home() {
  const [nodes, setNodes] = useState<TreeNode[]>();
  const [selectedKey, setSelectedKey] = useState("");
  const [dialogVisible, setDialogVisible] = useState(false);
  const [header, setHeader] = useState("");
  const [body, setBody] = useState("");
  const [showLoader, setShowLoader] = useState(false);

  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<TreeNode>();
  const [questionTitle, setQuestionTitle] = useState("Select a Question");
  const [questionBody, setQuestionBody] = useState("");

  const toastRef = useRef(null);

  useEffect(() => {
    fetch("/api/tree")
      .then((res) => res.json())
      .then((data) => {
        setNodes(data);
      })
      .catch((error) => {
        // @ts-expect-error hinestly to lazy to type
        toastRef.current.show({
          severity: "error",
          summary: "An Error Happend while Fetching",
          detail: `${error}`,
        });
      });
  }, []);

  useEffect(() => {
    if (!currentQuestion) return;

    setQuestionTitle(currentQuestion.data.name);
    setQuestionBody("Loading Question Body...");
    fetch(
      `/api/cors-free?url=https://learn.reboot01.com${currentQuestion.data.question.attrs.subject}`
    )
      .then((res) => res.text())
      .then((data) => {
        setQuestionBody(data);
        setQuestionTitle("");
      })
      .catch((error) => {
        // @ts-expect-error hinestly to lazy to type
        toastRef.current.show({
          severity: "error",
          summary: "An Error Happend while Fetching",
          detail: `${error}`,
        });
      });
  }, [currentQuestion]);

  return (
    <main className={styles.mainLayout}>
      <Toast position="top-left" ref={toastRef} />
      <Dialog
        draggable={false}
        header={header}
        visible={dialogVisible}
        style={{
          width: "50vw",
        }}
        onHide={() => {
          if (!dialogVisible) return;
          setDialogVisible(false);
        }}
      >
        {showLoader ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <ProgressSpinner />
          </div>
        ) : (
          <p>{body}</p>
        )}
      </Dialog>

      <Sidebar
        visible={sidebarVisible}
        onHide={() => setSidebarVisible(false)}
        position="right"
        style={{
          width: "50vw",
        }}
      >
        <h2>{questionTitle}</h2>
        {questionBody && (
          <>
            <h4>What can i use to solve this Question?</h4>
            <ul>
              {currentQuestion?.data.question.attrs.allowedFunctions.map((func: Key) => (
                <li key={func}>{func}</li>
              ))}
            </ul>
            <hr />
            <Markdown rehypePlugins={[rehypeRaw]}>{questionBody}</Markdown>
          </>
        )}
      </Sidebar>

      <div className={styles.treeContainer}>
        <Tree
          value={nodes}
          className={styles.tree}
          selectionMode="single"
          selectionKeys={selectedKey}
          onSelectionChange={(e) => {
            if (
              e.value &&
              typeof e.value === "string" &&
              e.value.startsWith("prog")
            ) {
              return;
            }
            setSelectedKey(e.value as string);
            // get the question data
            if (!nodes) return;

            nodes.find((node) => {
              if (!node.children) return false;
              for (const child of node.children) {
                if (child.key === e.value) {
                  setCurrentQuestion(child);
                }
              }
            });
          }}
        />
      </div>
      <div
        style={{
          flex: 1,
          height: "90vh",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <Button
            onClick={() => {
              setShowLoader(true);
              setDialogVisible(true);
              setHeader("Checking your code");
              setBody("This might take a while, please be patient");

              setTimeout(() => {
                setShowLoader(false);
                setHeader("Passed!");
                setBody("Your code is correct, well done!");
                if (!currentQuestion) return;
                currentQuestion.icon = "pi pi-check";
              }, 2000);
            }}
          >
            Submit my Code
          </Button>
          <Button onClick={() => setSidebarVisible(true)} security="secondary">
            Show Question
          </Button>
        </div>
        <Editor
          language="go"
          theme="vs-dark"
          value={
            "// Made by @ExTBH (Natheer)\n// your code goes here, have fun!\n"
          }
        />
      </div>
    </main>
  );
}
