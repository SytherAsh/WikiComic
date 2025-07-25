import React from 'react';

const RecentTopics = ({ recentTopics, setTopic, t }) => (
  recentTopics.length > 0 && (
    <div className="mt-3">
      <div className="flex items-center space-x-2 text-sm font-bold text-purple-600">
        <span>{t.previousQuests}</span>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {recentTopics.map((recentTopic) => (
          <button
            key={recentTopic}
            type="button"
            onClick={() => setTopic(recentTopic)}
            className="px-3 py-1 rounded-full bg-purple-100 border-2 border-purple-500 text-purple-800 font-bold hover:bg-purple-200 hover:border-purple-600 transition transform hover:-translate-y-1 hover:scale-105"
          >
            {recentTopic}
          </button>
        ))}
      </div>
    </div>
  )
);

export default RecentTopics; 