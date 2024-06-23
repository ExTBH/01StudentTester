"use client";
import "primereact/resources/themes/md-dark-deeppurple/theme.css";
import "primeicons/primeicons.css";
import styles from "./page.module.css";
import { Tree } from "primereact/tree";
import { TreeNode } from "primereact/treenode";
import { Key, Suspense, useEffect, useRef, useState } from "react";
import { Toast } from "primereact/toast";
import Editor from "@monaco-editor/react";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { Dialog } from "primereact/dialog";
import { Sidebar } from "primereact/sidebar";
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
  const editorRef = useRef(null);

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
      `/api/cors-free?url=https://learn.reboot01.com${currentQuestion.data.attrs.subject}`
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

  function submitCode() {
    setShowLoader(true);
    setDialogVisible(true);
    setHeader("Checking your code");

    // @ts-expect-error fuck entyped refs
    const currentCode: string = editorRef.current.getValue();

    fetch("/api/runner", {
      method: "POST",
      body: JSON.stringify({
        code: currentCode,
        question: currentQuestion?.data,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        // Dialgo can be closed while test is running
        setDialogVisible(true);

        setShowLoader(false);

        if (!data.passed) {
          setHeader("You didn't pass :(");
          // @ts-expect-error fuck entyped refs
          currentQuestion.icon = "pi pi-times";
        } else {
          setHeader("You passed!!");
          // @ts-expect-error fuck entyped refs
          currentQuestion.icon = "pi pi-check";
        }

        setBody(data.message);
      })
      .catch((error) => {
        setShowLoader(false);
        setHeader("Something went wrong");
        if (error) {
          setBody(error);
        }
      });
  }

  return (
    <main className={styles.pageContainer}>
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
          <pre>{body}</pre>
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
              {currentQuestion?.data.attrs.allowedFunctions.map((func: Key) => (
                <li key={func}>{func}</li>
              ))}
            </ul>
            <hr />
            <Markdown rehypePlugins={[rehypeRaw]}>{questionBody}</Markdown>
          </>
        )}
      </Sidebar>
      <div className={styles.treeContainer}>
        {!nodes ? (
          <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          
          }}>
            <ProgressSpinner />
          </div>
        ) : (
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
        )}
      </div>
      <div className={styles.codeContainer}>
        <div className={styles.codeButtonsContainer}>
          <Button
            icon="pi pi-check"
            label="Run"
            onClick={submitCode}
            disabled={!currentQuestion}
          ></Button>

          <Button
            icon="pi pi-file"
            label="Show Question"
            onClick={() => setSidebarVisible(true)}
            disabled={!currentQuestion}
          ></Button>
        </div>

        <Editor
          className={styles.editor}
          language="go"
          theme="vs-dark"
          defaultValue={
            "// Made by @ExTBH (Natheer)\n// your code goes here, have fun!\n"
          }
          onMount={(editor) => {
            // @ts-expect-error fuck untyped refs
            editorRef.current = editor;
            window.addEventListener("resize", () => {
              editor.layout({} as any);
            });
          }}
        />
      </div>
    </main>
  );
}
