import React, { useState } from "react";
import PhpEditor from "./components/PhpEditor";
import { JSONTree } from 'react-json-tree';

const App: React.FC = () => {
  const [code, setCode] = useState("<?php\n\n Aluno::with('turma.alunos')->limit(2)->get()");

  const [queryResult, setQueryResult] = useState<object>({});
  const [result, setResult] = useState<object>({});

  const handleCodeChange = (value: string) => {
    setCode(value);
  };

  const handleExecuteTinker = async () => {
    if (window.ipcRenderer) {
      
      const jsonRetorno =  await window.ipcRenderer.executeTinker(code); 

      setQueryResult(jsonRetorno.json.queries);
      setResult(jsonRetorno.json.result);
      
    } else {
      console.error("Electron não está configurado corretamente!");
    }
  };

  return (
  <>
    <h1 className="text-3xl font-bold underline bg-sky-500">
      Hello world!
    </h1>

    <div className="flex justify-between items-start h-screen">
      <div className="w-1/2 p-2">
        <PhpEditor size="500px" onChange={handleCodeChange} />
        <button 
          onClick={handleExecuteTinker}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Executar Tinker
        </button>
      </div>

      <div className="w-1/2 p-2 overflow-y-auto border-l border-gray-300">
        <JSONTree data={queryResult} />
        <JSONTree data={result} />
      </div>
    </div>
  </>

  );
};

export default App;
