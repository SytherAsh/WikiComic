import React from 'react';

const StyleSelector = ({ styleOptions, comicStyle, setComicStyle, showStylePanel, setShowStylePanel, handleStyleSelection, currentStyleObj, t, comicShake }) => (
  <div className="mb-6">
    <div className="text-center">
      <button 
        type="button"
        onClick={() => setShowStylePanel(!showStylePanel)}
        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-lg border-2 border-black transform hover:scale-105 transition shadow-lg"
        style={{ boxShadow: '4px 4px 0 rgba(0,0,0,0.8)' }}
      >
        {t.selectYourStyle}
      </button>
    </div>
    {showStylePanel && (
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 relative">
        {styleOptions.map((style, index) => (
          <div 
            key={style.id} 
            onClick={() => handleStyleSelection(style)}
            className={`cursor-pointer transform transition hover:scale-105 relative ${style.locked ? 'opacity-75' : ''}`}
          >
            <div 
              className="h-40 rounded-lg border-3 border-black flex items-center justify-center relative overflow-hidden"
              style={{ 
                backgroundColor: style.color,
                boxShadow: comicStyle === style.id ? '0 0 0 4px black, 0 0 0 8px yellow' : '4px 4px 0 rgba(0,0,0,0.8)'
              }}
            >
              {/* Comic style background - full opacity */}
              <div className={`absolute inset-0 ${style.bgClass || ''}`} style={{
                backgroundImage: style.bgImage ? `url(${style.bgImage})` : '',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transition: 'all 0.3s ease'
              }}></div>
              {style.locked && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                  <div className="bg-yellow-400 text-black text-sm font-bold py-1 px-3 rotate-12 border-2 border-black" style={{ boxShadow: '2px 2px 0 rgba(0,0,0,0.8)' }}>
                    {t.unlockAtLevel} {style.level}
                  </div>
                </div>
              )}
              {/* Style name overlay - stronger contrast */}
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-80 text-white p-2 text-center font-bold z-10">
                {style.name}
              </div>
            </div>
            <div className="mt-2 bg-white border-2 border-black rounded px-2 py-1 text-center font-bold text-sm relative" style={{ boxShadow: '3px 3px 0 rgba(0,0,0,0.8)' }}>
              {style.name}
              {/* Level requirement badge */}
              <div 
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 border-2 border-black text-white text-xs flex items-center justify-center font-bold"
                style={{ boxShadow: '1px 1px 0 rgba(0,0,0,0.8)' }}
              >
                {style.level}
              </div>
            </div>
            <div className="text-xs text-center mt-1 bg-white bg-opacity-80 px-2 py-1 rounded">{style.description}</div>
          </div>
        ))}
      </div>
    )}
    {/* Selected style display */}
    {!showStylePanel && (
      <div className="flex items-center justify-center mt-4">
        <div 
          className="h-16 w-64 px-4 py-2 rounded-lg border-3 border-black flex items-center justify-center gap-2 relative overflow-hidden"
          style={{ 
            backgroundColor: currentStyleObj.color,
            boxShadow: '4px 4px 0 rgba(0,0,0,0.8)'
          }}
        >
          {/* Background image - full opacity */}
          <div className="absolute inset-0" style={{
            backgroundImage: currentStyleObj.bgImage ? `url(${currentStyleObj.bgImage})` : '',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}></div>
          {/* Add dark overlay for better text contrast */}
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          {/* Overlay content */}
          <div className="relative z-10 flex items-center justify-center w-full">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="white" stroke="white" />
            </svg>
            <span className="text-white font-bold ml-2">{currentStyleObj.name}</span>
          </div>
        </div>
      </div>
    )}
  </div>
);

export default StyleSelector; 