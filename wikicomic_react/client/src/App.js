import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import ComicViewer from './components/ComicViewer';
import ComicsGallery from './components/ComicsGallery';
import { ThemeProvider } from './contexts/ThemeContext';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/gallery" element={<ComicsGallery />} />
          <Route path="/comic/:id" element={<ComicViewer />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
