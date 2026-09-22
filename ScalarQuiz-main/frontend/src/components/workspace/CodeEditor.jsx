import React from 'react';
import Editor from '@monaco-editor/react';
import LoadingOverlay from './LoadingOverlay.jsx';

export default function CodeEditor({ code, setCode, language, theme }) {
  const monacoTheme = theme === 'dark' ? 'vs-dark' : 'light';

  return (
    <div className="flex-1 relative h-full">
      <Editor
        height="100%"
        language={language}
        theme={monacoTheme}
        value={code}
        onChange={(val) => setCode(val || '')}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: 'on',
          scrollBeyondLastLine: false,
          padding: { top: 16 },
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace"
        }}
        loading={<LoadingOverlay message="Loading Editor..." />}
      />
    </div>
  );
}
