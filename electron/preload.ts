import { ipcRenderer, contextBridge } from 'electron'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  // send(...args: Parameters<typeof ipcRenderer.send>) {
  //   const [channel, ...omit] = args
  //   return ipcRenderer.send(channel, ...omit)
  // },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },

  // You can expose other APTs you need here.
  executeTinker: (code: string) => ipcRenderer.invoke('execute-tinker', code),
  listarContainers: () => ipcRenderer.invoke('listar-containers'),
  scanLaravelProject: () => ipcRenderer.invoke('scan-laravel-project'),
  saveData: (key: string, value: string) => ipcRenderer.invoke("save-data", key, value),
  loadData: (key: string) => ipcRenderer.invoke("load-data", key),
  send: (channel: string, data: object) => ipcRenderer.send(channel, data),
  // ...
})

// Add window control API
contextBridge.exposeInMainWorld('electron', {
  minimize: () => ipcRenderer.send('minimize-window'),
  maximize: () => ipcRenderer.send('maximize-window'),
  close: () => ipcRenderer.send('close-window'),
})
