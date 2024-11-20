import React, { useState } from "react";
import Topbar from "./components/Topbar";
import Sidebar from "./components/Sidebar";
import EditorPage from "./pages/EditorPage";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState("editor");

  const menuItems = [
    {
      label: "Editor e Resultado",
      active: activeTab === "editor",
      onClick: () => setActiveTab("editor"),
    },
    {
      label: "Configuração",
      active: activeTab === "settings",
      onClick: () => setActiveTab("settings"),
    },
  ];

  return (
    <div className="h-screen flex flex-col">
      
      <Topbar
        title="Meu Tinker App"
        actions={<></>}
      />

      <div className="flex flex-1">
        <Sidebar menuItems={menuItems} />
        <div className="flex-1 overflow-y-auto">
          {activeTab === "editor" && <EditorPage />}
          {activeTab === "settings" && (
            <div>
              <h2 className="text-lg font-bold mb-4">Configuração</h2>
              <p>Aqui você pode adicionar configurações personalizadas futuramente.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
