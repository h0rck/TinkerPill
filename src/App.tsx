import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import EditorPage from "./pages/EditorPage";
import { FaPlay, FaCog } from "react-icons/fa"; // Ícones

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState("editor");

  const menuItems = [
    {
      icon: <FaPlay size={20} />, // Ícone de Play
      active: activeTab === "editor",
      onClick: () => setActiveTab("editor"),
    },
    {
      icon: <FaCog size={20} />, // Ícone de Configuração
      active: activeTab === "settings",
      onClick: () => setActiveTab("settings"),
    },
  ];

  return (
    <div className="h-screen flex">
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
  );
};

export default App;
