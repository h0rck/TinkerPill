import React, { useEffect, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { php } from "@codemirror/lang-php";
import { dracula } from "@uiw/codemirror-theme-dracula";
import { autocompletion, CompletionContext } from '@codemirror/autocomplete';

interface ModelInfo {
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

type CodeEditorProps = { size: string; onChange: (code: string) => void };

const PhpEditor: React.FC<CodeEditorProps> = ({ size, onChange }) => {
  const [code, setCode] = useState("<?php\n\n Aluno::with('turma.alunos')->limit(2)->get()");
  const [modelData, setModelData] = useState<ModelInfo[]>([]);

  // Load saved code and model data
  useEffect(() => {
    const loadData = async () => {
      const savedCode = await window.ipcRenderer.loadData("editor.code");
      const savedCache = await window.ipcRenderer.loadData("scanCache");

      if (savedCode) {
        setCode(savedCode);
        onChange(savedCode);
      }

      if (savedCache) {
        const cache = JSON.parse(savedCache);
        setModelData(cache.data);
      }
    };
    loadData();
  }, [onChange]);

  const completions = (context: CompletionContext) => {
    let word = context.matchBefore(/[\w->]+$/);
    if (!word) return null;

    const suggestions = [];

    if (word.text.includes('->')) {
      // Method/property completion after ->
      const [modelPart] = word.text.split('->');
      const model = modelData.find(m => m.name === modelPart.trim());

      if (model) {
        // Add columns
        model.columns.forEach(col => {
          suggestions.push({
            label: col,
            type: "property",
            detail: `Column (${model.tableName})`
          });
        });

        // Add relations
        model.relations.forEach(rel => {
          suggestions.push({
            label: rel.method,
            type: "method",
            detail: `${rel.type} -> ${rel.model}`
          });
        });

        // Add methods
        model.methods.forEach(method => {
          suggestions.push({
            label: method,
            type: "method"
          });
        });

        // Add common Laravel methods
        suggestions.push(
          { label: "where", type: "method" },
          { label: "whereIn", type: "method" },
          { label: "with", type: "method" },
          { label: "find", type: "method" },
          { label: "get", type: "method" },
          { label: "first", type: "method" }
        );
      }
    } else {
      // Model name completion
      modelData.forEach(model => {
        suggestions.push({
          label: model.name,
          type: "class",
          detail: `Model (${model.tableName})`
        });
      });
    }

    return {
      from: word.from,
      options: suggestions
    };
  };

  const handleCodeChange = (val: string) => {
    setCode(val || "");
    onChange(val || "");
    window.ipcRenderer.saveData("editor.code", val || "");
  };

  return (
    <CodeMirror
      value={code}
      height={size}
      extensions={[
        php(),
        autocompletion({ override: [completions] })
      ]}
      theme={dracula}
      onChange={handleCodeChange}
      className="rounded-lg border border-gray-700"
    />
  );
};

export default PhpEditor;
