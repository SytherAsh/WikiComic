import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { API_BASE_URL, getImageUrl } from '../config/routes';

const ComicsGallery = () => {
  const [comics, setComics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { currentTheme } = useTheme();

  useEffect(() => {
    fetchComics();
  }, []);

  const fetchComics = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('ComicsGallery: Fetching comics from:', `${API_BASE_URL}/comics`);
      const response = await axios.get(`${API_BASE_URL}/comics`);
      console.log('ComicsGallery: Response data:', response.data);
      if (response.data && response.data.comics) {
        setComics(response.data.comics);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('ComicsGallery: Error fetching comics:', err);
      setError('Failed to fetch comics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewComic = (comicTitle) => {
    navigate(`/comic/${encodeURIComponent(comicTitle)}`);
  };

  // Helper function to get the first image URL for a comic
  const getFirstImageUrl = (comic) => {
    console.log('ComicsGallery: Getting first image for comic:', comic.title);
    
    // Try to get from images array first (MongoDB format)
    if (comic.images && comic.images.length > 0) {
      const firstImage = comic.images[0];
      console.log('ComicsGallery: Found image in images array:', firstImage);
      return getImageUrl(firstImage);
    }
    
    // Fallback to scenes array
    if (comic.scenes && comic.scenes.length > 0) {
      const firstScene = comic.scenes[0];
      console.log('ComicsGallery: Found image in scenes array:', firstScene);
      return getImageUrl(firstScene);
    }
    
    console.log('ComicsGallery: No images found for comic:', comic.title);
    return '/placeholder-comic.png';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-800 to-blue-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-300 border-t-transparent"></div>
          <p className="mt-4 text-white text-xl font-bold">Loading your comics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-800 to-blue-900">
        <div className="text-center">
          <div className="bg-white border-4 border-black rounded-lg p-8 shadow-lg transform rotate-1" style={{ boxShadow: '8px 8px 0 rgba(0,0,0,0.8)' }}>
            <div className="text-red-500 text-2xl font-bold mb-4">{error}</div>
            <button
              onClick={() => navigate('/')}
              className="block mx-auto px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-full border-2 border-black transform hover:scale-105 transition-all duration-200"
              style={{ boxShadow: '4px 4px 0 rgba(0,0,0,0.8)' }}
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-800 to-blue-900">
      <div className="container mx-auto px-4 py-8">
        <header className="relative mb-12">
          <div className="flex justify-between items-center bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg border-3 border-black p-6 shadow-lg" style={{ boxShadow: '6px 6px 0 rgba(0,0,0,0.8)' }}>
            <div className="flex items-center space-x-4">
              <h1 className="text-4xl font-extrabold text-white transform -rotate-2">
                <span className="inline-block transform rotate-2">Your Comic Collection!</span>
              </h1>
            </div>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-full border-2 border-black transform hover:scale-105 transition-all duration-200 flex items-center"
              style={{ boxShadow: '4px 4px 0 rgba(0,0,0,0.8)' }}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Generator
            </button>
          </div>
        </header>
        
        {comics.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white border-4 border-black rounded-lg p-8 inline-block transform -rotate-1" style={{ boxShadow: '8px 8px 0 rgba(0,0,0,0.8)' }}>
              <div className="text-2xl font-bold mb-6">No comics generated yet!</div>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-full border-2 border-black transform hover:scale-105 transition-all duration-200"
                style={{ boxShadow: '4px 4px 0 rgba(0,0,0,0.8)' }}
              >
                Create Your First Comic
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {comics.map((comic) => (
              <div
                key={comic.title}
                className="bg-gradient-to-br from-yellow-200 via-pink-100 to-blue-200 border-4 border-black rounded-2xl overflow-hidden transform hover:scale-105 hover:shadow-2xl transition-all duration-300"
                style={{ boxShadow: '8px 8px 0 #000' }}
              >
                <div
                  className="relative aspect-w-16 aspect-h-9 cursor-pointer group"
                  onClick={() => handleViewComic(comic.title)}
                >
                  <img
                    src={getFirstImageUrl(comic)}
                    alt={comic.title}
                    className="object-cover w-full h-48 rounded-t-2xl border-b-4 border-black bg-white"
                    onError={(e) => {
                      console.error('ComicsGallery: Failed to load image for comic:', comic.title);
                      e.target.onerror = null;
                      e.target.src = '/placeholder-comic.png';
                    }}
                    onLoad={() => {
                      console.log('ComicsGallery: Image loaded successfully for comic:', comic.title);
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-yellow-300 text-black px-6 py-3 rounded-full font-extrabold border-2 border-black text-xl shadow-lg" style={{ fontFamily: 'Bangers, Comic Sans MS, Comic, cursive' }}>
                      View Comic
                    </span>
                  </div>
                </div>
                <div className="p-4 border-t-4 border-black bg-white rounded-b-2xl">
                  <h3 className="text-xl font-extrabold mb-2 truncate" style={{ fontFamily: 'Bangers, Comic Sans MS, Comic, cursive' }}>
                    {comic.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-bold text-purple-600">
                      {comic.scene_count || comic.scenes?.length || 0} {(comic.scene_count || comic.scenes?.length || 0) === 1 ? 'Scene' : 'Scenes'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComicsGallery; 