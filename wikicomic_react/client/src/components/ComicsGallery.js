import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const API_BASE_URL = 'http://localhost:8000/comic';

const ComicsGallery = () => {
  const [comics, setComics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();
  const { currentTheme } = useTheme();

  useEffect(() => {
    fetchComics();
  }, [currentPage, retryCount]);

  const fetchComics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/api/comics/?page=${currentPage}`);
      
      if (response.data && response.data.results) {
        setComics(response.data.results);
        setTotalPages(response.data.total_pages || 1);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching comics:', err);
      setError(err.response?.data?.error || 'Failed to fetch comics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewComic = (comicId) => {
    navigate(`/comic/${comicId}`);
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const formatDate = (timestamp) => {
    try {
      return new Date(timestamp * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Date unavailable';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-800 to-blue-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-300 border-t-transparent"></div>
          <p className="mt-4 text-white text-xl font-bold">Loading your comics...</p>
          {/* Comic style explosion lines */}
          <div className="absolute left-1/4 bottom-1/4 w-20 h-20">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="absolute left-0 bottom-0 bg-yellow-300 h-1" style={{
                width: '20px',
                transformOrigin: '0 100%',
                transform: `rotate(${i * 30}deg)`,
                opacity: 0.7
              }}></div>
            ))}
          </div>
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
            <div className="space-y-4">
              <button
                onClick={handleRetry}
                className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-full border-2 border-black transform hover:scale-105 transition-all duration-200"
                style={{ boxShadow: '4px 4px 0 rgba(0,0,0,0.8)' }}
              >
                Try Again
              </button>
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-800 to-blue-900">
      {/* Comic dots overlay */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }}></div>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="relative mb-12">
          <div className="flex justify-between items-center bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg border-3 border-black p-6 shadow-lg" style={{ boxShadow: '6px 6px 0 rgba(0,0,0,0.8)' }}>
            <div className="flex items-center space-x-4">
              <h1 className="text-4xl font-extrabold text-white transform -rotate-2">
                <span className="inline-block transform rotate-2">Your Comic Collection!</span>
                <svg className="inline-block ml-2 text-yellow-300" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="yellow" stroke="currentColor" />
                </svg>
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
          
          {/* Comic style explosion lines */}
          <div className="absolute -top-4 -left-4 w-20 h-20">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="absolute left-0 top-0 bg-yellow-300 h-1" style={{
                width: '20px',
                transformOrigin: '0 0',
                transform: `rotate(${i * 30}deg)`,
                opacity: 0.7
              }}></div>
            ))}
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
          <>
            {/* Comics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {comics.map((comic) => (
                <div
                  key={comic.id}
                  className="bg-white border-4 border-black rounded-lg overflow-hidden transform hover:rotate-1 hover:scale-105 transition-all duration-300"
                  style={{ boxShadow: '6px 6px 0 rgba(0,0,0,0.8)' }}
                >
                  {/* Comic Preview */}
                  <div 
                    className="relative aspect-w-16 aspect-h-9 cursor-pointer group" 
                    onClick={() => handleViewComic(comic.id)}
                  >
                    {comic.scenes && comic.scenes[0] && (
                      <img
                        src={`${API_BASE_URL}/media/${comic.scenes[0].image}`}
                        alt={comic.title}
                        className="object-cover w-full h-48"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder-comic.png';
                        }}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="bg-yellow-400 text-black px-4 py-2 rounded-full font-bold border-2 border-black transform rotate-2" style={{ boxShadow: '3px 3px 0 rgba(0,0,0,0.8)' }}>
                          View Comic
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Comic Info */}
                  <div className="p-4 border-t-4 border-black bg-gradient-to-b from-white to-gray-50">
                    <h3 className="text-xl font-bold mb-2 truncate">
                      {comic.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      Created: {formatDate(comic.created_at)}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        comic.status === 'completed' ? 'bg-green-100 text-green-800 border-2 border-green-500' :
                        comic.status === 'failed' ? 'bg-red-100 text-red-800 border-2 border-red-500' :
                        'bg-yellow-100 text-yellow-800 border-2 border-yellow-500'
                      }`}>
                        {comic.status}
                      </span>
                      <div className="text-sm font-bold text-purple-600">
                        {comic.scenes?.length || 0} {comic.scenes?.length === 1 ? 'Scene' : 'Scenes'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-full border-2 border-black font-bold transform hover:scale-105 transition-all duration-200 ${
                    currentPage === 1
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:-rotate-2'
                  }`}
                  style={{ boxShadow: currentPage === 1 ? 'none' : '4px 4px 0 rgba(0,0,0,0.8)' }}
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-full border-2 border-black font-bold transform hover:scale-105 transition-all duration-200 ${
                      currentPage === page
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rotate-3'
                        : 'bg-white text-black hover:rotate-3'
                    }`}
                    style={{ boxShadow: '4px 4px 0 rgba(0,0,0,0.8)' }}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-full border-2 border-black font-bold transform hover:scale-105 transition-all duration-200 ${
                    currentPage === totalPages
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:rotate-2'
                  }`}
                  style={{ boxShadow: currentPage === totalPages ? 'none' : '4px 4px 0 rgba(0,0,0,0.8)' }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ComicsGallery; 