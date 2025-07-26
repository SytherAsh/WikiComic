import React, { useEffect, useState } from 'react';
import ComicFlipbook from './ComicFlipbook';
import { API_BASE_URL, getImageUrl } from '../config/routes';

const PreviousComics = () => {
  const [comics, setComics] = useState([]);
  const [selectedComic, setSelectedComic] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchComics = async () => {
      setLoading(true);
      setError('');
      try {
        console.log('PreviousComics: Fetching from:', `${API_BASE_URL}/comics`);
        const res = await fetch(`${API_BASE_URL}/comics`);
        console.log('PreviousComics: Response status:', res.status);
        if (!res.ok) throw new Error('Failed to fetch comics');
        const data = await res.json();
        console.log('PreviousComics: Data received:', data);
        setComics(data.comics || []);
      } catch (err) {
        console.error('PreviousComics: Error:', err);
        setError('Failed to load previous comics.');
      } finally {
        setLoading(false);
      }
    };
    fetchComics();
  }, []);

  // Convert MongoDB image format to URLs for ComicFlipbook
  const getImageUrls = (comic) => {
    console.log('getImageUrls called with comic:', comic);
    if (!comic.images || !Array.isArray(comic.images)) {
      console.log('No images array found, returning empty array');
      return [];
    }
    const urls = comic.images.map(img => {
      const url = getImageUrl(img);
      console.log('Converted image:', img, 'to URL:', url);
      return url;
    });
    console.log('Final image URLs:', urls);
    return urls;
  };

  const handleImageError = (e, comicTitle) => {
    console.error(`Failed to load image for comic: ${comicTitle}`, e);
    e.target.src = '/placeholder-comic.png';
  };

  return (
    <div className="my-8">
      <h2 className="text-2xl font-bold mb-4">Previous Comics</h2>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!selectedComic ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {comics.map((comic) => (
            <div key={comic.title} className="border-2 border-black rounded-lg p-2 cursor-pointer hover:bg-gray-100" onClick={() => setSelectedComic(comic)}>
              <div className="font-bold mb-2">{comic.title}</div>
              {comic.images && comic.images[0] && (
                <img
                  src={getImageUrl(comic.images[0])}
                  alt={comic.title}
                  className="w-full h-40 object-cover rounded"
                  onError={(e) => handleImageError(e, comic.title)}
                  onLoad={() => console.log(`Image loaded successfully for: ${comic.title}`)}
                />
              )}
              {(!comic.images || comic.images.length === 0) && (
                <div className="w-full h-40 bg-gray-200 flex items-center justify-center rounded">
                  <span className="text-gray-500">No images</span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div>
          <button className="mb-4 px-4 py-2 bg-gray-200 border border-black rounded" onClick={() => setSelectedComic(null)}>Back to Gallery</button>
          <ComicFlipbook images={getImageUrls(selectedComic)} />
        </div>
      )}
    </div>
  );
};

export default PreviousComics; 