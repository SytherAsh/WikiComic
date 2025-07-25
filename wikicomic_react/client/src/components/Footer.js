import React from 'react';

const Footer = ({ t }) => (
  <footer className="mt-12 py-4 bg-blue-800 text-white relative overflow-hidden" style={{ borderTop: '3px solid black' }}>
    {/* Comic dots overlay - keeping it for the footer */}
    <div className="comic-dots absolute inset-0 opacity-20" style={{
      backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
      backgroundSize: '10px 10px'
    }}></div>
    <div className="container mx-auto text-center relative z-10">
      <p className="text-lg font-bold" style={{ fontFamily: 'Comic Sans MS, cursive' }}>{t.learnInStyle}</p>
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
);

export default Footer; 