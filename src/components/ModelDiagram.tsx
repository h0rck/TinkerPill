import React, { useEffect, useRef, useState } from 'react';
import ModelBox from './ModelBox';
import { ModelInfo, Position, ModelDiagramProps } from '../types/interfaces';

const ModelDiagram: React.FC<ModelDiagramProps> = ({ models }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [positions, setPositions] = useState<Map<string, Position>>(new Map());
    const [svgSize, setSvgSize] = useState({ width: 2400, height: 1600 });
    const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 2400, height: 1600 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const newPositions = new Map<string, Position>();
        const boxWidth = 280;
        const boxHeight = 200;
        const padding = 200;

        const cols = Math.ceil(Math.sqrt(models.length * 1.5));
        const rows = Math.ceil(models.length / cols);

        const startX = (svgSize.width - (cols * (boxWidth + padding))) / 2;
        const startY = (svgSize.height - (rows * (boxHeight + padding))) / 2;

        models.forEach((model, index) => {
            const row = Math.floor(index / cols);
            const col = index % cols;

            newPositions.set(model.name, {
                x: startX + col * (boxWidth + padding),
                y: startY + row * (boxHeight + padding)
            });
        });

        setPositions(newPositions);
    }, [models]);

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const scale = e.deltaY > 0 ? 1.1 : 0.9;

        setViewBox(prev => ({
            x: prev.x + (prev.width * (1 - scale)) / 2,
            y: prev.y + (prev.height * (1 - scale)) / 2,
            width: prev.width * scale,
            height: prev.height * scale
        }));
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;

        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;

        setViewBox(prev => ({
            ...prev,
            x: prev.x - dx,
            y: prev.y - dy
        }));

        setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const renderRelations = () => {
        return models.map(model =>
            model.relations.map((rel, index) => {
                const startPos = positions.get(model.name);
                const endPos = positions.get(rel.model);
                if (!startPos || !endPos) return null;

                const startX = startPos.x + 100;
                const startY = startPos.y + 75;
                const endX = endPos.x + 100;
                const endY = endPos.y + 75;

                // Calculate bezier curve control points
                const dx = endX - startX;
                const dy = endY - startY;
                const ctrl1X = startX + dx * 0.25;
                const ctrl1Y = startY + dy * 0.1;
                const ctrl2X = startX + dx * 0.75;
                const ctrl2Y = endY - dy * 0.1;

                // Create curved path
                const curve = `M ${startX} ${startY} C ${ctrl1X} ${ctrl1Y} ${ctrl2X} ${ctrl2Y} ${endX} ${endY}`;

                // Relationship indicator
                let relationSymbol = '';
                switch (rel.type) {
                    case 'hasMany': relationSymbol = '1:*'; break;
                    case 'belongsTo': relationSymbol = '*:1'; break;
                    case 'hasOne': relationSymbol = '1:1'; break;
                    case 'belongsToMany': relationSymbol = '*:*'; break;
                }

                return (
                    <g key={`${model.name}-${rel.model}-${index}`}>
                        <path
                            d={curve}
                            fill="none"
                            stroke="#4A5568"
                            strokeWidth={2}
                            markerEnd="url(#arrowhead)"
                        />
                        <text
                            x={(startX + endX) / 2}
                            y={(startY + endY) / 2 - 10}
                            textAnchor="middle"
                            fill="#A0AEC0"
                            fontSize={12}
                        >
                            {`${rel.method} (${relationSymbol})`}
                        </text>
                    </g>
                );
            })
        );
    };

    return (
        <div className="bg-gray-800 p-4 rounded-lg h-[800px]">
            <h2 className="text-xl font-bold text-white mb-4">Model Relationships</h2>

            <svg
                ref={svgRef}
                width="100%"
                height="700"
                viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
                className="bg-gray-900"
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <defs>
                    <marker
                        id="arrowhead"
                        markerWidth="10"
                        markerHeight="7"
                        refX="9"
                        refY="3.5"
                        orient="auto"
                    >
                        <polygon points="0 0, 10 3.5, 0 7" fill="#4A5568" />
                    </marker>
                </defs>
                {Array.from(positions.entries()).map(([modelName, position]) => {
                    const model = models.find(m => m.name === modelName);
                    if (!model) return null;
                    return <ModelBox key={model.name} model={model} x={position.x} y={position.y} />;
                })}
                {renderRelations()}
            </svg>
        </div>
    );
};

export default ModelDiagram;