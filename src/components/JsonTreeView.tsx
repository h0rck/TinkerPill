import React, { useState } from 'react';
import { MdKeyboardArrowRight, MdKeyboardArrowDown } from "react-icons/md";

interface JsonTreeViewProps {
    data: any;
    initialExpanded?: boolean;
}

const JsonTreeView: React.FC<JsonTreeViewProps> = ({ data, initialExpanded = false }) => {
    const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

    const getTypeLabel = (value: any): string => {
        if (Array.isArray(value)) return 'array';
        if (value === null) return 'null';
        return typeof value;
    };

    const getTypeColor = (value: any): string => {
        if (typeof value === 'string') return 'text-green-500';
        if (typeof value === 'number') return 'text-blue-500';
        if (typeof value === 'boolean') return 'text-purple-500';
        if (value === null) return 'text-red-500';
        if (Array.isArray(value)) return 'text-orange-500';
        if (typeof value === 'object') return 'text-yellow-500';
        return 'text-gray-500';
    };

    const formatValue = (value: any): string => {
        if (typeof value === 'string') return `"${value}"`;
        return String(value);
    };

    const getNodeKey = (path: string, key: string): string => `${path}-${key}`;

    const isExpanded = (key: string): boolean => {
        return expandedNodes[key] ?? initialExpanded;
    };

    const toggleExpand = (key: string) => {
        setExpandedNodes(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const renderNode = (value: any, key: string, path: string = '') => {
        const currentPath = path ? `${path}-${key}` : key;
        const isObject = value !== null && typeof value === 'object';
        const nodeKey = getNodeKey(path, key);
        const type = getTypeLabel(value);

        return (
            <div key={nodeKey} className="font-mono">
                <div className="flex items-center py-1 hover:bg-gray-50 rounded">
                    {isObject ? (
                        <button
                            onClick={() => toggleExpand(nodeKey)}
                            className="p-1 hover:bg-gray-100 rounded mr-1"
                        >
                            {isExpanded(nodeKey) ? (
                                <MdKeyboardArrowDown className="w-4 h-4 text-gray-500" />
                            ) : (
                                <MdKeyboardArrowRight className="w-4 h-4 text-gray-500" />
                            )}
                        </button>
                    ) : (
                        <span className="w-6" />
                    )}

                    <span className="font-semibold text-gray-700">{key}</span>
                    <span className="text-gray-400 mx-2">:</span>

                    {isObject ? (
                        <span className={`${getTypeColor(value)} text-sm`}>
                            {Array.isArray(value) ? '[' : '{'}
                            <span className="ml-2 text-gray-400 text-xs">{type}</span>
                            <span className="text-gray-400 text-xs ml-2">
                                {Object.keys(value).length} items
                            </span>
                        </span>
                    ) : (
                        <span className={`${getTypeColor(value)}`}>
                            {formatValue(value)}
                            <span className="ml-2 text-gray-400 text-xs">{type}</span>
                        </span>
                    )}
                </div>

                {isObject && isExpanded(nodeKey) && (
                    <div className="ml-4 pl-4 border-l border-gray-200">
                        {Object.entries(value).map(([childKey, childValue]) =>
                            renderNode(childValue, childKey, currentPath)
                        )}
                    </div>
                )}

                {isObject && isExpanded(nodeKey) && (
                    <div className="ml-6 text-gray-400">
                        {Array.isArray(value) ? ']' : '}'}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-200">
            {Array.isArray(data) ? (
                <div>
                    {data.map((item, index) => renderNode(item, String(index)))}
                </div>
            ) : (
                <div>
                    {Object.entries(data).map(([key, value]) => renderNode(value, key))}
                </div>
            )}
        </div>
    );
};

export default JsonTreeView;