import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import mangaBg from '../assets/images/manga.jpeg';
import cartoonBg from '../assets/images/cartoooon.jpeg';
import indieBg from '../assets/images/indie.jpeg';
import noirBg from '../assets/images/noir.jpeg';
import modernBg from '../assets/images/modern.jpeg';
import modernComicBg from '../assets/images/moderncomic.jpeg';
import Header from './Header';
import StyleSelector from './StyleSelector';
import ComplexitySlider from './ComplexitySlider';
import RecentTopics from './RecentTopics';
import MainForm from './MainForm';
import Footer from './Footer';
import { LANGUAGES, TRANSLATIONS } from './constants';
import ComicResult from './ComicResult';

const API_BASE_URL = 'http://localhost:5000/';

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
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [length, setLength] = useState('medium');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [result, setResult] = useState(null);
  const [storyline, setStoryline] = useState(null);
  const [scenes, setScenes] = useState([]);
  const [images, setImages] = useState([]);
  const navigate = useNavigate();
  const { setComicStyle: setGlobalComicStyle } = useTheme();
  const t = TRANSLATIONS[currentLanguage];

  const styleOptions = [
    { id: 'Manga', name: 'MANGA MADNESS', color: '#536DFE', bannerColor: '#3D5AFE', description: 'Big eyes & epic expressions!', level: 1, bgImage: mangaBg, textClass: 'font-manga' },
    { id: 'Western', name: 'RETRO COMICS', color: '#00BCD4', bannerColor: '#0097A7', description: 'Classic comic book style', level: 2, bgImage: modernComicBg, textClass: 'font-modern' },
    { id: 'Noir', name: 'DARK NOIR', color: '#263238', bannerColor: '#1C2429', description: 'Shadows & mystery vibes', level: 3, bgImage: noirBg, textClass: 'font-noir' },
    { id: 'Indie', name: 'INDIE VIBES', color: '#9C27B0', bannerColor: '#7B1FA2', description: 'Unique artistic flair', level: 3, bgImage: indieBg, textClass: 'font-indie' },
    { id: 'Cartoon', name: 'WACKY TOONS', color: '#8BC34A', bannerColor: '#689F38', description: 'Fun & playful animation style', level: 1, bgImage: cartoonBg, textClass: 'font-cartoon' },
    { id: 'Minimalist', name: 'SLEEK STYLE', color: '#607D8B', bannerColor: '#455A64', description: 'Clean & minimalist design', level: 2, bgImage: modernBg, textClass: 'font-modern' }
  ];
  const currentStyleObj = styleOptions.find(style => style.id === comicStyle) || styleOptions[0];

  const handleLanguageChange = (langCode) => {
    setCurrentLanguage(langCode);
    setShowLanguageMenu(false);
    setUserPoints(prev => prev + 5);
  };

  useEffect(() => {
    setGlobalComicStyle(comicStyle);
  }, [comicStyle, setGlobalComicStyle]);

  const handleStyleSelection = (style) => {
    if (style.locked) {
      setComicShake(true);
      setTimeout(() => setComicShake(false), 500);
      return;
    }
    setComicStyle(style.id);
    setShowStylePanel(false);
    setUserPoints(prev => prev + 5);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showLanguageMenu && !event.target.closest('.language-selector')) {
        setShowLanguageMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showLanguageMenu]);

  // Only keep handleSubmit and fetchSuggestions that use /search and /suggest endpoints
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setResult(null);
    setStoryline(null);
    setScenes([]);
    setImages([]);
    try {
      const res = await fetch(`${API_BASE_URL}search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
        body: new URLSearchParams({
          query: topic,
          style: comicStyle,
          length: length
        })
      });
      if (!res.ok) throw new Error('Failed to generate comic.');
      const data = await res.json();
      setResult(data.result);
      setStoryline(data.storyline);
      setScenes(data.scenes);
      setImages(data.images);
    } catch (err) {
      setError('Failed to generate comic.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch suggestions from Flask backend
  const fetchSuggestions = async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}suggest?query=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (err) {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handler for input change
  const handleInputChange = (e) => {
    setTopic(e.target.value);
    fetchSuggestions(e.target.value);
  };

  // Handler for suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    setTopic(suggestion);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="min-h-screen overflow-hidden relative">
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
      <div className="absolute inset-0 z-0 bg-transparent"></div>
      <div className="relative z-10">
        <Header
          userPoints={userPoints}
          userLevel={userLevel}
          currentLanguage={currentLanguage}
          showLanguageMenu={showLanguageMenu}
          setShowLanguageMenu={setShowLanguageMenu}
          handleLanguageChange={handleLanguageChange}
          t={t}
          LANGUAGES={LANGUAGES}
          navigate={navigate}
        />
        <main className="container mx-auto py-8 px-4">
          <div className="max-w-6xl mx-auto">
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
              <div className="relative z-10">
                <h1 className="text-center mb-6">
                  <span className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white text-3xl md:text-4xl font-extrabold py-2 px-6 rounded-lg border-2 border-black transform -rotate-2" style={{ boxShadow: '4px 4px 0 rgba(0,0,0,0.8)' }}>
                    {t.createYourComic}
                  </span>
                </h1>
                <MainForm
                  topic={topic}
                  error={error}
                  t={t}
                  suggestions={suggestions}
                  showSuggestions={showSuggestions}
                  onInputChange={handleInputChange}
                  onSuggestionSelect={handleSuggestionSelect}
                />
                <div className="flex justify-center gap-4 my-4">
                  {['short', 'medium', 'long'].map((len) => (
                    <button
                      key={len}
                      type="button"
                      onClick={() => setLength(len)}
                      className={`px-6 py-2 rounded-full font-bold border-2 border-black transition-all duration-150 ${
                        length === len
                          ? 'bg-blue-600 text-white scale-105 shadow-lg'
                          : 'bg-white text-blue-600 hover:bg-blue-100'
                      }`}
                    >
                      {len.charAt(0).toUpperCase() + len.slice(1)}
                    </button>
                  ))}
                </div>
                <RecentTopics
                  recentTopics={recentTopics}
                  setTopic={setTopic}
                  t={t}
                />
                <StyleSelector
                  styleOptions={styleOptions}
                  comicStyle={comicStyle}
                  setComicStyle={setComicStyle}
                  showStylePanel={showStylePanel}
                  setShowStylePanel={setShowStylePanel}
                  handleStyleSelection={handleStyleSelection}
                  currentStyleObj={currentStyleObj}
                  t={t}
                  comicShake={comicShake}
                />
                <ComplexitySlider
                  complexity={complexity}
                  setComplexity={setComplexity}
                  setComplexityLevel={setComplexityLevel}
                  t={t}
                />
                <form onSubmit={handleSubmit} className="text-center mt-12">
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
                </form>
                
                {result && (
                  <ComicResult
                    result={result}
                    storyline={storyline}
                    scenes={scenes}
                    images={images}
                  />
                )}
                {error && (
                  <div className="mt-4 text-center text-red-600 font-bold bg-red-100 border-2 border-red-400 rounded-lg p-3">
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
        <Footer t={t} />
      </div>
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
