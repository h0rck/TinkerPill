import React, { useState, useEffect, useCallback } from "react";
import { MdSave, MdSettings, MdRefresh, MdCheckCircle, MdError, MdSearch } from "react-icons/md";
import JsonTreeView from "../components/JsonTreeView";

interface ScanCache {
  data: any[];
  timestamp: number;
}

const ConfigPage: React.FC = () => {
  const [containerName, setContainerName] = useState("");
  const [envName, setEnvName] = useState("");
  const [containers, setContainers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanCache, setScanCache] = useState<ScanCache | null>(null);
  const [scanProgress, setScanProgress] = useState<{
    status: string;
    percentage: number;
  } | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: null, message: '' }), 3000);
  };

  const handleListContainers = useCallback(async () => {
    try {
      const { containers: containersList } = await window.ipcRenderer.listarContainers();
      setContainers(containersList);
    } catch (error) {
      console.error('Erro ao listar containers:', error);
      showNotification('error', 'Erro ao listar containers');
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        // Carrega os containers disponíveis
        const { containers: containersList } = await window.ipcRenderer.listarContainers();
        setContainers(containersList);

        // Carrega as configurações salvas
        const savedContainerName = await window.ipcRenderer.loadData("containerName");
        const savedEnvName = await window.ipcRenderer.loadData("envName");
        const savedScanCache = await window.ipcRenderer.loadData("scanCache");

        if (savedContainerName) {
          setContainerName(savedContainerName);
        }

        if (savedEnvName) {
          setEnvName(savedEnvName);
        }

        if (savedContainerName && savedEnvName) {
          // Configura no processo principal
          await window.ipcRenderer.send('set-config', {
            containerName: savedContainerName,
            envName: savedEnvName
          });
        }

        if (savedScanCache) {
          setScanCache(JSON.parse(savedScanCache));
        }

      } catch (error) {
        console.error('Erro ao inicializar:', error);
      }
    };

    init();
  }, []);

  const handleSave = async () => {
    if (!containerName) {
      showNotification('error', 'Selecione um container');
      return;
    }

    setLoading(true);
    try {
      const config = {
        containerName,
        envName: envName || 'local'
      };

      // First set the config in the main process
      await window.ipcRenderer.send('set-config', config);

      // Then save to store
      await window.ipcRenderer.saveData('config', JSON.stringify(config));

      showNotification('success', 'Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      showNotification('error', 'Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async () => {
    if (!containerName) {
      showNotification('error', 'Selecione um container primeiro');
      return;
    }

    setScanning(true);
    setScanProgress({ status: 'Iniciando scan...', percentage: 0 });

    try {
      setScanProgress({ status: 'Verificando cache...', percentage: 10 });
      const result = await window.ipcRenderer.scanLaravelProject();

      if (result.success) {
        // Cria o objeto de cache
        const newCache = {
          data: result.data,
          timestamp: Date.now()
        };

        // Salva o cache no electron-store
        await window.ipcRenderer.saveData("scanCache", JSON.stringify(newCache));

        // Atualiza o estado local
        setScanCache(newCache);

        showNotification('success', 'Projeto escaneado com sucesso!');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Erro ao escanear projeto:', error);
      showNotification('error', 'Erro ao escanear projeto');
    } finally {
      setScanning(false);
      setScanProgress(null);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <div className="flex justify-between items-center px-6 py-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <MdSettings className="w-6 h-6 text-blue-500" />
          <h1 className="text-xl font-bold text-white">Configurações</h1>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-2xl mx-auto bg-gray-800 rounded-lg shadow-xl border border-gray-700">
          <div className="px-6 py-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Container Docker
                </label>
                <div className="flex space-x-2">
                  <select
                    value={containerName}
                    onChange={(e) => setContainerName(e.target.value)}
                    className="flex-1 bg-gray-700 text-white rounded-md px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="p-2 text-gray-300 hover:text-white bg-gray-700 rounded-md hover:bg-gray-600"
                  >
                    <MdRefresh className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Ambiente
                </label>
                <input
                  type="text"
                  value={envName}
                  onChange={(e) => setEnvName(e.target.value)}
                  placeholder="local"
                  className="w-full bg-gray-700 text-white rounded-md px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <button
                  onClick={handleScan}
                  disabled={scanning || !containerName}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-md text-white
                    transition-all duration-200 transform
                    ${scanning || !containerName
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-500 hover:scale-105'
                    }
                  `}
                >
                  <MdSearch className="w-5 h-5" />
                  <span>{scanning ? 'Escaneando...' : 'Escanear Projeto'}</span>
                </button>
              </div>

              {scanProgress && (
                <div className="flex-1 ml-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-300">{scanProgress.status}</span>
                    <span className="text-sm text-gray-300">{scanProgress.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${scanProgress.percentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Nova seção para exibir o cache */}
          {scanCache && (
            <div className="px-6 py-4 border-t border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-300">
                  Cache do Projeto
                </h3>
                <span className="text-xs text-gray-400">
                  Atualizado: {new Date(scanCache.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-auto">
                <JsonTreeView data={scanCache.data} />
              </div>
            </div>
          )}

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