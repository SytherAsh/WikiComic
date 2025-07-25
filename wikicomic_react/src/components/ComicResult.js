import React from 'react';
import ComicFlipbook from './ComicFlipbook';

const ComicResult = ({ result, storyline, scenes, images }) => {
  return (
    <div className="mt-8">
      {result && (
        <div className="mb-4 bg-white border-2 border-black rounded-lg p-4">
          <h2 className="text-2xl font-bold mb-2">{result.title}</h2>
          <p className="mb-2">{result.summary}</p>
          {result.url && (
            <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Read more on Wikipedia</a>
          )}
        </div>
      )}
      {storyline && (
        <div className="mb-4">
          <h3 className="font-bold">Storyline</h3>
          <pre className="bg-gray-100 p-3 border rounded whitespace-pre-wrap">{storyline}</pre>
        </div>
      )}
      {scenes && scenes.length > 0 && (
        <div className="mb-4">
          <h4 className="font-bold">Scenes</h4>
          <ul className="list-disc pl-6">
            {scenes.map((scene, idx) => (
              <li key={idx} className="mb-2">
                <div><strong>Prompt:</strong> {scene.prompt}</div>
                <div><strong>Dialogue:</strong> {scene.dialogue}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
      {images && images.length > 0 && (
        <div className="mb-4">
          <h4 className="font-bold mb-2">Comic Flipbook</h4>
          <ComicFlipbook images={images} />
        </div>
      )}
    </div>
  );
};

export default ComicResult; 