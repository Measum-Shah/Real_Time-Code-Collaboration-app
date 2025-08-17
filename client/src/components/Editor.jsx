import React, { useEffect, useRef, useState, useCallback } from "react";
import CodeMirror from "codemirror";

import "codemirror/lib/codemirror.css";
import "codemirror/theme/dracula.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";

const Editor = ({ socketRef, roomId, username, onCodeChange }) => {
  const editorRef = useRef(null);
  const [isEditorReady, setIsEditorReady] = useState(false);

  const handleCodeChange = useCallback(
    ({ code }) => {
      if (isEditorReady && editorRef.current && editorRef.current.getValue() !== code) {
        console.log("Applying code-change:", code);
        editorRef.current.setValue(code);
      } else {
        console.log("Skipping code-change: editor not ready or code unchanged");
      }
    },
    [isEditorReady]
  );

  useEffect(() => {
    const textArea = document.getElementById("realtime-editor");
    if (!textArea) {
      console.error("Text area #realtime-editor not found");
      return;
    }

    console.log("Initializing CodeMirror for room:", roomId);
    const editor = CodeMirror.fromTextArea(textArea, {
      mode: "javascript",
      theme: "dracula",
      autoCloseTags: true,
      autoCloseBrackets: true,
      lineNumbers: true,
    });

    editor.setSize("100%", "100%");
    editorRef.current = editor;
    setIsEditorReady(true);
    console.log("CodeMirror initialized");

    const onChange = (instance, changes) => {
      const code = instance.getValue();
      console.log("Editor code changed:", code);
      onCodeChange(code);

      if (changes.origin !== "setValue" && socketRef?.current?.connected) {
        console.log("Emitting code-change to room:", roomId);
        socketRef.current.emit("code-change", { roomId, code });
      } else {
        console.log("Skipping code-change emission: socket not connected or setValue origin");
      }
    };

    editor.on("change", onChange);

    return () => {
      console.log("Cleaning up CodeMirror");
      editor.off("change", onChange);
      if (editorRef.current) {
        editorRef.current.toTextArea();
        editorRef.current = null;
      }
      setIsEditorReady(false);
    };
  }, [socketRef, roomId, onCodeChange]);

  useEffect(() => {
    if (!socketRef?.current) {
      console.log("No socketRef.current, skipping socket listeners");
      return;
    }

    console.log("Setting up code-change listener");
    socketRef.current.on("code-change", handleCodeChange);

    return () => {
      if (socketRef.current) {
        console.log("Removing code-change listener");
        socketRef.current.off("code-change", handleCodeChange);
      }
    };
  }, [socketRef, handleCodeChange]);

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <textarea id="realtime-editor" />
    </div>
  );
};

export default Editor;