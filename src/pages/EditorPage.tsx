import React, { useState } from "react";
import { MdPlayArrow, MdCode, MdOutlineStorage } from "react-icons/md";
import PhpEditor from "../components/PhpEditor";
import JsonTreeView from "../components/JsonTreeView";
import Topbar from "../components/Topbar";
import ResultsPanel from "../components/ResultsPanel";

const EditorPage: React.FC = () => {
  const [code, setCode] = useState("<?php\n\n Aluno::with('turma.alunos')->limit(2)->get()");
  const [queryResult, setQueryResult] = useState<object>({});
  const [result, setResult] = useState<object>({});
  const [splitSize, setSplitSize] = useState<number>(50);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleCodeChange = (value: string) => setCode(value);

  const handleExecuteTinker = async () => {
    if (!window.ipcRenderer) return;

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

  const ExecuteButton = () => (
    <button
      onClick={handleExecuteTinker}
      disabled={isExecuting}
      className={`
        flex items-center gap-1 px-2 h-[22px] rounded-sm text-[11px] mr-4
        ${isExecuting
          ? 'bg-green-700/50 cursor-wait text-green-100'
          : 'bg-green-600/40 hover:bg-green-500/50 text-green-100'
        }
      `}
    >
      <MdPlayArrow className="w-3 h-3" />
      <span className="font-medium">{isExecuting ? 'Executando...' : 'Executar'}</span>
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-[#1a1a1a] text-gray-100">
      <Topbar
        title="PHP Tinker"
        actions={<ExecuteButton />}
      />

      <div className="flex flex-1 overflow-hidden">
        <div style={{ width: `${splitSize}%` }} className="flex flex-col bg-[#1e1e1e] border-r border-[#2a2a2a]">
          <PhpEditor size="100%" onChange={handleCodeChange} />
        </div>

        <div
          className="w-[1px] hover:w-[2px] cursor-col-resize bg-[#2a2a2a] hover:bg-green-500 transition-all"
          onMouseDown={handleMouseDown}
        />

        <ResultsPanel
          width={100 - splitSize}
          queryResult={queryResult}
          result={result}
        />
      </div>
    </div>
  );
};

export default EditorPage;