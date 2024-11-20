import React, { useState } from "react";
import PhpEditor from "../components/PhpEditor";
import { JSONTree } from "react-json-tree";

const EditorPage: React.FC = () => {
  const [code, setCode] = useState("<?php\n\n Aluno::with('turma.alunos')->limit(2)->get()");
  const [queryResult, setQueryResult] = useState<object>({});
  const [result, setResult] = useState<object>({});
  const [splitSize, setSplitSize] = useState<number>(50); // Tamanho inicial em porcentagem

  const handleCodeChange = (value: string) => {
    setCode(value);
  };

  const handleExecuteTinker = async () => {
    if (window.ipcRenderer) {
      const jsonRetorno = await window.ipcRenderer.executeTinker(code);

      setQueryResult(jsonRetorno.json.queries);
      setResult(jsonRetorno.json.result);
    } else {
      console.error("Electron não está configurado corretamente!");
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    const newSplitSize = (e.clientX / window.innerWidth) * 100;
    setSplitSize(Math.min(Math.max(newSplitSize, 10), 90)); // Limita entre 10% e 90%
  };

  const handleMouseUp = () => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const handleMouseDown = () => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
      {/* Barra Superior */}
      <div className="flex justify-between items-center p-4 bg-gray-800 border-b border-gray-700">
        <h1 className="text-lg font-bold">Editor e Resultados</h1>
        <button
          onClick={handleExecuteTinker}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Executar
        </button>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex flex-1">
        {/* Editor */}
        <div style={{ width: `${splitSize}%` }} className="p-4 border-r border-gray-700">
          <PhpEditor size="500px" onChange={handleCodeChange} />
        </div>

        {/* Barra de Redimensionamento */}
        <div
          className="w-1 cursor-col-resize bg-gray-700"
          onMouseDown={handleMouseDown}
        ></div>

        {/* Resultados */}
        <div style={{ width: `${100 - splitSize}%` }} className="p-4 overflow-y-auto">
          <h2 className="text-lg font-bold mb-2">Resultados:</h2>
          <div className="mb-4">
            <JSONTree data={queryResult} theme="monokai" />
          </div>
          <div>
            <JSONTree data={result} theme="monokai" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
