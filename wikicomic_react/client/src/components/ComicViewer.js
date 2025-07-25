import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../contexts/ThemeContext';
import QuizComponent from './QuizComponent';

const API_BASE_URL = 'http://localhost:5000';

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
  const { setComicStyle, themeStyles, currentTheme } = useTheme();

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

  // Prepare quiz data from comic key points
  const generateQuizData = () => {
    const allKeyPoints = comic.scenes.flatMap(scene => scene.dialogue ? scene.dialogue.split('\n').filter(point => point.trim()) : []);
    
    // Create mock quiz questions based on key points
    const quiz = {
      title: `${comic.title} Quiz`,
      description: `Test your knowledge about ${comic.title}!`,
      questions: allKeyPoints.map((point, index) => {
        // Convert key point into a question
        const question = point.replace(/\bis\b|\bare\b/, "_____ ");
        return {
          id: index + 1,
          question: question,
          options: [
            { id: 'a', text: point.split(' ').slice(-3).join(' '), correct: true },
            { id: 'b', text: "Not this option", correct: false },
            { id: 'c', text: "Nor this one", correct: false },
            { id: 'd', text: "Definitely not this", correct: false }
          ]
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
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-100 to-blue-100 flex items-center justify-center py-8 px-4 comic-bg-pattern">
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
      <div className={`relative ${panelBg} ${panelBorder} rounded-2xl shadow-2xl flex w-full max-w-6xl min-h-[700px]`} style={{ fontFamily: comicFont }}>
        {/* Main Image */}
        <div className="flex-1 flex flex-col items-center justify-center p-10">
          <h1 className="text-5xl font-extrabold mb-6 text-center text-blue-900 drop-shadow-lg tracking-wider" style={{ fontFamily: comicFont, letterSpacing: '2px', textShadow: '2px 2px 0 #fff, 4px 4px 0 #000' }}>{comic.title}</h1>
          <div className="bg-white border-4 border-black rounded-xl shadow-xl flex items-center justify-center mb-8" style={{ minHeight: 500, minWidth: 500, maxWidth: 700 }}>
            <img
              src={scene.image.startsWith('http') ? scene.image : `${API_BASE_URL}${scene.image}`}
              alt={`Scene ${currentScene + 1}`}
              className="w-full h-[500px] object-contain rounded-xl"
              style={{ background: '#fff' }}
            />
          </div>
          <div className="flex justify-center items-center gap-6 mt-4">
            <button
              onClick={handlePreviousScene}
              disabled={currentScene === 0}
              className={`px-8 py-3 rounded-full ${buttonComic} text-xl ${currentScene === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{ fontFamily: comicFont }}
            >
              Previous
            </button>
            <span className="font-extrabold text-2xl text-purple-800" style={{ fontFamily: comicFont }}>
              Scene {currentScene + 1} of {comic.scenes.length}
            </span>
            <button
              onClick={handleNextScene}
              disabled={currentScene === comic.scenes.length - 1}
              className={`px-8 py-3 rounded-full ${buttonComic} text-xl ${currentScene === comic.scenes.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{ fontFamily: comicFont }}
            >
              Next
            </button>
          </div>
          {/* Thumbnails */}
          <div className="flex mt-8 space-x-3 overflow-x-auto">
            {comic.scenes.map((s, idx) => (
              <img
                key={idx}
                src={s.image.startsWith('http') ? s.image : `${API_BASE_URL}${s.image}`}
                alt={`Thumbnail ${idx + 1}`}
                className={`w-20 h-20 object-cover rounded-lg border-4 border-black cursor-pointer ${currentScene === idx ? 'border-blue-500 scale-110' : 'border-gray-300'} transition-transform`}
                onClick={() => setCurrentScene(idx)}
                style={{ background: '#fff' }}
              />
            ))}
          </div>
        </div>
        {/* Sidebar for Dialogue */}
        <div className="w-96 bg-white border-l-4 border-black p-8 flex flex-col justify-center comic-speech-bubble relative" style={{ fontFamily: comicFont, minHeight: 500 }}>
          <h2 className="text-2xl font-extrabold mb-6 text-pink-600 drop-shadow-lg" style={{ fontFamily: comicFont }}>DIALOGUE</h2>
          <div className="flex-1 overflow-y-auto text-xl text-black whitespace-pre-line" style={{ fontFamily: 'Inter, Arial, Helvetica, sans-serif', fontWeight: 500, lineHeight: 1.6, letterSpacing: '0.01em', textShadow: 'none' }}>
            {scene.dialogue}
          </div>
        </div>
        {/* Comic-style background pattern (optional) */}
        <style>{`
          .comic-bg-pattern {
            background-image: repeating-linear-gradient(135deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 2px, transparent 2px, transparent 20px);
          }
          .comic-speech-bubble {
            border-radius: 30px 30px 30px 0px/40px 40px 40px 0px;
            box-shadow: 8px 8px 0 #000, 0 0 0 4px #fff;
            border: 4px solid #000;
          }
        `}</style>
      </div>
    </div>
  );
};

export default ComicViewer; 