import React, { useState } from "react";
import PhpEditor from "./components/PhpEditor";

const App: React.FC = () => {
  const [code, setCode] = useState("");

  const handleCodeChange = (value: string) => {
    setCode(value);
  };

  return (
    <div>
    <PhpEditor size="500px" onChange={handleCodeChange} />
    <button onClick={() => console.log("Código Final:", code)}>Exibir Código</button>
  </div>
  );
};

export default App;