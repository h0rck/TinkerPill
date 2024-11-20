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
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', height: '100vh' }}>

    <div style={{ width: '50%', padding: '10px' }}>
      <PhpEditor size="500px" onChange={handleCodeChange} />
      <button onClick={handleExecuteTinker}>Executar Tinker</button>
    </div>

    <div style={{ width: '50%', padding: '10px', overflowY: 'auto', borderLeft: '1px solid #ccc' }}>
      <JSONTree data={queryResult} />
      <JSONTree data={result} />
    </div>
  </div>
</>
  );
};

export default App;
