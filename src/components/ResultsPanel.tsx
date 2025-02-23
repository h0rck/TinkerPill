import React from 'react';
import { MdCode } from "react-icons/md";
import JsonTreeView from "./JsonTreeView";

interface ResultsPanelProps {
    width: number;
    queryResult: object;
    result: object;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({ width, queryResult, result }) => {
    const hasResults = Object.keys(result).length > 0;
    const hasQueries = Object.keys(queryResult).length > 0;

    return (
        <div
            style={{ width: `${width}%` }}
            className="flex flex-col h-full bg-[#1e1e1e]"
        >
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar scrollbar-w-2 scrollbar-track-[#1e1e1e] scrollbar-thumb-[#2a2a2a] hover:scrollbar-thumb-[#3a3a3a]">
                <div className="p-2 space-y-4">
                    {hasQueries && (
                        <div className="space-y-2">
                            <h3 className="text-xs font-medium text-gray-400 sticky top-0 bg-[#1e1e1e] py-1 z-10">
                                Queries Executadas
                            </h3>
                            <div className="bg-[#252525] rounded p-1">
                                <JsonTreeView data={queryResult} />
                            </div>
                        </div>
                    )}

                    {hasResults && (
                        <div className="space-y-2">
                            <h3 className="text-xs font-medium text-gray-400 sticky top-0 bg-[#1e1e1e] py-1 z-10">
                                Resultado
                            </h3>
                            <div className="bg-[#252525] rounded p-1">
                                <JsonTreeView data={result} />
                            </div>
                        </div>
                    )}

                    {!hasResults && !hasQueries && (
                        <div className="flex flex-col items-center justify-center h-[calc(100vh-120px)] text-gray-500">
                            <MdCode className="w-8 h-8 mb-2" />
                            <p className="text-xs">Execute o código para ver os resultados</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResultsPanel;