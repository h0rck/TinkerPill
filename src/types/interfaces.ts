import { ReactNode } from 'react';

// Model and Database Related Types
export interface ModelInfo {
    name: string;
    tableName: string;
    columns: string[];
    relations: Array<{
        type: string;
        method: string;
        model: string;
    }>;
    methods: string[];
}

// Diagram Component Types
export interface Position {
    x: number;
    y: number;
}

export interface ModelBoxProps {
    model: ModelInfo;
    x: number;
    y: number;
}

export interface ModelDiagramProps {
    models: ModelInfo[];
}

// Editor Component Types
export interface CodeEditorProps {
    size: string;
    onChange: (code: string) => void;
}

export interface ScanCache {
    data: ModelInfo[];
    timestamp: number;
}

// Configuration Types
export interface ConfigState {
    containerName: string;
    envName: string;
    scanCache: ScanCache | null;
}

// UI Component Types
export interface MenuItem {
    icon: ReactNode;
    active: boolean;
    onClick: () => void;
}

export interface SidebarProps {
    menuItems: MenuItem[];
}

export interface JsonTreeViewProps {
    data: any;
    expanded?: boolean;
}