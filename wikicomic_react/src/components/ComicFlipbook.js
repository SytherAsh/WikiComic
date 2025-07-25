import React, { useState } from 'react';

const ComicFlipbook = ({ images = [] }) => {
  const [page, setPage] = useState(0);
  if (!images.length) return <div className="text-center">No comic images to display.</div>;
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
        <img
          src={images[page]}
          alt={`Comic page ${page + 1}`}
          className="max-w-full max-h-[70vh] border-2 border-black rounded shadow-lg"
        />
      </div>
      <div className="mt-2 text-center">Page {page + 1} of {images.length}</div>
    </div>
  );
};

export default ComicFlipbook; 