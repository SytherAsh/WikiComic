import React from 'react';

const ComplexitySlider = ({ complexity, setComplexity, setComplexityLevel, t }) => (
  <div className="mb-8">
    <div className="text-center mb-2">
      <span className="inline-block bg-orange-500 text-white text-xl font-bold py-1 px-4 rounded-full border-2 border-black" style={{ boxShadow: '3px 3px 0 rgba(0,0,0,0.8)' }}>
        {t.brainPowerLevel}
      </span>
    </div>
    <div className="mt-4 px-4">
      <div 
        className="w-full h-12 bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 rounded-full border-2 border-black relative"
        style={{ boxShadow: '3px 3px 0 rgba(0,0,0,0.8)' }}
      >
        <input
          type="range"
          min="0"
          max="100"
          value={complexity}
          onChange={(e) => {
            setComplexity(parseInt(e.target.value));
            if (e.target.value < 33) {
              setComplexityLevel('Elementary');
            } else if (e.target.value < 66) {
              setComplexityLevel('High School');
            } else {
              setComplexityLevel('College');
            }
          }}
          className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
        />
        {/* Custom slider handle */}
        <div 
          className="absolute top-1/2 transform -translate-y-1/2 w-8 h-14 bg-white border-2 border-black rounded-full cursor-grab"
          style={{ 
            left: `calc(${complexity}% - 16px)`, 
            boxShadow: '2px 2px 0 rgba(0,0,0,0.8)',
            transition: 'left 0.1s ease-out'
          }}
        >
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-1 h-8 bg-gray-300 rounded-full"></div>
          </div>
        </div>
        {/* Level markers */}
        <div className="absolute -bottom-10 left-0 right-0 flex justify-between px-4 text-sm font-bold">
          <div className="flex flex-col items-center">
            <div className="w-1 h-4 bg-black"></div>
            <span>{t.elementary}</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-1 h-4 bg-black"></div>
            <span>{t.highSchool}</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-1 h-4 bg-black"></div>
            <span>{t.college}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default ComplexitySlider; 