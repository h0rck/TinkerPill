/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * The built directory structure
     *
     * ```tree
     * ├─┬─┬ dist
     * │ │ └── index.html
     * │ │
     * │ ├─┬ dist-electron
     * │ │ ├── main.js
     * │ │ └── preload.js
     * │
     * ```
     */
    APP_ROOT: string
    /** /dist/ or /public/ */
    VITE_PUBLIC: string
  }
}

// Used in Renderer process, expose in `preload.ts`
interface Window {
  // ipcRenderer: import('electron').IpcRenderer
  ipcRenderer: {
    executeTinker: (code: string) => Promise<{
      meta: string;
      json: {
        result: object;
        queries: object[];
      };
    }>;

    listarContainers: () => Promise<{ containers: string[] }>;
    scanLaravelProject: () => Promise<any>;

    saveData: (key: string, value: string) => Promise<string | null>;
    loadData: (key: string) => Promise<string | null>;
    send: (channel: string, data: object) => void;
    electron: {
      minimize: () => void;
      maximize: () => void;
      close: () => void;
    };
  }

  // You can add other APIs you need here.
}
