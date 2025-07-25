import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../contexts/ThemeContext';
import QuizComponent from './QuizComponent';

const API_BASE_URL = 'http://localhost:8000/comic';

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
  }, [id]);

  const fetchComic = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/comics/?comic_id=${id}`);
      const comicData = response.data.results.find(c => c.id === id);
      if (comicData) {
        setComic(comicData);
        setComicStyle(comicData.comicStyle);
        setError(null);
      } else {
        setError('Comic not found');
      }
    } catch (err) {
      setError('Failed to load comic');
      console.error('Error loading comic:', err);
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

  const currentSceneData = comic.scenes[currentScene];
  const { overlayColor, panelStyle, pageStyle, buttonStyle, explosionColor } = getThemeClasses();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">{comic.title}</h1>
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => navigate('/gallery')}
              className="inline-flex items-center px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Gallery
            </button>
            <span className={`px-3 py-1 rounded-full text-sm ${
              comic.status === 'completed' ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
            }`}>
              {comic.status}
            </span>
          </div>
        </div>

        {/* Comic Scene Viewer */}
        <div className="bg-gray-800 rounded-lg shadow-2xl overflow-hidden">
          {/* Scene Navigation */}
          <div className="p-4 bg-gray-900 flex items-center justify-between">
            <button
              onClick={handlePreviousScene}
              disabled={currentScene === 0}
              className={`px-4 py-2 rounded-lg ${
                currentScene === 0
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              Previous Scene
            </button>
            <span className="text-white font-medium">
              Scene {currentScene + 1} of {comic.scenes.length}
            </span>
            <button
              onClick={handleNextScene}
              disabled={currentScene === comic.scenes.length - 1}
              className={`px-4 py-2 rounded-lg ${
                currentScene === comic.scenes.length - 1
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              Next Scene
            </button>
          </div>

          {/* Scene Image */}
          <div className="relative aspect-w-16 aspect-h-9">
            <img
              src={`${API_BASE_URL}/media/${currentSceneData.image}`}
              alt={`Scene ${currentScene + 1}`}
              className="object-contain w-full h-full"
            />
          </div>

          {/* Scene Info */}
          <div className="p-6">
            <h3 className="text-xl font-semibold text-white mb-2">
              Scene {currentSceneData.number}
            </h3>
            {currentSceneData.dialogue && (
              <div className="bg-gray-700 rounded-lg p-4 mb-4">
                <p className="text-white whitespace-pre-line">
                  {currentSceneData.dialogue}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Scene Thumbnails */}
        <div className="mt-8 overflow-x-auto">
          <div className="flex space-x-4 pb-4">
            {comic.scenes.map((scene, index) => (
              <button
                key={scene.number}
                onClick={() => setCurrentScene(index)}
                className={`relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 ${
                  currentScene === index ? 'border-purple-500' : 'border-transparent'
                }`}
              >
                <img
                  src={`${API_BASE_URL}/media/${scene.image}`}
                  alt={`Scene ${scene.number} thumbnail`}
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">{scene.number}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key points sidebar - slide in from right with comic styling */}
      <div
        className={`key-points-sidebar fixed inset-y-0 right-0 z-20 transition-transform duration-300 transform ${
          showKeyPoints ? 'translate-x-0' : 'translate-x-full'
        } w-80 bg-white border-l-4 border-black`}
        style={{ 
          marginTop: '61px',
          boxShadow: '-5px 0 10px rgba(0,0,0,0.3)'
        }}
      >
        <div className="relative h-full overflow-y-auto">
          {/* Sidebar pattern background */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}></div>
          
          <div className="relative z-10 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold font-comic bg-yellow-300 px-4 py-1 -rotate-2 border-2 border-black" style={{ boxShadow: '3px 3px 0 rgba(0,0,0,0.5)' }}>
                KEY NOTES!
              </h2>
              <button
                onClick={toggleKeyPoints}
                className="text-gray-400 hover:text-black transform hover:rotate-90 transition-transform"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6 font-comic bg-purple-100 border-2 border-purple-300 rounded-lg p-3 text-purple-800">
              Page {currentScene + 1} of {comic.scenes.length}
              <div className="text-xs mt-1">Capturing these points earns you XP!</div>
            </div>
            
            <ul className="space-y-4">
              {currentSceneData.dialogue && currentSceneData.dialogue.split('\n').filter(point => point.trim()).map((point, index) => (
                <li key={index} className="animate-fadeIn" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="bg-white border-2 border-black rounded-lg p-3 font-comic text-black relative" style={{ boxShadow: '3px 3px 0 rgba(0,0,0,0.3)' }}>
                    {/* Small explosion in corner */}
                    <div className="absolute -top-2 -left-2 w-8 h-8">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="absolute left-1/2 top-1/2 bg-yellow-400 h-0.5" style={{
                          width: '8px',
                          transformOrigin: 'left center',
                          transform: `rotate(${i * 45}deg)`
                        }}></div>
                      ))}
                      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-yellow-400 border border-black"></div>
                    </div>
                    
                    <div className="pl-4">{point}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      {/* Overlay when sidebar is open */}
      {showKeyPoints && (
        <div 
          className="fixed inset-0 bg-black/50 z-10"
          onClick={toggleKeyPoints}
        ></div>
      )}

      {/* Keyboard shortcut hint */}
      <div className="fixed bottom-4 left-4 bg-white border-2 border-black rounded-lg px-3 py-2 font-comic text-sm shadow-lg" style={{ boxShadow: '3px 3px 0 rgba(0,0,0,0.5)' }}>
        <div className="flex items-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M9 9h6v6H9z" />
            <path d="M9 1v3" />
            <path d="M15 1v3" />
            <path d="M9 20v3" />
            <path d="M15 20v3" />
          </svg>
          <span className="ml-1 font-bold">PRO TIPS:</span>
        </div>
        <p>↑ and ↓ keys to navigate pages</p>
        <p>Press "i" to toggle key points</p>
      </div>
      
      {/* Achievement notification */}
      {achievementUnlocked && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-black font-comic px-8 py-4 rounded-lg border-3 border-black shadow-xl z-50 animate-wiggle" style={{ boxShadow: '5px 5px 0 rgba(0,0,0,0.8)' }}>
          <div className="relative">
            {/* Explosion rays */}
            <div className="absolute -inset-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="absolute left-1/2 top-1/2 bg-yellow-300 h-1" style={{
                  width: '30px',
                  transformOrigin: 'left center',
                  transform: `translate(-50%, -50%) rotate(${i * 30}deg)`
                }}></div>
              ))}
            </div>
            
            <div className="flex flex-col items-center relative">
              <div className="flex items-center mb-3">
                <svg className="h-8 w-8 mr-3 text-yellow-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="gold" stroke="currentColor" />
                </svg>
                <div>
                  <div className="text-xl font-bold">ACHIEVEMENT UNLOCKED!</div>
                  <div className="text-lg">Comic Completed: +50 XP</div>
                </div>
              </div>
              
              <button 
                onClick={handleStartQuiz}
                className="mt-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white px-5 py-2 rounded-lg border-2 border-black transform hover:scale-105 transition-transform"
                style={{ boxShadow: '3px 3px 0 rgba(0,0,0,0.5)' }}
              >
                Test Your Knowledge! Take The Quiz!
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Comic-style footer */}
      <footer className="mt-12 py-4 bg-blue-800 text-white relative overflow-hidden" style={{ borderTop: '3px solid black' }}>
        <div className="comic-dots absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '10px 10px'
        }}></div>
        
        <div className="container mx-auto text-center relative z-10">
          <p className="text-lg font-bold" style={{ fontFamily: 'Comic Sans MS, cursive' }}>WIKICOMICS - LEARN IN STYLE!</p>
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

      {/* Show quiz if it's active */}
      {showQuiz && (
        <QuizComponent 
          quizData={generateQuizData()} 
          onComplete={handleQuizComplete} 
          comicTopic={comic.title}
        />
      )}
    </div>
  );
};

export default ComicViewer; 