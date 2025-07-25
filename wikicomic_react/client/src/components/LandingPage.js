import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
import { useTheme } from '../contexts/ThemeContext';
// Import the background images
import mangaBg from '../assets/images/manga.jpeg';
import cartoonBg from '../assets/images/cartoooon.jpeg';
import indieBg from '../assets/images/indie.jpeg';
import noirBg from '../assets/images/noir.jpeg';
import modernBg from '../assets/images/modern.jpeg';
import goldenAgeBg from '../assets/images/goldenage.jpeg';
import mahuaBg from '../assets/images/mahua.jpeg';
import modernComicBg from '../assets/images/moderncomic.jpeg';

// API base URL
const API_BASE_URL = 'http://localhost:5000/';

// Available languages
const LANGUAGES = {
  en: {
    name: 'English',
    flag: '🇺🇸',
    code: 'en'
  },
  hi: {
    name: 'हिंदी',
    flag: '🇮🇳',
    code: 'hi'
  },
  mr: {
    name: 'मराठी',
    flag: '🇮🇳',
    code: 'mr'
  },
  ja: {
    name: '日本語',
    flag: '🇯🇵',
    code: 'ja'
  },
  es: {
    name: 'Español',
    flag: '🇪🇸',
    code: 'es'
  },
  fr: {
    name: 'Français',
    flag: '🇫🇷',
    code: 'fr'
  },
  de: {
    name: 'Deutsch',
    flag: '🇩🇪',
    code: 'de'
  }
};

// Translations object
const TRANSLATIONS = {
  en: {
    makeMyComic: 'MAKE MY COMIC!',
    creating: 'CREATING...',
    searchPlaceholder: 'Enter a topic to create a comic about...',
    brainPowerLevel: 'BRAIN POWER LEVEL',
    elementary: 'ELEMENTARY',
    highSchool: 'HIGH SCHOOL',
    college: 'COLLEGE',
    points: 'POINTS',
    level: 'LEVEL',
    selectStyle: 'Select Your Style',
    learnInStyle: 'WIKICOMICS - LEARN IN STYLE!',
    createYourComic: 'CREATE YOUR COMIC!',
    selectYourStyle: 'SELECT YOUR STYLE!',
    previousQuests: 'YOUR PREVIOUS QUESTS:',
    unlockAtLevel: 'UNLOCK AT LVL',
    errorGenerating: 'Error generating comic',
    failedToSearch: 'Failed to search Wikipedia'
  },
  hi: {
    makeMyComic: 'मेरा कॉमिक बनाएं!',
    creating: 'बना रहे हैं...',
    searchPlaceholder: 'कॉमिक बनाने के लिए विषय दर्ज करें...',
    brainPowerLevel: 'बुद्धि स्तर',
    elementary: 'प्राथमिक',
    highSchool: 'माध्यमिक',
    college: 'महाविद्यालय',
    points: 'अंक',
    level: 'स्तर',
    selectStyle: 'अपनी शैली चुनें',
    learnInStyle: 'विकिकॉमिक्स - स्टाइल से सीखें!',
    createYourComic: 'अपना कॉमिक बनाएं!',
    selectYourStyle: 'अपनी शैली चुनें!',
    previousQuests: 'आपकी पिछली खोजें:',
    unlockAtLevel: 'स्तर पर अनलॉक करें',
    errorGenerating: 'कॉमिक बनाने में त्रुटि',
    failedToSearch: 'विकिपीडिया खोज विफल'
  },
  mr: {
    makeMyComic: 'माझे कॉमिक बनवा!',
    creating: 'तयार करत आहे...',
    searchPlaceholder: 'कॉमिक बनवण्यासाठी विषय टाका...',
    brainPowerLevel: 'बुद्धिमत्ता पातळी',
    elementary: 'प्राथमिक',
    highSchool: 'माध्यमिक',
    college: 'महाविद्यालय',
    points: 'गुण',
    level: 'पातळी',
    selectStyle: 'तुमची शैली निवडा',
    learnInStyle: 'विकिकॉमिक्स - स्टाईलने शिका!',
    createYourComic: 'तुमचे कॉमिक बनवा!',
    selectYourStyle: 'तुमची शैली निवडा!',
    previousQuests: 'तुमच्या मागील शोध:',
    unlockAtLevel: 'पातळीवर अनलॉक करा',
    errorGenerating: 'कॉमिक बनवताना त्रुटी',
    failedToSearch: 'विकिपीडिया शोध अयशस्वी'
  },
  ja: {
    makeMyComic: 'コミックを作成！',
    creating: '作成中...',
    searchPlaceholder: 'コミックのテーマを入力してください...',
    brainPowerLevel: '知力レベル',
    elementary: '小学校',
    highSchool: '高校',
    college: '大学',
    points: 'ポイント',
    level: 'レベル',
    selectStyle: 'スタイルを選択',
    learnInStyle: 'ウィキコミックス - スタイリッシュに学ぼう！',
    createYourComic: 'コミックを作成！',
    selectYourStyle: 'スタイルを選択！',
    previousQuests: '過去の検索：',
    unlockAtLevel: 'レベルでアンロック',
    errorGenerating: 'コミック生成エラー',
    failedToSearch: 'ウィキペディア検索に失敗'
  },
  es: {
    makeMyComic: '¡CREAR MI CÓMIC!',
    creating: 'CREANDO...',
    searchPlaceholder: 'Ingresa un tema para crear un cómic...',
    brainPowerLevel: 'NIVEL DE PODER CEREBRAL',
    elementary: 'PRIMARIA',
    highSchool: 'SECUNDARIA',
    college: 'UNIVERSIDAD',
    points: 'PUNTOS',
    level: 'NIVEL',
    selectStyle: 'Selecciona Tu Estilo',
    learnInStyle: '¡WIKICOMICS - APRENDE CON ESTILO!',
    createYourComic: '¡CREA TU CÓMIC!',
    selectYourStyle: '¡SELECCIONA TU ESTILO!',
    previousQuests: 'TUS BÚSQUEDAS ANTERIORES:',
    unlockAtLevel: 'DESBLOQUEAR EN NIVEL',
    errorGenerating: 'Error al generar el cómic',
    failedToSearch: 'Error al buscar en Wikipedia'
  },
  fr: {
    makeMyComic: 'CRÉER MA BD !',
    creating: 'CRÉATION...',
    searchPlaceholder: 'Entrez un sujet pour créer une BD...',
    brainPowerLevel: 'NIVEAU DE PUISSANCE CÉRÉBRALE',
    elementary: 'ÉLÉMENTAIRE',
    highSchool: 'LYCÉE',
    college: 'UNIVERSITÉ',
    points: 'POINTS',
    level: 'NIVEAU',
    selectStyle: 'Sélectionnez Votre Style',
    learnInStyle: 'WIKICOMICS - APPRENEZ AVEC STYLE !',
    createYourComic: 'CRÉEZ VOTRE BD !',
    selectYourStyle: 'SÉLECTIONNEZ VOTRE STYLE !',
    previousQuests: 'VOS RECHERCHES PRÉCÉDENTES :',
    unlockAtLevel: 'DÉBLOQUER AU NIVEAU',
    errorGenerating: 'Erreur lors de la génération de la BD',
    failedToSearch: 'Échec de la recherche Wikipedia'
  },
  de: {
    makeMyComic: 'ERSTELLE MEINEN COMIC!',
    creating: 'ERSTELLEN...',
    searchPlaceholder: 'Gib ein Thema für deinen Comic ein...',
    brainPowerLevel: 'GEHIRNLEISTUNG',
    elementary: 'GRUNDSCHULE',
    highSchool: 'GYMNASIUM',
    college: 'UNIVERSITÄT',
    points: 'PUNKTE',
    level: 'LEVEL',
    selectStyle: 'Wähle Deinen Stil',
    learnInStyle: 'WIKICOMICS - LERNE MIT STIL!',
    createYourComic: 'ERSTELLE DEINEN COMIC!',
    selectYourStyle: 'WÄHLE DEINEN STIL!',
    previousQuests: 'DEINE VORHERIGEN SUCHEN:',
    unlockAtLevel: 'FREISCHALTEN AUF LEVEL',
    errorGenerating: 'Fehler beim Generieren des Comics',
    failedToSearch: 'Wikipedia-Suche fehlgeschlagen'
  }
};

const LandingPage = () => {
  const [topic, setTopic] = useState('');
  const [complexityLevel, setComplexityLevel] = useState('Elementary');
  const [comicStyle, setComicStyle] = useState('Manga');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showStylePanel, setShowStylePanel] = useState(false);
  const [comicShake, setComicShake] = useState(false);
  const [userPoints, setUserPoints] = useState(350);
  const [userLevel, setUserLevel] = useState(4);
  const [recentTopics, setRecentTopics] = useState([]);
  const [complexity, setComplexity] = useState(50);
  // Remove searchResults, isSearching
  // const [searchResults, setSearchResults] = useState([]);
  // const [isSearching, setIsSearching] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  
  const navigate = useNavigate();
  const { setComicStyle: setGlobalComicStyle, themeStyles, currentTheme } = useTheme();

  // Get current translations
  const t = TRANSLATIONS[currentLanguage];

  // Function to handle language change
  const handleLanguageChange = (langCode) => {
    setCurrentLanguage(langCode);
    setShowLanguageMenu(false);
    // Add points for changing language
    setUserPoints(prev => prev + 5);
  };

  // Update global comic style when local state changes
  useEffect(() => {
    setGlobalComicStyle(comicStyle);
  }, [comicStyle, setGlobalComicStyle]);

  // Remove handleSearch, debounce, and handleSubmit
  // Remove all API calls and polling logic
  // Remove search result dropdown rendering
  // Remove error display for API errors
  // Keep only the UI and state for the 4 main buttons:
  // - Comic type selection (style)
  // - Title search (input)
  // - Length selection (slider/bar)
  // - Previous comics (button)

  // Comic style options with playful names and descriptions
  const styleOptions = [
    {
      id: 'Manga',
      name: 'MANGA MADNESS',
      color: '#536DFE',
      bannerColor: '#3D5AFE',
      description: 'Big eyes & epic expressions!',
      level: 1,
      bgImage: mangaBg,
      textClass: 'font-manga'
    },
    {
      id: 'Western',
      name: 'RETRO COMICS',
      color: '#00BCD4',
      bannerColor: '#0097A7',
      description: 'Classic comic book style',
      level: 2,
      bgImage: modernComicBg,
      textClass: 'font-modern'
    },
    {
      id: 'Noir',
      name: 'DARK NOIR',
      color: '#263238',
      bannerColor: '#1C2429',
      description: 'Shadows & mystery vibes',
      level: 3,
      bgImage: noirBg,
      textClass: 'font-noir'
    },
    {
      id: 'Indie',
      name: 'INDIE VIBES',
      color: '#9C27B0',
      bannerColor: '#7B1FA2',
      description: 'Unique artistic flair',
      level: 3,
      bgImage: indieBg,
      textClass: 'font-indie'
    },
    {
      id: 'Cartoon',
      name: 'WACKY TOONS',
      color: '#8BC34A',
      bannerColor: '#689F38',
      description: 'Fun & playful animation style',
      level: 1,
      bgImage: cartoonBg,
      textClass: 'font-cartoon'
    },
    {
      id: 'Minimalist',
      name: 'SLEEK STYLE',
      color: '#607D8B',
      bannerColor: '#455A64',
      description: 'Clean & minimalist design',
      level: 2,
      bgImage: modernBg,
      textClass: 'font-modern'
    }
  ];
  
  
  // Get the current style object
  const currentStyleObj = styleOptions.find(style => style.id === comicStyle) || styleOptions[0];

  // Handle style selection
  const handleStyleSelection = (style) => {
    if (style.locked) {
      setComicShake(true);
      setTimeout(() => setComicShake(false), 500);
      return;
    }
    
    setComicStyle(style.id);
    setShowStylePanel(false);
    
    // Add points for interaction (gamification)
    setUserPoints(prev => prev + 5);
  };

  // Add click outside handler for language menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showLanguageMenu && !event.target.closest('.language-selector')) {
        setShowLanguageMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showLanguageMenu]);

  return (
    <div className="min-h-screen overflow-hidden relative">
      {/* Dynamic background based on selected style - full opacity */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: currentStyleObj.bgImage ? `url(${currentStyleObj.bgImage})` : '',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'none',
        }}
      ></div>
      
      {/* Remove overlay pattern div and replace with a transparent div */}
      <div className="absolute inset-0 z-0 bg-transparent"></div>
      
      <div className="relative z-10">
        {/* Comic Book Header */}
        <header className="relative overflow-visible" style={{ 
          backgroundColor: currentStyleObj.bannerColor || '#3D5AFE',
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
                <div className="bg-yellow-300 border-2 border-black rounded-full px-3 py-1 text-black font-bold shadow-lg transform hover:scale-105 transition-transform" style={{ boxShadow: '3px 3px 0 rgba(0,0,0,0.8)' }}>
                  <div className="flex items-center">
                    <svg className="mr-1" width="16" height="16" viewBox="0 0 24 24" fill="orange" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="orange" stroke="currentColor" />
                    </svg>
                    <span>{userPoints} {t.points}</span>
                  </div>
                </div>
                
                {/* Level Display */}
                <div className="bg-purple-500 border-2 border-black rounded-full px-3 py-1 text-white font-bold shadow-lg" style={{ boxShadow: '3px 3px 0 rgba(0,0,0,0.8)' }}>
                  <div className="flex items-center">
                    <svg className="mr-1" width="16" height="16" viewBox="0 0 24 24" fill="gold" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="8" r="6" fill="gold" stroke="currentColor" />
                      <path d="M8 14h8v7l-4-3-4 3v-7z" fill="gold" stroke="currentColor" />
                    </svg>
                    <span>{t.level} {userLevel}</span>
                  </div>
                </div>

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
        
        {/* Main Content */}
        <main className="container mx-auto py-8 px-4">
          <div className="max-w-6xl mx-auto">
            {/* Comic Book Panel */}
            <div 
              className={`bg-white border-4 border-black rounded-lg p-6 mb-8 relative transform ${comicShake ? 'animate-wiggle' : ''}`} 
              style={{ 
                boxShadow: '8px 8px 0 rgba(0,0,0,0.8)',
                borderRadius: '20px / 10px',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Remove the subtle background image */}
              
              {/* Remove white overlay */}
              
              <div className="relative z-10">
                <h1 className="text-center mb-6">
                  <span className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white text-3xl md:text-4xl font-extrabold py-2 px-6 rounded-lg border-2 border-black transform -rotate-2" style={{ boxShadow: '4px 4px 0 rgba(0,0,0,0.8)' }}>
                    {t.createYourComic}
                  </span>
                </h1>
                
                <form onSubmit={() => {}} className="space-y-6">
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
                    
                    {/* Search Results Dropdown */}
                    {/* Removed search results dropdown */}
                  </div>

                  {/* Recent topics */}
                  {recentTopics.length > 0 && (
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
                  )}
                  
                  {/* Comic Style Selection */}
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
                  
                  {/* Complexity Slider */}
                  <div className="mb-8">
                    <div className="text-center mb-2">
                      <span className="inline-block bg-orange-500 text-white text-xl font-bold py-1 px-4 rounded-full border-2 border-black" style={{ boxShadow: '3px 3px 0 rgba(0,0,0,0.8)' }}>
                        {t.brainPowerLevel}
                      </span>
                    </div>
                    <div className="mt-4 px-4">
                      <div 
                        className="w-full h-12 bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 rounded-full border-2 border-black relative"
                        style={{ boxShadow: '3px 3px 0 rgba(0,0,0,0.8)' }}
                      >
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={complexity}
                          onChange={(e) => {
                            setComplexity(parseInt(e.target.value));
                            // Set complexity level based on slider value
                            if (e.target.value < 33) {
                              setComplexityLevel('Elementary');
                            } else if (e.target.value < 66) {
                              setComplexityLevel('High School');
                            } else {
                              setComplexityLevel('College');
                            }
                          }}
                          className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
                        />
                        
                        {/* Custom slider handle */}
                        <div 
                          className="absolute top-1/2 transform -translate-y-1/2 w-8 h-14 bg-white border-2 border-black rounded-full cursor-grab"
                          style={{ 
                            left: `calc(${complexity}% - 16px)`, 
                            boxShadow: '2px 2px 0 rgba(0,0,0,0.8)',
                            transition: 'left 0.1s ease-out'
                          }}
                        >
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-1 h-8 bg-gray-300 rounded-full"></div>
                          </div>
                        </div>
                        
                        {/* Level markers */}
                        <div className="absolute -bottom-10 left-0 right-0 flex justify-between px-4 text-sm font-bold">
                          <div className="flex flex-col items-center">
                            <div className="w-1 h-4 bg-black"></div>
                            <span>{t.elementary}</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="w-1 h-4 bg-black"></div>
                            <span>{t.highSchool}</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="w-1 h-4 bg-black"></div>
                            <span>{t.college}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Generate Button */}
                  <div className="text-center mt-12">
                    <button
                      type="submit"
                      disabled={isLoading || !topic}
                      className={`px-10 py-4 bg-gradient-to-r ${
                        isLoading || !topic
                          ? 'from-gray-400 to-gray-500 cursor-not-allowed'
                          : 'from-green-500 to-emerald-600 hover:scale-105'
                      } text-white text-2xl font-extrabold rounded-lg border-3 border-black transform transition relative overflow-hidden shadow-lg`}
                      style={{ boxShadow: '5px 5px 0 rgba(0,0,0,0.8)' }}
                    >
                      <div className="relative flex items-center justify-center">
                        {isLoading ? (
                          <>
                            {t.creating}
                            <div className="ml-2 animate-spin h-6 w-6 border-4 border-white border-t-transparent rounded-full"></div>
                          </>
                        ) : (
                          <>
                            {t.makeMyComic}
                            <svg className="ml-2 inline" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="yellow" stroke="white" />
                            </svg>
                          </>
                        )}
                      </div>
                    </button>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="mt-4 text-center text-red-600 font-bold bg-red-100 border-2 border-red-400 rounded-lg p-3">
                      {t.errorGenerating}
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </main>
        
        {/* Comic-style footer */}
        <footer className="mt-12 py-4 bg-blue-800 text-white relative overflow-hidden" style={{ 
          borderTop: '3px solid black'
        }}>
          {/* Comic dots overlay - keeping it for the footer */}
          <div className="comic-dots absolute inset-0 opacity-20" style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '10px 10px'
          }}></div>
          
          <div className="container mx-auto text-center relative z-10">
            <p className="text-lg font-bold" style={{ 
              fontFamily: 'Comic Sans MS, cursive'
            }}>{t.learnInStyle}</p>
          </div>
          
          {/* Comic style explosion lines */}
          <div className="absolute left-1/4 bottom-0 w-20 h-20">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="absolute left-0 bottom-0 bg-yellow-300 h-1" style={{
                width: '20px',
                transformOrigin: '0 100%',
                transform: `rotate(${i * 30}deg)`,
                opacity: 0.7
              }}></div>
            ))}
          </div>
          
          <div className="absolute right-1/4 bottom-0 w-20 h-20">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="absolute right-0 bottom-0 bg-yellow-300 h-1" style={{
                width: '20px',
                transformOrigin: '100% 100%',
                transform: `rotate(${-i * 30}deg)`,
                opacity: 0.7
              }}></div>
            ))}
          </div>
        </footer>
      </div>
      
      {/* Add keyframes for the wiggle animation */}
      <style jsx="true">{`        @keyframes wiggle {
          0% { transform: rotate(0deg); }
          25% { transform: rotate(-2deg); }
          50% { transform: rotate(0deg); }
          75% { transform: rotate(2deg); }
          100% { transform: rotate(0deg); }
        }
        .animate-wiggle {
          animation: wiggle 0.5s ease;
        }
      `}</style>
    </div>
  );
};

export default LandingPage; 
