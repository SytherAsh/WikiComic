import React from 'react';

const MainForm = ({ topic, setTopic, error, t }) => (
  <>
    {/* Search Input */}
    <div className="relative">
      <input
        type="text"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder={t.searchPlaceholder}
        className="w-full px-6 py-4 text-lg border-3 border-black rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        style={{ boxShadow: '5px 5px 0 rgba(0,0,0,0.8)' }}
      />
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