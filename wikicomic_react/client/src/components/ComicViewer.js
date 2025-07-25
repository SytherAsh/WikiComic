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

  // Flipbook UI
  const scene = comic.scenes[currentScene];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center py-8 px-4">
      <div className="bg-white border-4 border-black rounded-xl shadow-2xl flex w-full max-w-5xl min-h-[600px]">
        {/* Main Image */}
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <h1 className="text-3xl font-bold mb-4 text-center">{comic.title}</h1>
          <img
            src={scene.image.startsWith('http') ? scene.image : `${API_BASE_URL}${scene.image}`}
            alt={`Scene ${currentScene + 1}`}
            className="w-full max-w-2xl h-[400px] object-contain rounded-lg border-4 border-black bg-gray-100"
            style={{ background: '#fff' }}
          />
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={handlePreviousScene}
              disabled={currentScene === 0}
              className="px-6 py-2 bg-gray-300 rounded-lg border-2 border-black font-bold text-lg disabled:opacity-50"
            >
              Previous
            </button>
            <span className="font-bold text-lg">
              Scene {currentScene + 1} of {comic.scenes.length}
            </span>
            <button
              onClick={handleNextScene}
              disabled={currentScene === comic.scenes.length - 1}
              className="px-6 py-2 bg-gray-300 rounded-lg border-2 border-black font-bold text-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
          {/* Thumbnails */}
          <div className="flex mt-6 space-x-2 overflow-x-auto">
            {comic.scenes.map((s, idx) => (
              <img
                key={idx}
                src={s.image.startsWith('http') ? s.image : `${API_BASE_URL}${s.image}`}
                alt={`Thumbnail ${idx + 1}`}
                className={`w-16 h-16 object-cover rounded border-2 cursor-pointer ${currentScene === idx ? 'border-blue-500' : 'border-gray-300'}`}
                onClick={() => setCurrentScene(idx)}
              />
            ))}
          </div>
        </div>
        {/* Sidebar for Dialogue */}
        <div className="w-80 bg-gray-50 border-l-4 border-black p-6 flex flex-col">
          <h2 className="text-xl font-bold mb-4">Dialogue</h2>
          <div className="flex-1 overflow-y-auto text-lg whitespace-pre-line">
            {scene.dialogue}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComicViewer; 