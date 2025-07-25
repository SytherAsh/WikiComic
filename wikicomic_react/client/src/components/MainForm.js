import React from 'react';

const MainForm = ({ topic, error, t, suggestions = [], showSuggestions = false, onInputChange, onSuggestionSelect }) => (
  <>
    {/* Search Input */}
    <div className="relative">
      <input
        type="text"
        value={topic}
        onChange={onInputChange}
        placeholder={t.searchPlaceholder}
        className="w-full px-6 py-4 text-lg border-3 border-black rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        style={{ boxShadow: '5px 5px 0 rgba(0,0,0,0.8)' }}
        autoComplete="off"
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 bg-white border-2 border-black rounded-lg shadow-lg z-50 mt-1 max-h-48 overflow-y-auto">
          {suggestions.map((s, idx) => (
            <li
              key={s + idx}
              className="px-4 py-2 cursor-pointer hover:bg-blue-100"
              onClick={() => onSuggestionSelect(s)}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
    {/* Error Message */}
    {error && (
      <div className="mt-4 text-center text-red-600 font-bold bg-red-100 border-2 border-red-400 rounded-lg p-3">
        {t.errorGenerating}
      </div>
    )}
  </>
);

export default MainForm; 