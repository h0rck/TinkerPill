import React, { useState, useEffect, useCallback } from "react";
import { MdSave, MdSettings, MdRefresh, MdCheckCircle, MdError } from "react-icons/md";

const ConfigPage: React.FC = () => {
  const [containerName, setContainerName] = useState("");
  const [envName, setEnvName] = useState("");
  const [containers, setContainers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: null, message: '' }), 3000);
  };

  const handleSave = async () => {
    if (!containerName || !envName) {
      showNotification('error', 'Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    if (window.ipcRenderer && window.ipcRenderer.saveData) {
      try {
        await window.ipcRenderer.saveData("containerName", containerName);
        await window.ipcRenderer.saveData("envName", envName);
        window.ipcRenderer.send("set-config", { containerName, envName });
        showNotification('success', 'Configurações salvas com sucesso!');
      } catch (error) {
        console.error("Erro ao salvar configurações:", error);
        showNotification('error', 'Erro ao salvar configurações.');
      } finally {
        setLoading(false);
      }
    } else {
      showNotification('error', 'A funcionalidade de salvar não está disponível.');
      setLoading(false);
    }
  };

  const handleLoad = useCallback(async () => {
    setLoading(true);
    if (window.ipcRenderer && window.ipcRenderer.loadData) {
      try {
        const savedContainerName = await window.ipcRenderer.loadData("containerName");
        const savedEnvName = await window.ipcRenderer.loadData("envName");
        setContainerName(savedContainerName || "");
        setEnvName(savedEnvName || "");
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
        showNotification('error', 'Erro ao carregar configurações.');
      } finally {
        setLoading(false);
      }
    } else {
      showNotification('error', 'A funcionalidade de carregar não está disponível.');
      setLoading(false);
    }
  }, []);

  const handleListContainers = async () => {
    if (window.ipcRenderer && window.ipcRenderer.listarContainers) {
      try {
        const { containers } = await window.ipcRenderer.listarContainers();
        setContainers(containers);
      } catch (error) {
        console.error("Erro ao listar containers:", error);
        showNotification('error', 'Erro ao listar containers.');
      }
    } else {
      showNotification('error', 'A funcionalidade de listar containers não está disponível.');
    }
  };

  useEffect(() => {
    handleLoad();
    handleListContainers();
  }, [handleLoad]);

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <MdSettings className="w-6 h-6 text-blue-500" />
          <h1 className="text-xl font-bold text-white">Configurações</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto bg-gray-800 rounded-lg shadow-xl border border-gray-700">
          {/* Form Header */}
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">Configurações do Container</h2>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-6">
            {/* Container Selection */}
            <div className="space-y-2">
              <label htmlFor="containerName" className="block text-sm font-medium text-gray-300">
                Nome do Container
              </label>
              <div className="flex space-x-2">
                <select
                  id="containerName"
                  value={containerName}
                  onChange={(e) => setContainerName(e.target.value)}
                  className="flex-1 bg-gray-700 border-gray-600 text-white rounded-md shadow-sm 
                           focus:ring-blue-500 focus:border-blue-500 px-3 py-2"
                >
                  <option value="">Selecione um container</option>
                  {containers.map((container) => (
                    <option key={container} value={container}>
                      {container}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleListContainers}
                  className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                  title="Atualizar lista"
                >
                  <MdRefresh className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* ENV Name Input */}
            <div className="space-y-2">
              <label htmlFor="envName" className="block text-sm font-medium text-gray-300">
                Nome da ENV
              </label>
              <input
                id="envName"
                type="text"
                value={envName}
                onChange={(e) => setEnvName(e.target.value)}
                className="w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm 
                         focus:ring-blue-500 focus:border-blue-500 px-3 py-2"
                placeholder="Digite o nome da ENV"
              />
            </div>
          </div>

          {/* Form Footer */}
          <div className="px-6 py-4 bg-gray-850 border-t border-gray-700 rounded-b-lg">
            <button
              onClick={handleSave}
              disabled={loading}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-md text-white
                transition-all duration-200 transform
                ${loading
                  ? 'bg-blue-700 cursor-wait'
                  : 'bg-blue-600 hover:bg-blue-500 hover:scale-105'
                }
              `}
            >
              <MdSave className="w-5 h-5" />
              <span>{loading ? 'Salvando...' : 'Salvar Configurações'}</span>
            </button>
          </div>
        </div>

        {/* Notification */}
        {notification.type && (
          <div
            className={`
              fixed bottom-4 right-4 flex items-center space-x-2 px-4 py-3 rounded-lg shadow-lg
              transition-all duration-300 transform
              ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white
            `}
          >
            {notification.type === 'success' ? (
              <MdCheckCircle className="w-5 h-5" />
            ) : (
              <MdError className="w-5 h-5" />
            )}
            <span>{notification.message}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfigPage;