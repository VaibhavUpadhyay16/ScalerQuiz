import React from 'react';

export default function LanguageSelector({ language, setLanguage }) {
  const languages = ['javascript', 'python', 'java', 'cpp', 'c'];

  return (
    <div className="flex items-center gap-2">
      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        Language
      </label>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="bg-slate-100 dark:bg-slate-800 text-sm border-none rounded py-1 px-3 text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-primary outline-none cursor-pointer"
      >
        {languages.map((lang) => (
          <option key={lang} value={lang}>
            {lang === 'cpp' ? 'C++' : lang === 'javascript' ? 'JavaScript' : lang.charAt(0).toUpperCase() + lang.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
}
