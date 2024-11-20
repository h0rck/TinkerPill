import React, { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { php } from "@codemirror/lang-php";
import { dracula } from "@uiw/codemirror-theme-dracula"; // Tema Dracula

type CodeEditorProps = { size: string; onChange: (code: string) => void };

const PhpEditor: React.FC<CodeEditorProps> = ({ size, onChange }) => {
  const [code, setCode] = useState("<?php\n\n Aluno::with('turma.alunos')->limit(2)->get()");
  return (
    <CodeMirror
      value={code}
      height={size}
      extensions={[php()]}
      theme={dracula} // Aplicando o tema Dracula
      onChange={(val) => {
        setCode(val || "");
        onChange(val || "");
      }}
      className="rounded-lg border border-gray-700"
    />
  );
};

export default PhpEditor;
