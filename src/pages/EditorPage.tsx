import React, { useState } from "react";
import { MdPlayArrow, MdCode, MdOutlineStorage } from "react-icons/md";
import PhpEditor from "../components/PhpEditor";
import JsonTreeView from "../components/JsonTreeView";

const EditorPage: React.FC = () => {
  const [code, setCode] = useState("<?php\n\n Aluno::with('turma.alunos')->limit(2)->get()");
  const [queryResult, setQueryResult] = useState<object>({});
  const [result, setResult] = useState<object>({});
  const [splitSize, setSplitSize] = useState<number>(50);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleCodeChange = (value: string) => {
    setCode(value);
  };

  const handleExecuteTinker = async () => {
    if (!window.ipcRenderer) {
      console.error("Electron não está configurado corretamente!");
      return;
    }

    setIsExecuting(true);
    try {
      const jsonRetorno = await window.ipcRenderer.executeTinker(code);
      setQueryResult(jsonRetorno.json.queries);
      setResult(jsonRetorno.json.result);
    } catch (error) {
      console.error("Erro ao executar o código:", error);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    const newSplitSize = (e.clientX / window.innerWidth) * 100;
    setSplitSize(Math.min(Math.max(newSplitSize, 20), 80));
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
      {/* Header Bar */}
      <div className="flex justify-between items-center px-6 py-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <MdCode className="w-6 h-6 text-green-500" />
          <h1 className="text-xl font-bold">PHP Tinker</h1>
        </div>
        <button
          onClick={handleExecuteTinker}
          disabled={isExecuting}
          className={`
            flex items-center space-x-2 px-4 py-2 rounded-md
            transition-all duration-200 transform
            ${isExecuting
              ? 'bg-green-700 cursor-wait'
              : 'bg-green-600 hover:bg-green-500 hover:scale-105'
            }
          `}
        >
          <MdPlayArrow className="w-5 h-5" />
          <span>{isExecuting ? 'Executando...' : 'Executar'}</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor Panel */}
        <div
          style={{ width: `${splitSize}%` }}
          className="flex flex-col bg-gray-850 border-r border-gray-700"
        >
          <div className="flex items-center space-x-2 px-4 py-2 bg-gray-800 border-b border-gray-700">
            <MdCode className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium">Editor PHP</span>
          </div>
          <PhpEditor size="100%" onChange={handleCodeChange} />
        </div>

        {/* Resize Handle */}
        <div
          className="w-1 hover:w-2 cursor-col-resize bg-gray-700 hover:bg-green-500 transition-all duration-200"
          onMouseDown={handleMouseDown}
        />

        {/* Results Panel */}
        <div
          style={{ width: `${100 - splitSize}%` }}
          className="flex flex-col bg-gray-850"
        >
          <div className="flex items-center space-x-2 px-4 py-2 bg-gray-800 border-b border-gray-700">
            <MdOutlineStorage className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium">Resultados</span>
          </div>

          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            {/* Queries Section */}
            {Object.keys(queryResult).length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-400">Queries Executadas</h3>
                <div className="bg-gray-800 rounded-lg p-4">
                  <JsonTreeView data={queryResult} />
                </div>
              </div>
            )}

            {/* Results Section */}
            {Object.keys(result).length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-400">Resultado</h3>
                <div className="bg-gray-800 rounded-lg p-4">
                  <JsonTreeView data={result} />
                </div>
              </div>
            )}

            {/* Empty State */}
            {Object.keys(result).length === 0 && Object.keys(queryResult).length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <MdCode className="w-12 h-12 mb-2" />
                <p className="text-sm">Execute o código para ver os resultados</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;