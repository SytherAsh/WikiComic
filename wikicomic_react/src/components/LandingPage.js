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
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import QuizComponent from './QuizComponent';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://wiki-comic-ash.vercel.app/';

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
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizScore, setQuizScore] = useState(null);

  // Example data for charts
  const pointsHistory = [
    { name: 'Mon', points: 200 },
    { name: 'Tue', points: 250 },
    { name: 'Wed', points: 300 },
    { name: 'Thu', points: 320 },
    { name: 'Fri', points: 350 },
  ];
  const levelData = [
    { name: 'Level 1', value: 1 },
    { name: 'Level 2', value: 1 },
    { name: 'Level 3', value: 1 },
    { name: 'Level 4', value: userLevel },
  ];
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // Example quiz data
  const quizData = {
    questions: [
      {
        id: 'q1',
        question: 'Who is the main character of the comic?',
        options: [
          { id: 'a', text: 'Donald Trump', correct: true },
          { id: 'b', text: 'Barack Obama', correct: false },
          { id: 'c', text: 'Naruto', correct: false },
          { id: 'd', text: 'Mickey Mouse', correct: false },
        ],
      },
      {
        id: 'q2',
        question: 'What is the comic style?',
        options: [
          { id: 'a', text: 'Manga', correct: true },
          { id: 'b', text: 'Noir', correct: false },
          { id: 'c', text: 'Cartoon', correct: false },
          { id: 'd', text: 'Indie', correct: false },
        ],
      },
      {
        id: 'q3',
        question: 'How many scenes are there?',
        options: [
          { id: 'a', text: '3', correct: false },
          { id: 'b', text: '5', correct: false },
          { id: 'c', text: '7', correct: true },
          { id: 'd', text: '10', correct: false },
        ],
      },
    ],
  };

  const handleQuizComplete = (score) => {
    setQuizScore(score);
    setShowQuiz(false);
    setUserPoints(prev => prev + score * 10);
  };

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
      // Automatically navigate to the flipbook view for the new comic
      if (data.result && data.result.title) {
        navigate(`/comic/${encodeURIComponent(data.result.title)}`);
      }
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

  // Level progress calculation
  const xpForLevel = userLevel * 100;
  const currentXP = userPoints % xpForLevel;
  const xpToNextLevel = xpForLevel - currentXP;
  const levelPercent = Math.min(100, Math.round((currentXP / xpForLevel) * 100));

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
          onPointsClick={() => setShowPointsModal(true)}
          onLevelClick={() => setShowLevelModal(true)}
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
                      className={`px-8 py-3 rounded-lg font-extrabold border-4 border-black shadow-lg transition-all duration-150 text-xl tracking-wide
                        ${length === len
                          ? 'bg-gradient-to-r from-yellow-300 via-pink-300 to-blue-300 text-black scale-105'
                          : 'bg-white text-blue-700 hover:bg-gradient-to-r hover:from-yellow-200 hover:via-pink-100 hover:to-blue-200 hover:text-black'}
                      `}
                      style={{ fontFamily: 'Bangers, Comic Sans MS, Comic, cursive', minWidth: '120px', boxShadow: '4px 4px 0 #000' }}
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
                  <>
                    <ComicResult
                      result={result}
                      storyline={storyline}
                      scenes={scenes}
                      images={images}
                    />
                    {!showQuiz && quizScore === null && (
                      <div className="text-center my-8">
                        <button
                          className="px-12 py-6 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-500 text-white text-3xl font-extrabold rounded-2xl border-4 border-black shadow-2xl hover:scale-110 transition-all duration-200"
                          onClick={() => setShowQuiz(true)}
                        >
                          🎯 Take Quiz!
                        </button>
                      </div>
                    )}
                    {showQuiz && (
                      <QuizComponent
                        quizData={quizData}
                        onComplete={handleQuizComplete}
                        comicTopic={result?.title || 'Comic'}
                      />
                    )}
                    {quizScore !== null && (
                      <div className="text-center my-8">
                        <div className="text-3xl font-bold mb-2">Quiz Completed!</div>
                        <div className="text-xl mb-2">Your Score: {quizScore} / {quizData.questions.length}</div>
                        <button
                          className="px-6 py-3 bg-green-500 text-white rounded-lg font-bold border-2 border-black shadow-lg hover:scale-105 transition"
                          onClick={() => setQuizScore(null)}
                        >
                          Close
                        </button>
                      </div>
                    )}
                  </>
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
      {/* Points Modal */}
      <Modal open={showPointsModal} onClose={() => setShowPointsModal(false)} center styles={{ modal: { maxWidth: 600, width: '90vw', background: 'linear-gradient(135deg, #fffbe7 0%, #ffe0e9 100%)', border: '5px solid #222', borderRadius: '30px', boxShadow: '0 8px 32px rgba(0,0,0,0.25), 0 0 0 8px #ffeb3b', padding: 0 } }}>
        <div className="relative p-8">
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
            <span className="text-5xl">⭐</span>
          </div>
          <div className="text-center mb-6">
            <span className="inline-block bg-gradient-to-r from-yellow-400 to-pink-400 text-white text-3xl font-extrabold py-2 px-8 rounded-lg border-2 border-black shadow-lg" style={{ fontFamily: 'Bangers, Comic Sans MS, Comic, cursive', marginTop: '2rem' }}>
              Points History
            </span>
          </div>
          <div className="bg-white rounded-xl shadow-2xl p-6 border-2 border-black">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pointsHistory}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="points" fill="#fbbf24" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Modal>
      {/* Level Modal */}
      <Modal open={showLevelModal} onClose={() => setShowLevelModal(false)} center styles={{ modal: { maxWidth: 600, width: '90vw', background: 'linear-gradient(135deg, #e0e7ff 0%, #ffe0f7 100%)', border: '5px solid #222', borderRadius: '30px', boxShadow: '0 8px 32px rgba(0,0,0,0.25), 0 0 0 8px #a78bfa', padding: 0 } }}>
        <div className="relative p-8">
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
            <span className="text-5xl">🎖️</span>
          </div>
          <div className="text-center mb-6">
            <span className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white text-3xl font-extrabold py-2 px-8 rounded-lg border-2 border-black shadow-lg" style={{ fontFamily: 'Bangers, Comic Sans MS, Comic, cursive', marginTop: '2rem' }}>
              Level Progress
            </span>
          </div>
          <div className="bg-white rounded-xl shadow-2xl p-6 border-2 border-black">
            <div className="mb-4 text-xl font-bold text-center">Level {userLevel}</div>
            <div className="w-full bg-gray-200 rounded-full border-2 border-black h-10 relative mb-4" style={{ boxShadow: '2px 2px 0 #a78bfa' }}>
              <div className="h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full" style={{ width: `${levelPercent}%`, transition: 'width 0.5s', boxShadow: '2px 2px 0 #a78bfa' }}></div>
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-lg font-bold text-black">{currentXP} / {xpForLevel} XP</div>
            </div>
            <div className="text-center text-lg">XP to next level: <span className="font-bold">{xpToNextLevel}</span></div>
          </div>
        </div>
      </Modal>
      {/* Quiz Modal */}
      <Modal open={showQuiz} onClose={() => setShowQuiz(false)} center styles={{ modal: { maxWidth: 800, width: '98vw', background: 'linear-gradient(135deg, #fffbe7 0%, #ffe0e9 100%)', border: '5px solid #222', borderRadius: '30px', boxShadow: '0 8px 32px rgba(0,0,0,0.25), 0 0 0 8px #ffeb3b', padding: 0 } }}>
        <div className="relative p-4">
          <div className="text-center mb-4">
            <span className="inline-block bg-gradient-to-r from-yellow-400 to-pink-400 text-white text-3xl font-extrabold py-2 px-8 rounded-lg border-2 border-black shadow-lg" style={{ fontFamily: 'Bangers, Comic Sans MS, Comic, cursive' }}>
              Quiz Time!
            </span>
          </div>
          <QuizComponent
            quizData={quizData}
            onComplete={handleQuizComplete}
            comicTopic={result?.title || 'Comic'}
          />
        </div>
      </Modal>
    </div>
  );
};

export default LandingPage; 
