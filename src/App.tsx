import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import EditorPage from "./pages/EditorPage";
import { FaPlay, FaCog, FaProjectDiagram } from "react-icons/fa";
import ConfigPage from "./pages/ConfigPage";
import ModelDiagram from "./components/ModelDiagram";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState("editor");
  const [scanCache, setScanCache] = useState<any>(null);

  useEffect(() => {
    const loadCache = async () => {
      const cache = await window.ipcRenderer.loadData("scanCache");
      if (cache) {
        setScanCache(JSON.parse(cache));
      }
    };
    loadCache();
  }, []);

  const menuItems = [
    {
      icon: <FaPlay size={20} />,
      active: activeTab === "editor",
      onClick: () => setActiveTab("editor"),
    },
    {
      icon: <FaCog size={20} />,
      active: activeTab === "settings",
      onClick: () => setActiveTab("settings"),
    },
    ...(scanCache ? [
      {
        icon: <FaProjectDiagram size={20} />,
        active: activeTab === "diagram",
        onClick: () => setActiveTab("diagram"),
      }
    ] : [])
  ];

  return (
    <div className="h-screen flex">
      <Sidebar menuItems={menuItems} />

      <div className="flex-1 overflow-y-auto">
        {activeTab === "editor" && <EditorPage />}
        {activeTab === "settings" && <ConfigPage />}
        {activeTab === "diagram" && scanCache && (
          <div className="p-4">
            <ModelDiagram models={scanCache.data} />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
