import React, { useState, useEffect, useCallback } from 'react';
import { MdKeyboardArrowRight, MdKeyboardArrowDown, MdSearch, MdKeyboardArrowUp } from "react-icons/md";

interface JsonTreeViewProps {
    data: any;
    initialExpanded?: boolean;
}

interface SearchResult {
    path: string[];
    value: any;
}

const JsonTreeView: React.FC<JsonTreeViewProps> = ({ data }) => {
    // Remove initialExpanded prop since we'll always start expanded
    const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>(() => {
        // Initialize with all nodes expanded
        const expandAll = (obj: any, path: string = ''): Record<string, boolean> => {
            let expanded: Record<string, boolean> = {};

            if (typeof obj === 'object' && obj !== null) {
                Object.entries(obj).forEach(([key, value]) => {
                    const currentPath = path ? `${path}-${key}` : key;
                    expanded[currentPath] = true;

                    if (typeof value === 'object' && value !== null) {
                        expanded = { ...expanded, ...expandAll(value, currentPath) };
                    }
                });
            }

            return expanded;
        };

        return expandAll(data);
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [currentResultIndex, setCurrentResultIndex] = useState(0);

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
        return expandedNodes[key] ?? true; // Default to true instead of false
    };

    const toggleExpand = (key: string) => {
        setExpandedNodes(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const searchInObject = useCallback((obj: any, term: string, path: string[] = []): SearchResult[] => {
        let results: SearchResult[] = [];

        Object.entries(obj).forEach(([key, value]) => {
            const currentPath = [...path, key];

            // Search in key
            if (key.toLowerCase().includes(term.toLowerCase())) {
                results.push({ path: currentPath, value });
            }

            // Search in value
            if (typeof value === 'string' && value.toLowerCase().includes(term.toLowerCase())) {
                results.push({ path: currentPath, value });
            }

            // Recurse if object or array
            if (value && typeof value === 'object') {
                results = [...results, ...searchInObject(value, term, currentPath)];
            }
        });

        return results;
    }, []);

    useEffect(() => {
        if (searchTerm.length > 0) { // Changed from > 2 to > 0
            const results = searchInObject(data, searchTerm);
            setSearchResults(results);
            setCurrentResultIndex(0);

            // Expand nodes to show results
            const nodesToExpand: Record<string, boolean> = {};
            results.forEach(result => {
                let path = '';
                result.path.forEach(segment => {
                    path = path ? `${path}-${segment}` : segment;
                    nodesToExpand[path] = true;
                });
            });
            setExpandedNodes(prev => ({ ...prev, ...nodesToExpand }));
        } else {
            setSearchResults([]);
        }
    }, [searchTerm, data, searchInObject]);

    const navigateResults = (direction: 'next' | 'prev') => {
        if (searchResults.length === 0) return;

        setCurrentResultIndex(current => {
            if (direction === 'next') {
                return current + 1 >= searchResults.length ? 0 : current + 1;
            } else {
                return current - 1 < 0 ? searchResults.length - 1 : current - 1;
            }
        });
    };

    const renderNode = (value: any, key: string, path: string = '') => {
        const currentPath = path ? `${path}-${key}` : key;
        const isObject = value !== null && typeof value === 'object';
        const nodeKey = getNodeKey(path, key);
        const type = getTypeLabel(value);

        // Add highlight for current search result
        const isCurrentSearchResult = searchResults.length > 0 &&
            searchResults[currentResultIndex].path.join('-') === currentPath;

        return (
            <div key={nodeKey} className="font-mono text-[11px] leading-4">
                <div className={`flex items-center py-[2px] ${isCurrentSearchResult ? 'bg-green-500/20' : 'hover:bg-[#2a2a2a]'}`}>
                    {isObject ? (
                        <button
                            onClick={() => toggleExpand(nodeKey)}
                            className="p-[2px] hover:bg-[#333] rounded mr-1"
                        >
                            {isExpanded(nodeKey) ? (
                                <MdKeyboardArrowDown className="w-3 h-3 text-gray-400" />
                            ) : (
                                <MdKeyboardArrowRight className="w-3 h-3 text-gray-400" />
                            )}
                        </button>
                    ) : (
                        <span className="w-4" />
                    )}

                    <span className="text-gray-300">{key}</span>
                    <span className="text-gray-500 mx-1">:</span>

                    {isObject ? (
                        <span className={getTypeColor(value)}>
                            {Array.isArray(value) ? '[' : '{'}
                            <span className="ml-1 text-gray-500 text-[10px]">{type}</span>
                            <span className="text-gray-500 text-[10px] ml-1">
                                {Object.keys(value).length}
                            </span>
                        </span>
                    ) : (
                        <span className={getTypeColor(value)}>
                            {formatValue(value)}
                            <span className="ml-1 text-gray-500 text-[10px]">{type}</span>
                        </span>
                    )}
                </div>

                {isObject && isExpanded(nodeKey) && (
                    <div className="ml-3 pl-2 border-l border-[#2a2a2a]">
                        {Object.entries(value).map(([childKey, childValue]) =>
                            renderNode(childValue, childKey, currentPath)
                        )}
                    </div>
                )}

                {isObject && isExpanded(nodeKey) && (
                    <div className="ml-4 text-gray-500">
                        {Array.isArray(value) ? ']' : '}'}
                    </div>
                )}
            </div>
        );
    };

    // Add keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (searchResults.length === 0) return;

            if (e.key === 'Enter' && e.shiftKey) {
                navigateResults('prev');
            } else if (e.key === 'Enter') {
                navigateResults('next');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [searchResults.length]);

    return (
        <div className="rounded bg-[#1e1e1e] text-[11px]">
            <div className="sticky top-0 z-20 bg-[#1e1e1e] border-b border-[#2a2a2a]">
                <div className="flex items-center h-[22px]">
                    <div className="flex items-center flex-1">
                        <div className="px-2">
                            <MdSearch className="w-3 h-3 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Pesquisar..."
                            className="bg-[#2a2a2a] text-gray-200 px-2 h-[18px] text-[10px] w-full focus:outline-none"
                        />
                        {searchResults.length > 0 && (
                            <div className="flex items-center px-2 text-gray-400 text-[10px] bg-[#2a2a2a] h-[18px] border-l border-[#3a3a3a]">
                                <span>{currentResultIndex + 1}/{searchResults.length}</span>
                                <button
                                    onClick={() => navigateResults('prev')}
                                    className="px-1 hover:text-gray-200"
                                >
                                    <MdKeyboardArrowUp className="w-3 h-3" />
                                </button>
                                <button
                                    onClick={() => navigateResults('next')}
                                    className="px-1 hover:text-gray-200"
                                >
                                    <MdKeyboardArrowDown className="w-3 h-3" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                {searchResults.length > 0 && (
                    <div className="px-2 text-[9px] text-gray-500 h-[16px] flex items-center border-t border-[#2a2a2a]">
                        {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''}
                        <span className="ml-1 text-gray-600">(Enter/Shift+Enter)</span>
                    </div>
                )}
            </div>

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