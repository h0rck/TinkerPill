import React, { useState, useEffect, useCallback } from "react";
import { MdSave, MdRefresh, MdCheckCircle, MdError, MdSearch } from "react-icons/md";
import JsonTreeView from "../components/JsonTreeView";
import { ScanCache } from '../types/interfaces';

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
    <div className="flex flex-col h-full bg-[#1a1a1a]">
      <div className="flex items-center h-[28px] px-4 bg-[#1e1e1e] border-b border-[#2a2a2a]">
        <span className="text-[11px] text-gray-400 font-normal">Configurações</span>
      </div>

      <div className="flex-1 p-4 overflow-auto">
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-gray-400 mb-1">
              Container Docker
            </label>
            <div className="flex space-x-2">
              <select
                value={containerName}
                onChange={(e) => setContainerName(e.target.value)}
                className="flex-1 bg-[#1e1e1e] text-gray-300 text-[11px] rounded px-2 py-1 border border-[#2a2a2a] focus:outline-none focus:border-[#3a3a3a]"
              >
                <option value="">Selecione um container</option>
                {containers.map((container) => (
                  <option key={container} value={container}>{container}</option>
                ))}
              </select>
              <button
                onClick={handleListContainers}
                className="p-1 text-gray-400 hover:text-gray-300 bg-[#1e1e1e] rounded hover:bg-[#2a2a2a]"
              >
                <MdRefresh className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-gray-400 mb-1">
              Ambiente
            </label>
            <input
              type="text"
              value={envName}
              onChange={(e) => setEnvName(e.target.value)}
              placeholder="local"
              className="w-full bg-[#1e1e1e] text-gray-300 text-[11px] rounded px-2 py-1 border border-[#2a2a2a] focus:outline-none focus:border-[#3a3a3a]"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleScan}
              disabled={scanning || !containerName}
              className={`
                flex items-center gap-2 px-3 h-[22px] rounded text-[11px]
                ${scanning || !containerName
                  ? 'bg-[#1e4230] text-gray-500 cursor-not-allowed'
                  : 'bg-[#1e4230] text-[#89b995] hover:bg-[#2b5a40] border border-transparent hover:border-[#3b7554]'
                }
              `}
            >
              <MdSearch className="w-3 h-3" />
              <span>{scanning ? 'Escaneando...' : 'Escanear Projeto'}</span>
            </button>

            <button
              onClick={handleSave}
              disabled={loading}
              className={`
                flex items-center gap-2 px-3 h-[22px] rounded text-[11px]
                ${loading
                  ? 'bg-[#1e4230] text-gray-500 cursor-not-allowed'
                  : 'bg-[#1e4230] text-[#89b995] hover:bg-[#2b5a40] border border-transparent hover:border-[#3b7554]'
                }
              `}
            >
              <MdSave className="w-3 h-3" />
              <span>{loading ? 'Salvando...' : 'Salvar'}</span>
            </button>
          </div>

          {scanProgress && (
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-gray-400">
                <span>{scanProgress.status}</span>
                <span>{scanProgress.percentage}%</span>
              </div>
              <div className="w-full bg-[#2a2a2a] rounded-sm h-1">
                <div
                  className="bg-[#3b7554] h-1 rounded-sm transition-all duration-300"
                  style={{ width: `${scanProgress.percentage}%` }}
                />
              </div>
            </div>
          )}

          {scanCache && (
            <div className="pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] text-gray-400">Cache do Projeto</span>
                <span className="text-[11px] text-gray-500">
                  {new Date(scanCache.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="bg-[#1e1e1e] rounded border border-[#2a2a2a]">
                <JsonTreeView data={scanCache.data} />
              </div>
            </div>
          )}
        </div>
      </div>

      {notification.type && (
        <div className={`
          fixed bottom-4 right-4 flex items-center gap-2 px-3 py-2 rounded text-[11px]
          ${notification.type === 'success' ? 'bg-[#1e4230] text-[#89b995]' : 'bg-[#4e1e1e] text-[#b98989]'}
        `}>
          {notification.type === 'success' ? (
            <MdCheckCircle className="w-3 h-3" />
          ) : (
            <MdError className="w-3 h-3" />
          )}
          <span>{notification.message}</span>
        </div>
      )}
    </div>
  );
};

export default ConfigPage;