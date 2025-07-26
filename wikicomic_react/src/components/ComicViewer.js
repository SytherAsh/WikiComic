import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../contexts/ThemeContext';
import QuizComponent from './QuizComponent';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import { API_BASE_URL, getImageUrl } from '../config/routes';
import { FaChevronLeft, FaChevronRight, FaComments, FaTimes } from 'react-icons/fa';

const ComicViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [comic, setComic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentScene, setCurrentScene] = useState(0);
  const [showKeyPoints, setShowKeyPoints] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [achievementUnlocked, setAchievementUnlocked] = useState(false);
  const [userPoints, setUserPoints] = useState(375);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizScore, setQuizScore] = useState(null);
  const { setComicStyle, themeStyles, currentTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  useEffect(() => {
    fetchComic();
    // eslint-disable-next-line
  }, [id]);

  const fetchComic = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/comics`);
      if (response.data && response.data.comics) {
        const found = response.data.comics.find(c => c.title === id);
        if (found) {
          setComic(found);
          setComicStyle(found.comicStyle);
          setError(null);
        } else {
          setError('Comic not found');
        }
      } else {
        setError('Invalid response format');
      }
    } catch (err) {
      setError('Failed to load comic');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousScene = () => {
    if (currentScene > 0) {
      setCurrentScene(currentScene - 1);
    }
  };

  const handleNextScene = () => {
    if (currentScene < comic?.scenes.length - 1) {
      setCurrentScene(currentScene + 1);
    }
  };

  // Toggle key points visibility
  const toggleKeyPoints = () => {
    setShowKeyPoints(!showKeyPoints);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        handleNextScene();
      } else if (e.key === 'ArrowLeft') {
        handlePreviousScene();
      } else if (e.key === 'i' || e.key === 'I') {
        toggleKeyPoints();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentScene, comic]);

  // Get style classes based on current theme
  const getThemeClasses = () => {
    switch(currentTheme) {
      case 'manga':
        return { 
          overlayColor: 'bg-manga-blue/60', 
          panelStyle: 'shadow-xl border-3px border-purple-900/30 bg-polka-dots',
          pageStyle: 'manga-text font-comic',
          buttonStyle: 'bg-manga-blue hover:bg-manga-blue/80 animate-wiggle',
          explosionColor: '#536DFE'
        };
      case 'western':
        return { 
          overlayColor: 'bg-western-orange/70', 
          panelStyle: 'shadow-amber-900/50 border-3px border-yellow-900/50 bg-comic-dots',
          pageStyle: 'western-text font-comic',
          buttonStyle: 'bg-western-orange hover:bg-western-orange/80',
          explosionColor: '#FF9800'
        };
      case 'minimalist':
        return { 
          overlayColor: 'bg-minimalist-gray/70', 
          panelStyle: 'shadow-md border border-gray-700',
          pageStyle: 'minimalist-text',
          buttonStyle: 'bg-minimalist-gray hover:bg-minimalist-gray/80',
          explosionColor: '#607D8B'
        };
      default:
        return { 
          overlayColor: 'bg-black/50', 
          panelStyle: 'shadow-lg',
          pageStyle: '',
          buttonStyle: 'bg-blue-600 hover:bg-blue-700',
          explosionColor: '#3B82F6'
        };
    }
  };

  // Utility to shuffle array
  function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
  }

  // Prepare quiz data from comic key points
  const generateQuizData = () => {
    const allKeyPoints = comic.scenes.flatMap(scene => scene.dialogue ? scene.dialogue.split('\n').filter(point => point.trim()) : []);
    // Gather all unique words/phrases for distractors
    const allWords = allKeyPoints.flatMap(point => point.split(' ')).filter(w => w.length > 3);
    // Create mock quiz questions based on key points
    const quiz = {
      title: `${comic.title} Quiz`,
      description: `Test your knowledge about ${comic.title}!`,
      questions: allKeyPoints.map((point, index) => {
        // Convert key point into a question
        const words = point.split(' ');
        const answer = words.slice(-3).join(' ');
        // Generate 3 random distractors
        let distractors = [];
        while (distractors.length < 3) {
          const candidate = shuffle(allWords).slice(0, 3).join(' ');
          if (candidate !== answer && !distractors.includes(candidate)) {
            distractors.push(candidate);
          }
        }
        const options = shuffle([
          { id: 'a', text: answer, correct: true },
          { id: 'b', text: distractors[0], correct: false },
          { id: 'c', text: distractors[1], correct: false },
          { id: 'd', text: distractors[2], correct: false }
        ]);
        return {
          id: index + 1,
          question: point.replace(/\bis\b|\bare\b/, '_____ '),
          options
        };
      }).slice(0, 5) // Limit to 5 questions
    };
    return quiz;
  };
  
  // Start quiz
  const handleStartQuiz = () => {
    setAchievementUnlocked(false);
    setShowQuiz(true);
  };
  
  // Return to comic from quiz
  const handleQuizComplete = (score) => {
    setShowQuiz(false);
    // Add points based on quiz score
    setUserPoints(prev => prev + (score * 10));
  };

  // Handle image click to open modal
  const handleImageClick = () => {
    setImageModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-white">Loading comic...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error}</div>
          <button
            onClick={() => navigate('/gallery')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Back to Gallery
          </button>
        </div>
      </div>
    );
  }

  if (!comic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Comic not found</div>
          <button
            onClick={() => navigate('/gallery')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Back to Gallery
          </button>
        </div>
      </div>
    );
  }

  const comicFont = 'Bangers, "Comic Sans MS", Comic, cursive';
  const panelBg = 'bg-gradient-to-br from-yellow-100 via-white to-pink-100';
  const panelBorder = 'border-4 border-black';
  const buttonComic = 'bg-gradient-to-r from-yellow-300 via-pink-300 to-blue-300 text-black font-extrabold border-2 border-black shadow-lg hover:scale-105 transform transition';

  // Flipbook UI
  const scene = comic.scenes[currentScene];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-100 to-blue-100 flex flex-col items-center justify-center py-8 px-4 comic-bg-pattern">
      <div className="absolute top-8 left-8 z-20">
        <button
          onClick={() => navigate('/gallery')}
          className={`px-6 py-3 rounded-full ${buttonComic} text-lg flex items-center gap-2`}
          style={{ fontFamily: comicFont }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Gallery
        </button>
      </div>
      <div className="relative flex flex-col items-center w-full max-w-7xl">
        <h1 className="text-5xl font-extrabold mb-6 text-center text-blue-900 drop-shadow-lg tracking-wider" style={{ fontFamily: comicFont, letterSpacing: '2px', textShadow: '2px 2px 0 #fff, 4px 4px 0 #000' }}>{comic.title}</h1>
        <div className="relative flex items-center justify-center w-full" style={{ minHeight: 600 }}>
          {/* Previous Button */}
          <button
            onClick={handlePreviousScene}
            disabled={currentScene === 0}
            className={`absolute left-0 z-10 px-6 py-4 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 text-white text-2xl font-extrabold border-2 border-black shadow-lg hover:scale-105 transition-all duration-200 ${currentScene === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{ fontFamily: comicFont }}
          >
            <FaChevronLeft />
          </button>
          {/* Main Image */}
          <div className="flex-1 flex items-center justify-center">
            <img
              src={getImageUrl(scene.image)}
              alt={`Scene ${currentScene + 1}`}
              className="rounded-2xl border-4 border-black shadow-2xl object-contain cursor-pointer hover:scale-105 transition-transform duration-200"
              style={{ width: '60vw', height: '70vh', maxWidth: 900, maxHeight: 700, background: '#fff', transition: 'box-shadow 0.3s' }}
              onClick={handleImageClick}
              title="Click to view full size"
            />
          </div>
          {/* Next Button */}
          <button
            onClick={handleNextScene}
            disabled={currentScene === comic.scenes.length - 1}
            className={`absolute right-0 z-10 px-6 py-4 rounded-full bg-gradient-to-l from-purple-400 to-pink-400 text-white text-2xl font-extrabold border-2 border-black shadow-lg hover:scale-105 transition-all duration-200 ${currentScene === comic.scenes.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{ fontFamily: comicFont }}
          >
            <FaChevronRight />
          </button>
          {/* Dialogue Sidebar Toggle */}
          <button
            className="absolute top-4 right-4 z-20 px-4 py-2 bg-yellow-300 border-2 border-black rounded-full shadow-lg flex items-center gap-2 hover:bg-yellow-400"
            onClick={() => setSidebarOpen((open) => !open)}
            style={{ fontFamily: comicFont }}
          >
            <FaComments /> <span className="hidden md:inline">Dialogue</span>
          </button>
          {/* Collapsible Sidebar */}
          <div
            className={`fixed top-0 right-0 h-full w-full md:w-[420px] bg-white border-l-4 border-black shadow-2xl p-8 flex flex-col justify-center comic-speech-bubble transition-transform duration-300 z-40 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-[420px]'}`}
            style={{ fontFamily: comicFont, minHeight: 500 }}
          >
            <button
              className="absolute top-4 right-4 px-3 py-1 bg-gray-200 border border-black rounded-full text-lg font-bold hover:bg-gray-300"
              onClick={() => setSidebarOpen(false)}
            >
              Close
            </button>
            <h2 className="text-2xl font-extrabold mb-6 text-pink-600 drop-shadow-lg" style={{ fontFamily: comicFont }}>DIALOGUE</h2>
            <div className="flex-1 overflow-y-auto text-xl text-black whitespace-pre-line" style={{ fontFamily: 'Inter, Arial, Helvetica, sans-serif', fontWeight: 500, lineHeight: 1.6, letterSpacing: '0.01em', textShadow: 'none' }}>
              {scene.dialogue}
            </div>
          </div>
        </div>
        {/* Thumbnails */}
        <div className="flex mt-8 space-x-3 overflow-x-auto w-full justify-center">
          {comic.scenes.map((s, idx) => (
            <img
              key={idx}
              src={getImageUrl(s.image)}
              alt={`Thumbnail ${idx + 1}`}
              className={`object-cover rounded-lg border-4 border-black cursor-pointer transition-transform duration-200 ${currentScene === idx ? 'border-blue-500 scale-125 shadow-2xl' : 'border-gray-300 scale-90 opacity-60'} `}
              style={{ width: currentScene === idx ? 120 : 60, height: currentScene === idx ? 120 : 60, background: '#fff' }}
              onClick={() => setCurrentScene(idx)}
            />
          ))}
        </div>
        {/* Scene Counter */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <span className="font-extrabold text-2xl text-purple-800" style={{ fontFamily: comicFont }}>
            Scene {currentScene + 1} of {comic.scenes.length}
          </span>
        </div>
      </div>
      {/* Quiz Button */}
      <div className="fixed top-8 right-8 z-30">
        {!showQuiz && quizScore === null && (
          <button
            className={`px-6 py-3 rounded-full ${buttonComic} text-lg flex items-center gap-2`}
            style={{ fontFamily: comicFont }}
            onClick={handleStartQuiz}
          >
            <span role="img" aria-label="quiz">📝</span> Take Quiz
          </button>
        )}
      </div>
      {/* Quiz Modal and Results (unchanged) */}
      <Modal open={showQuiz} onClose={() => setShowQuiz(false)} center styles={{ modal: { maxWidth: 800, width: '98vw', background: 'linear-gradient(135deg, #fffbe7 0%, #ffe0e9 100%)', border: '5px solid #222', borderRadius: '30px', boxShadow: '0 8px 32px rgba(0,0,0,0.25), 0 0 0 8px #ffeb3b', padding: 0 } }}>
        <div className="relative p-4">
          <div className="text-center mb-4">
            <span className="inline-block bg-gradient-to-r from-yellow-400 to-pink-400 text-white text-3xl font-extrabold py-2 px-8 rounded-lg border-2 border-black shadow-lg" style={{ fontFamily: 'Bangers, Comic Sans MS, Comic, cursive' }}>
              Quiz Time!
            </span>
          </div>
          <QuizComponent
            quizData={generateQuizData()}
            onComplete={(score) => { setQuizScore(score); setShowQuiz(false); setUserPoints(prev => prev + (score * 10)); }}
            comicTopic={comic.title}
          />
        </div>
      </Modal>
      {quizScore !== null && (
        <div className="text-center my-8">
          <div className="text-3xl font-bold mb-2">Quiz Completed!</div>
          <div className="text-xl mb-2">Your Score: {quizScore} / {generateQuizData().questions.length}</div>
          <button
            className="px-6 py-3 bg-green-500 text-white rounded-lg font-bold border-2 border-black shadow-lg hover:scale-105 transition"
            onClick={() => setQuizScore(null)}
            style={{ fontFamily: comicFont }}
          >
            Close
          </button>
        </div>
      )}
      {/* Sidebar overlay background for mobile */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Image Modal */}
      <Modal 
        open={imageModalOpen} 
        onClose={() => setImageModalOpen(false)} 
        center 
        styles={{ 
          modal: { 
            maxWidth: '95vw', 
            maxHeight: '95vh', 
            width: 'auto', 
            height: 'auto', 
            background: 'transparent', 
            border: 'none', 
            borderRadius: '0', 
            boxShadow: 'none', 
            padding: 0 
          },
          overlay: {
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(4px)'
          }
        }}
      >
        <div className="relative">
          <button
            className="absolute top-4 right-4 z-50 p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors duration-200"
            onClick={() => setImageModalOpen(false)}
          >
            <FaTimes size={20} />
          </button>
          <img
            src={getImageUrl(scene.image)}
            alt={`Scene ${currentScene + 1} - Full Size`}
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            style={{ background: '#fff' }}
          />
          <div className="absolute bottom-4 left-4 bg-black/50 text-white px-4 py-2 rounded-lg">
            <p className="text-sm font-semibold">Scene {currentScene + 1} of {comic.scenes.length}</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ComicViewer; 