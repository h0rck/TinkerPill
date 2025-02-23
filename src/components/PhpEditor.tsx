import React, { useEffect, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { php } from "@codemirror/lang-php";
import { autocompletion, CompletionContext } from '@codemirror/autocomplete';
import { EditorView } from '@codemirror/view';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { CodeEditorProps, ModelInfo } from '../types/interfaces';

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
    <div className="h-full flex-1 overflow-hidden">
      <CodeMirror
        value={code}
        height="100vh"
        theme={vscodeDark}
        extensions={[
          php(),
          autocompletion({ override: [completions] })
        ]}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: true,
          indentOnInput: true,
          tabSize: 4,
          highlightSelectionMatches: true,
          foldKeymap: true,
          dropCursor: true,
          allowMultipleSelections: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          rectangularSelection: true,
          crosshairCursor: true,
          highlightActiveLineGutter: true,
        }}
        onChange={handleCodeChange}
        style={{
          fontSize: '13px',
          height: '100%',
          flex: 1,
          minHeight: '100%',
        }}
      />
    </div>
  );
};

export default PhpEditor;
