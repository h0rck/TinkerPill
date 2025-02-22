import React, { useState, useEffect, useCallback } from "react";

const ConfigPage: React.FC = () => {
  const [containerName, setContainerName] = useState("");
  const [envName, setEnvName] = useState("");
  const [containers, setContainers] = useState<string[]>([]);

  // Função para salvar os dados
  const handleSave = async () => {
    if (window.ipcRenderer && window.ipcRenderer.saveData) {
      try {
        await window.ipcRenderer.saveData("containerName", containerName);
        await window.ipcRenderer.saveData("envName", envName);

        // Enviar configurações ao processo principal
        window.ipcRenderer.send("set-config", { containerName, envName });

        alert("Configurações salvas com sucesso!");
      } catch (error) {
        console.error("Erro ao salvar configurações:", error);
        alert("Erro ao salvar configurações.");
      }
    } else {
      alert("A funcionalidade de salvar não está disponível.");
    }
  };

  // Função para carregar os dados automaticamente
  const handleLoad = useCallback(async () => {
    if (window.ipcRenderer && window.ipcRenderer.loadData) {
      try {
        const savedContainerName = await window.ipcRenderer.loadData("containerName");
        const savedEnvName = await window.ipcRenderer.loadData("envName");

        setContainerName(savedContainerName || "");
        setEnvName(savedEnvName || "");
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
        alert("Erro ao carregar configurações.");
      }
    } else {
      alert("A funcionalidade de carregar não está disponível.");
    }
  }, []);

  // Função para listar os containers
  const handleListContainers = async () => {
    if (window.ipcRenderer && window.ipcRenderer.listarContainers) {
      try {
        const { containers } = await window.ipcRenderer.listarContainers();
        setContainers(containers);
      } catch (error) {
        console.error("Erro ao listar containers:", error);
        alert("Erro ao listar containers.");
      }
    } else {
      alert("A funcionalidade de listar containers não está disponível.");
    }
  };

  // Carregar os dados automaticamente ao montar o componente
  useEffect(() => {
    handleLoad();
    handleListContainers();
  }, [handleLoad]);

  return (
    <div className="flex flex-col h-screen bg-gray-100 text-gray-800">
      <div className="flex justify-between items-center p-4 bg-gray-800 text-white">
        <h1 className="text-lg font-bold">Configuração</h1>
      </div>

      <div className="flex flex-1 p-4">
        <div className="flex-1 bg-white p-6 rounded shadow-md">
          <h2 className="text-xl font-bold mb-4">Adicionar Configuração</h2>

          {/* Formulário */}
          <div className="space-y-4">
            <div>
              <label htmlFor="containerName" className="block text-sm font-medium text-gray-700">
                Nome do Container
              </label>
              <select
                id="containerName"
                value={containerName}
                onChange={(e) => setContainerName(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Selecione um container</option>
                {containers.map((container) => (
                  <option key={container} value={container}>
                    {container}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="envName" className="block text-sm font-medium text-gray-700">
                Nome da ENV
              </label>
              <input
                id="envName"
                type="text"
                value={envName}
                onChange={(e) => setEnvName(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Digite o nome da ENV"
              />
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Salvar Configurações
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigPage;