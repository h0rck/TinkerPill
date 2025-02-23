import React from 'react';
import { ModelBoxProps } from '../types/interfaces';

const ModelBox: React.FC<ModelBoxProps> = ({ model, x, y }) => {
    const boxWidth = 280;
    const boxHeight = Math.max(200, 70 + (model.columns.length * 20));

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
            {/* Header */}
            <div className="bg-gray-700 p-4 rounded-t-lg">
                <h3 className="text-lg font-bold text-white text-center">
                    {model.name}
                </h3>
                <p className="text-sm text-gray-400 text-center mt-1">
                    {model.tableName}
                </p>
            </div>

            {/* Columns */}
            <div className="mt-4 space-y-2">
                <p className="text-xs text-gray-500 uppercase">Columns</p>
                {model.columns.map((column) => (
                    <div
                        key={column}
                        className="px-3 py-1 bg-gray-700 rounded text-sm text-gray-300"
                    >
                        {column}
                    </div>
                ))}
            </div>

            {/* Relationships */}
            {model.relations.length > 0 && (
                <div className="mt-4 space-y-2">
                    <p className="text-xs text-gray-500 uppercase">Relationships</p>
                    {model.relations.map((rel) => (
                        <div
                            key={`${rel.model}-${rel.method}`}
                            className="px-3 py-1 bg-gray-700 rounded text-sm text-gray-300 flex justify-between"
                        >
                            <span>{rel.method}</span>
                            <span className="text-gray-500">{rel.type}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Methods */}
            {model.methods.length > 0 && (
                <div className="mt-4 space-y-2">
                    <p className="text-xs text-gray-500 uppercase">Methods</p>
                    {model.methods.map((method) => (
                        <div
                            key={method}
                            className="px-3 py-1 bg-gray-700 rounded text-sm text-gray-300"
                        >
                            {method}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ModelBox;