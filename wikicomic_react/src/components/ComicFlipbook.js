import React, { useState } from 'react';

const ComicFlipbook = ({ images = [] }) => {
  const [page, setPage] = useState(0);
  const [imageErrors, setImageErrors] = useState({});

  console.log('ComicFlipbook received images:', images);

  if (!images.length) {
    console.log('No images provided to ComicFlipbook');
    return <div className="text-center">No comic images to display.</div>;
  }

  const handleImageError = (index) => {
    console.error(`Failed to load image at index ${index}:`, images[index]);
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };

  const handleImageLoad = (index) => {
    console.log(`Image loaded successfully at index ${index}:`, images[index]);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-full flex justify-center mb-4">
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          className="px-4 py-2 m-2 bg-gray-200 rounded border border-black disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => setPage((p) => Math.min(images.length - 1, p + 1))}
          disabled={page === images.length - 1}
          className="px-4 py-2 m-2 bg-gray-200 rounded border border-black disabled:opacity-50"
        >
          Next
        </button>
      </div>
      <div className="w-full flex justify-center">
        {imageErrors[page] ? (
          <div className="max-w-full max-h-[70vh] border-2 border-red-500 rounded shadow-lg flex items-center justify-center bg-red-50">
            <div className="text-center p-4">
              <div className="text-red-600 font-bold">Failed to load image</div>
              <div className="text-sm text-gray-600 mt-2">URL: {images[page]}</div>
            </div>
          </div>
        ) : (
          <img
            src={images[page]}
            alt={`Comic page ${page + 1}`}
            className="max-w-full max-h-[70vh] border-2 border-black rounded shadow-lg"
            onError={() => handleImageError(page)}
            onLoad={() => handleImageLoad(page)}
          />
        )}
      </div>
      <div className="mt-2 text-center">Page {page + 1} of {images.length}</div>
      <div className="mt-2 text-sm text-gray-600">
        Current image URL: {images[page]}
      </div>
    </div>
  );
};

export default ComicFlipbook; 