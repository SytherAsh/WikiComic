# WikiComic React Frontend

A React-based frontend for the WikiComic application that provides an interactive interface for generating and viewing comics from Wikipedia articles.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
REACT_APP_API_URL=http://localhost:5000
```

### 3. Start Development Server
```bash
npm start
```

The application will open at `http://localhost:3000`

## 📁 Project Structure

```
wikicomic_react/
├── public/
│   ├── index.html          # Main HTML template
│   └── favicon.ico         # App icon
├── src/
│   ├── components/         # React components
│   │   ├── LandingPage.js  # Main landing page
│   │   ├── ComicViewer.js  # Comic display component
│   │   ├── ComicsGallery.js # Gallery of comics
│   │   ├── Header.js       # Navigation header
│   │   ├── Footer.js       # Footer component
│   │   ├── MainForm.js     # Search form
│   │   ├── StyleSelector.js # Comic style selection
│   │   ├── ComplexitySlider.js # Complexity control
│   │   └── ...             # Other components
│   ├── config/
│   │   └── routes.js       # API endpoint configuration
│   ├── contexts/
│   │   └── ThemeContext.js # Theme management
│   ├── assets/
│   │   └── images/         # Static images
│   ├── App.js              # Main app component
│   ├── index.js            # App entry point
│   └── index.css           # Global styles
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Tailwind CSS configuration
└── README.md               # This file
```

## 🎨 Features

### Core Features
- **Wikipedia Search**: Search and select Wikipedia articles
- **Comic Generation**: Generate comics from articles using AI
- **Style Selection**: Choose from 6 different comic styles
- **Complexity Control**: Adjust content complexity level
- **Gallery View**: Browse previously generated comics
- **Responsive Design**: Works on desktop and mobile

### Comic Styles
- **Manga**: Japanese manga style with expressive characters
- **Western**: Classic American comic book style
- **Minimalist**: Clean, modern design
- **Cartoon**: Fun, family-friendly style
- **Noir**: Dark, dramatic black and white style
- **Indie**: Artistic, hand-drawn style

## 🔧 Configuration

### API Configuration
The app connects to the Flask backend via the `REACT_APP_API_URL` environment variable.

### Available Scripts
- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

## 🛠️ Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Check if Flask backend is running on port 5000
   - Verify `REACT_APP_API_URL` in `.env`
   - Check browser console for CORS errors

2. **Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check Node.js version (16+ required)

3. **Styling Issues**
   - Ensure Tailwind CSS is properly configured
   - Check if all CSS imports are present

4. **Component Errors**
   - Check browser console for React errors
   - Verify all required props are passed

### Development Tips

1. **Hot Reload**: Changes automatically reload in development
2. **Error Overlay**: React shows errors in browser overlay
3. **React DevTools**: Install browser extension for debugging

## 🎯 Key Components

### LandingPage.js
Main application interface with:
- Search functionality
- Style selection
- Complexity controls
- Comic generation
- Results display

### ComicViewer.js
Displays generated comics with:
- Panel-by-panel navigation
- Zoom and pan controls
- Download functionality
- Sharing options

### ComicsGallery.js
Shows all generated comics with:
- Grid layout
- Search and filter
- Preview thumbnails
- Quick access to full comics

## 🔒 Security Considerations

- API keys are handled server-side only
- Input validation on both client and server
- CORS properly configured
- No sensitive data stored in localStorage

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1920px+)
- Tablet (768px - 1024px)
- Mobile (320px - 768px)

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy Options
1. **Vercel**: Connect GitHub repository
2. **Netlify**: Drag and drop build folder
3. **AWS S3**: Upload build folder
4. **Custom Server**: Serve build folder

### Environment Variables for Production
```env
REACT_APP_API_URL=https://your-backend-domain.com
```

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Verify backend API is running
4. Check network tab for API calls

## 🔄 API Integration

The frontend communicates with the Flask backend through these endpoints:

- `GET/POST /search` - Search and generate comics
- `GET /suggest` - Get search suggestions
- `GET /comics` - List all comics
- `GET /comic/<title>` - Get specific comic

All API calls are configured in `src/config/routes.js`. 