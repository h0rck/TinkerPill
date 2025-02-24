interface IElectronAPI {
    executeTinker: (code: string) => Promise<{
        meta: string;
        json: {
            result: object;
            queries: object[];
        };
    }>;
    listarContainers: () => Promise<{ containers: string[] }>; // Added this line
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

declare global {
    interface Window {
        ipcRenderer: IElectronAPI;
    }
}

export { };