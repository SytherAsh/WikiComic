import React, { useEffect, useState } from 'react';
import ComicFlipbook from './ComicFlipbook';

const API_BASE_URL = 'http://localhost:5000';

function getImageUrl(image) {
  if (!image) return '/placeholder-comic.png';
  if (image.startsWith('http')) return image;
  // Encode spaces and special characters
  return API_BASE_URL + encodeURI(image);
}

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
        const res = await fetch(`${API_BASE_URL}comics`);
        if (!res.ok) throw new Error('Failed to fetch comics');
        const data = await res.json();
        setComics(data.comics || []);
      } catch (err) {
        setError('Failed to load previous comics.');
      } finally {
        setLoading(false);
      }
    };
    fetchComics();
  }, []);

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
                  src={getImageUrl(comic.images && comic.images[0])}
                  alt={comic.title}
                  className="w-full h-40 object-cover rounded"
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div>
          <button className="mb-4 px-4 py-2 bg-gray-200 border border-black rounded" onClick={() => setSelectedComic(null)}>Back to Gallery</button>
          <ComicFlipbook images={selectedComic.images} />
        </div>
      )}
    </div>
  );
};

export default PreviousComics; 