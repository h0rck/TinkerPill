import { ElectronStore } from 'electron-store';

interface StoreSchema {
    containerName?: string;
    envName?: string;
    [key: string]: any;
}

declare module 'electron-store' {
    interface StoreSchema {
        containerName?: string;
        envName?: string;
        [key: string]: any;
    }

    interface Options<T> {
        name?: string;
        cwd?: string;
        defaults?: Partial<T>;
    }

    class Store<T extends Record<string, any> = StoreSchema> {
        constructor(options?: Options<T>);

        // Methods
        get<K extends keyof T>(key: K): T[K];
        set<K extends keyof T>(key: K, value: T[K]): void;
        delete(key: keyof T): void;
        clear(): void;
        has(key: keyof T): boolean;

        // Properties
        store: T;
        path: string;
    }

    export default Store;
}

declare global {
    var store: ElectronStore<StoreSchema>;
}

export type { StoreSchema };