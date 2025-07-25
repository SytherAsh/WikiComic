import React from 'react';

const Header = ({ userPoints, userLevel, currentLanguage, showLanguageMenu, setShowLanguageMenu, handleLanguageChange, t, LANGUAGES, navigate, onPointsClick, onLevelClick }) => (
  <header className="relative overflow-visible" style={{ 
    backgroundColor: t.bannerColor || '#3D5AFE',
    borderBottom: '3px solid black',
    boxShadow: '0 4px 0 rgba(0,0,0,0.2)'
  }}>
    {/* Comic dots overlay - keeping it for the header */}
    <div className="comic-dots absolute inset-0 opacity-20" style={{
      backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
      backgroundSize: '10px 10px'
    }}></div>
    <div className="container mx-auto py-4 px-6 relative z-10">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className="comic-logo text-white text-3xl font-extrabold tracking-tight flex items-center">
            <span className="transform -rotate-6 inline-block">W</span>
            <span>iki</span>
            <span className="transform rotate-6 inline-block">C</span>
            <span>omics!</span>
            <svg className="ml-1 text-yellow-300" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="yellow" stroke="currentColor" />
            </svg>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {/* Previous Comics Button */}
          <button
            onClick={() => navigate('/gallery')}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-black font-bold rounded-full border-2 border-black shadow-lg transform hover:scale-105 transition-all duration-200 group"
            style={{ boxShadow: '3px 3px 0 rgba(0,0,0,0.8)' }}
          >
            <div className="absolute inset-0 bg-white opacity-20 rounded-full"></div>
            <svg 
              className="w-5 h-5 mr-2 transform group-hover:rotate-12 transition-transform duration-200" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <span className="relative">Previous Comics</span>
            <div className="absolute top-0 right-0 -mr-1 -mt-1 w-4 h-4 bg-red-500 rounded-full border-2 border-black flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
          </button>
          {/* Points Display */}
          <button
            onClick={onPointsClick}
            className="bg-yellow-300 border-2 border-black rounded-full px-3 py-1 text-black font-bold shadow-lg transform hover:scale-105 transition-transform focus:outline-none"
            style={{ boxShadow: '3px 3px 0 rgba(0,0,0,0.8)' }}
          >
            <div className="flex items-center">
              <svg className="mr-1" width="16" height="16" viewBox="0 0 24 24" fill="orange" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="orange" stroke="currentColor" />
              </svg>
              <span>{userPoints} {t.points}</span>
            </div>
          </button>
          {/* Level Display */}
          <button
            onClick={onLevelClick}
            className="bg-purple-500 border-2 border-black rounded-full px-3 py-1 text-white font-bold shadow-lg focus:outline-none"
            style={{ boxShadow: '3px 3px 0 rgba(0,0,0,0.8)' }}
          >
            <div className="flex items-center">
              <svg className="mr-1" width="16" height="16" viewBox="0 0 24 24" fill="gold" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="6" fill="gold" stroke="currentColor" />
                <path d="M8 14h8v7l-4-3-4 3v-7z" fill="gold" stroke="currentColor" />
              </svg>
              <span>{t.level} {userLevel}</span>
            </div>
          </button>
          {/* Language Selector */}
          <div className="language-selector relative" style={{ zIndex: 9999 }}>
            <button
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className="bg-blue-400 border-2 border-black rounded-full px-3 py-1 text-white font-bold shadow-lg transform hover:scale-105 transition-transform flex items-center space-x-2"
              style={{ boxShadow: '3px 3px 0 rgba(0,0,0,0.8)' }}
            >
              <span className="text-xl">{LANGUAGES[currentLanguage].flag}</span>
              <span>{LANGUAGES[currentLanguage].name}</span>
              <svg className={`w-4 h-4 transform transition-transform ${showLanguageMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {/* Language Dropdown Menu */}
            {showLanguageMenu && (
              <div 
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg border-2 border-black shadow-lg overflow-hidden"
                style={{ 
                  boxShadow: '3px 3px 0 rgba(0,0,0,0.8)',
                  zIndex: 9999
                }}
              >
                {Object.values(LANGUAGES).map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`w-full px-4 py-2 text-left flex items-center space-x-3 hover:bg-gray-100 transition-colors ${
                      currentLanguage === lang.code ? 'bg-blue-100' : ''
                    }`}
                  >
                    <span className="text-2xl">{lang.flag}</span>
                    <span className="font-medium">{lang.name}</span>
                    {currentLanguage === lang.code && (
                      <svg className="w-5 h-5 text-blue-500 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    {/* Comic style explosion lines */}
    <div className="absolute left-0 top-0 w-40 h-40">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="absolute left-0 top-0 bg-yellow-300 h-1" style={{
          width: '100px',
          transformOrigin: '0 0',
          transform: `rotate(${i * 45}deg)`,
          opacity: 0.7
        }}></div>
      ))}
    </div>
    <div className="absolute right-0 bottom-0 w-40 h-40">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="absolute right-0 bottom-0 bg-yellow-300 h-1" style={{
          width: '100px',
          transformOrigin: '100% 100%',
          transform: `rotate(${i * 45}deg)`,
          opacity: 0.7
        }}></div>
      ))}
    </div>
  </header>
);

export default Header; 