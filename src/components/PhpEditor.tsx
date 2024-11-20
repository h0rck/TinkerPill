import React, { useEffect, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { php } from "@codemirror/lang-php";
import { dracula } from "@uiw/codemirror-theme-dracula"; // Tema Dracula

type CodeEditorProps = { size: string; onChange: (code: string) => void };

const PhpEditor: React.FC<CodeEditorProps> = ({ size, onChange }) => {
  const [code, setCode] = useState("<?php\n\n Aluno::with('turma.alunos')->limit(2)->get()");

  // Carregar código salvo ao montar o componente
  useEffect(() => {
    const loadCode = async () => {
      const savedCode = await window.ipcRenderer.loadData("editor.code");
      if (savedCode) {
        setCode(savedCode); // Atualiza o estado com o código salvo
        onChange(savedCode);
      }
    };
    loadCode();
  }, [onChange]);

  // Salvar código sempre que mudar
  const handleCodeChange = (val: string) => {
    setCode(val || "");
    onChange(val || "");
    window.ipcRenderer.saveData("editor.code", val || ""); // Salva o código usando electron-store
  };

  return (
    <CodeMirror
      value={code}
      height={size}
      extensions={[php()]}
      theme={dracula} // Aplicando o tema Dracula
      onChange={handleCodeChange}
      className="rounded-lg border border-gray-700"
    />
  );
};

export default PhpEditor;
