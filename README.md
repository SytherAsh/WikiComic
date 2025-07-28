# 🎨 WikiComic - AI-Powered Comic Generator

> **Transform Wikipedia articles into stunning comics using AI!** 🚀

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://python.org)
[![React](https://img.shields.io/badge/React-19.1.0-61dafb.svg)](https://reactjs.org)
[![Flask](https://img.shields.io/badge/Flask-2.0+-green.svg)](https://flask.palletsprojects.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248.svg)](https://mongodb.com)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📖 Table of Contents

- [🌟 What is WikiComic?](#-what-is-wikicomic)
- [✨ Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [🚀 Quick Start](#-quick-start)
- [📦 Installation](#-installation)
- [⚙️ Configuration](#️-configuration)
- [🎯 Usage](#-usage)
- [🔧 API Reference](#-api-reference)
- [📁 Project Structure](#-project-structure)
- [🛠️ Development](#️-development)
- [🚀 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [📝 License](#-license)

## 🌟 What is WikiComic?

WikiComic is an innovative web application that transforms Wikipedia articles into engaging comics using cutting-edge AI technology. Simply search for any Wikipedia topic, and watch as the AI generates a complete comic story with custom illustrations, dialogue, and narrative flow.

### 🎯 Key Capabilities

- **🔍 Wikipedia Integration**: Search and extract content from Wikipedia articles
- **🤖 AI Story Generation**: Create compelling narratives using Groq AI
- **🎨 AI Image Generation**: Generate custom illustrations with Google Gemini
- **📚 Multiple Comic Styles**: Choose from 6 different artistic styles
- **⚡ Real-time Generation**: Generate comics in seconds
- **💾 Persistent Storage**: Save and manage your comic library
- **📱 Responsive Design**: Works perfectly on all devices

## ✨ Features

### 🎨 Comic Styles Available
- **🇯🇵 Manga**: Japanese manga style with expressive characters
- **🇺🇸 Western**: Classic American comic book style
- **🎯 Minimalist**: Clean, modern design with simple lines
- **🎪 Cartoon**: Fun, family-friendly animated style
- **🎭 Noir**: Dark, dramatic black and white style
- **🎨 Indie**: Artistic, hand-drawn indie comic style

### 🚀 Core Features
- **Smart Content Extraction**: Automatically extracts key information from Wikipedia
- **Intelligent Story Structuring**: Breaks down complex topics into digestible scenes
- **Dynamic Dialogue Generation**: Creates natural conversations between characters
- **Customizable Complexity**: Adjust content depth for different audiences
- **Gallery Management**: Browse, search, and organize your comic collection
- **Export & Share**: Download comics and share with others

## 🏗️ Architecture

WikiComic is built with a modern, scalable architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend│    │  Flask Backend  │    │   MongoDB Atlas │
│   (Port 3000)   │◄──►│   (Port 5000)   │◄──►│   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Tailwind CSS  │    │   Groq AI API   │    │   Comic Storage │
│   (Styling)     │    │  (Story Gen)    │    │   (Metadata)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Responsive    │    │  Gemini AI API  │    │   Search &      │
│   UI/UX         │    │  (Image Gen)    │    │   Filtering     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+** 🐍
- **Node.js 16+** 📦
- **MongoDB Atlas Account** 🗄️
- **API Keys** 🔑
  - Groq API Key
  - Google Gemini API Key

### 🎯 One-Click Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/WikiComic.git
   cd WikiComic
   ```

2. **Set Up Environment Variables**
   ```bash
   # Copy environment templates
   cp wikicomic_flask/env_example.txt wikicomic_flask/.env
   cp wikicomic_react/env.example wikicomic_react/.env
   ```

3. **Configure API Keys** (See [Configuration](#️-configuration) section)

4. **Start Both Services**
   ```bash
   # Terminal 1: Start Flask Backend
   cd wikicomic_flask
   pip install -r requirements.txt
   python run.py

   # Terminal 2: Start React Frontend
   cd wikicomic_react
   npm install
   npm start
   ```

5. **Open Your Browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📦 Installation

### 🔧 Backend Setup (Flask)

```bash
# Navigate to Flask directory
cd wikicomic_flask

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp env_example.txt .env
# Edit .env with your API keys and MongoDB URI

# Initialize database
python init_database.py

# Start the server
python run.py
```

### 🎨 Frontend Setup (React)

```bash
# Navigate to React directory
cd wikicomic_react

# Install dependencies
npm install

# Set up environment variables
cp env.example .env
# Edit .env with your backend API URL

# Start development server
npm start
```

### 🗄️ Database Setup (MongoDB)

1. **Create MongoDB Atlas Account**
   - Visit [MongoDB Atlas](https://cloud.mongodb.com)
   - Create a free cluster
   - Get your connection string

2. **Configure Database**
   ```bash
   # Add to your .env file
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
   MONGODB_DB=Wikicomic
   MONGODB_COLLECTION=comics
   ```

## ⚙️ Configuration

### 🔑 Required API Keys

#### 1. Groq API Key
- Visit [Groq Console](https://console.groq.com)
- Create an account and get your API key
- Add to `.env`: `GROQ_API_KEY=your-groq-api-key`

#### 2. Google Gemini API Key
- Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
- Create an API key
- Add to `.env`: `GEMINI_API_KEY=your-gemini-api-key`

### 📝 Environment Variables

#### Backend (.env)
```bash
# Flask Configuration
SECRET_KEY=your-secret-key-change-in-production
DEBUG=True

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=Wikicomic
MONGODB_COLLECTION=comics

# API Keys (Required)
GROQ_API_KEY=your-groq-api-key-here
GEMINI_API_KEY=your-gemini-api-key-here

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Comic Generation Settings
DEFAULT_COMIC_STYLE=Manga
DEFAULT_COMIC_LENGTH=medium
MAX_SCENES=10

# Image Generation Settings
IMAGE_FORMAT=base64
IMAGE_QUALITY=95
```

#### Frontend (.env)
```bash
REACT_APP_API_URL=http://localhost:5000
```

## 🎯 Usage

### 🎨 Creating Your First Comic

1. **Open the Application**
   - Navigate to http://localhost:3000
   - You'll see the main search interface

2. **Search for a Topic**
   - Enter any Wikipedia topic (e.g., "Albert Einstein", "Space Exploration")
   - The app will search Wikipedia and show available articles

3. **Select Comic Style**
   - Choose from 6 different artistic styles
   - Each style creates a unique visual experience

4. **Adjust Complexity**
   - Use the slider to control content depth
   - Higher complexity = more detailed scenes

5. **Generate Comic**
   - Click "Generate Comic" and wait for AI processing
   - Watch as your comic comes to life!

6. **View & Share**
   - Navigate through comic panels
   - Download or share your creation
   - Save to your personal gallery

### 📚 Managing Your Comics

- **Gallery View**: Browse all your generated comics
- **Search & Filter**: Find specific comics quickly
- **Preview Thumbnails**: See comic previews at a glance
- **Full-Screen View**: Immersive comic reading experience

## 🔧 API Reference

### 🚀 Core Endpoints

#### Search & Generation
```http
GET/POST /search
Content-Type: application/json

{
  "query": "Albert Einstein",
  "style": "Manga",
  "complexity": "medium"
}
```

#### Comic Management
```http
GET /comics                    # List all comics
GET /comic/<title>            # Get specific comic
GET /suggest?q=<query>        # Get search suggestions
```

### 📊 Response Format

```json
{
  "success": true,
  "comic": {
    "title": "Albert Einstein",
    "style": "Manga",
    "storyline": "A journey through Einstein's discoveries...",
    "summary": "Albert Einstein was a German-born theoretical physicist...",
    "scenes": [
      {
        "scene_number": 1,
        "prompt": "Young Einstein in a classroom",
        "dialogue": "Why does light behave this way?",
        "image": "base64_encoded_image_data",
        "image_format": "base64"
      }
    ],
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

## 📁 Project Structure

```
WikiComic/
├── 📁 wikicomic_flask/           # Flask Backend
│   ├── 📁 app/
│   │   ├── 📁 routes/            # API endpoints
│   │   ├── 📁 utils/             # Utility modules
│   │   ├── 📁 models/            # Data models
│   │   ├── 📁 templates/         # HTML templates
│   │   ├── 📁 static/            # Static files
│   │   ├── __init__.py           # Flask app factory
│   │   ├── config.py             # Configuration
│   │   └── database.py           # Database operations
│   ├── requirements.txt          # Python dependencies
│   ├── run.py                    # Entry point
│   ├── env_example.txt           # Environment template
│   └── README.md                 # Backend documentation
│
├── 📁 wikicomic_react/           # React Frontend
│   ├── 📁 src/
│   │   ├── 📁 components/        # React components
│   │   ├── 📁 config/            # Configuration
│   │   ├── 📁 contexts/          # React contexts
│   │   ├── 📁 assets/            # Static assets
│   │   ├── App.js                # Main app component
│   │   └── index.js              # Entry point
│   ├── package.json              # Node dependencies
│   ├── tailwind.config.js        # Tailwind configuration
│   └── README.md                 # Frontend documentation
│
├── 📁 wikicomic_vercel_ready/    # Vercel Deployment
│   ├── 📁 app/                   # Flask app for Vercel
│   ├── 📁 api/                   # Vercel serverless functions
│   ├── vercel.json               # Vercel configuration
│   └── requirements.txt          # Production dependencies
│
└── README.md                     # This file
```

## 🛠️ Development

### 🔧 Backend Development

```bash
cd wikicomic_flask

# Run in development mode
export FLASK_ENV=development
python run.py

# Run tests
python test_startup.py

# Database operations
python db_operations.py --action list
python db_operations.py --action export --file backup.json
```

### 🎨 Frontend Development

```bash
cd wikicomic_react

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

### 🧪 Testing

```bash
# Backend tests
cd wikicomic_flask
python test_startup.py

# Frontend tests
cd wikicomic_react
npm test
```

## 🚀 Deployment

### 🌐 Vercel Deployment (Recommended)

The project includes a Vercel-ready version for easy deployment:

```bash
# Deploy to Vercel
cd wikicomic_vercel_ready
vercel

# Set environment variables in Vercel dashboard
# Deploy with custom domain
vercel --prod
```

### 🐳 Docker Deployment

```dockerfile
# Backend Dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["python", "run.py"]
```

### ☁️ Other Deployment Options

- **Heroku**: Use the Flask app with Procfile
- **AWS**: Deploy using Elastic Beanstalk
- **Google Cloud**: Use App Engine
- **DigitalOcean**: Deploy on App Platform

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### 🐛 Reporting Bugs
1. Check existing issues
2. Create a new issue with detailed description
3. Include steps to reproduce

### 💡 Suggesting Features
1. Open a feature request issue
2. Describe the feature and its benefits
3. Provide mockups if possible

### 🔧 Code Contributions
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### 📋 Development Guidelines
- Follow PEP 8 for Python code
- Use ESLint for JavaScript/React
- Write meaningful commit messages
- Add documentation for new features

## 🐛 Troubleshooting

### Common Issues

#### 🔑 API Key Problems
```bash
# Check if API keys are set correctly
echo $GROQ_API_KEY
echo $GEMINI_API_KEY
```

#### 🗄️ Database Connection Issues
```bash
# Test MongoDB connection
cd wikicomic_flask
python init_database.py
```

#### 🌐 CORS Errors
```bash
# Check CORS configuration in .env
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

#### 📦 Dependency Issues
```bash
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
npm install --force
```

### 🔍 Debug Mode

Enable debug mode for detailed error messages:

```bash
# Backend
export FLASK_ENV=development
export DEBUG=True

# Frontend
# Check browser console for React errors
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Wikipedia** for providing the content source
- **Groq** for AI story generation capabilities
- **Google Gemini** for AI image generation
- **MongoDB Atlas** for database hosting
- **React** and **Flask** communities for excellent frameworks

## 📞 Support

Need help? Here are your options:

- 📧 **Email**: sawash3072@gmail.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/SytherAsh/WikiComic/issues)
- 📖 **Documentation**: Check the individual README files in each directory
- 💬 **Discussions**: [GitHub Discussions](https://github.com/SytherAsh/WikiComic/discussions)

---

<div align="center">

**Made with ❤️ by [YASH SAWANT]**

[![GitHub](https://img.shields.io/badge/GitHub-Follow-blue?style=social&logo=github)](https://github.com/SytherAsh)


**⭐ Star this repository if you found it helpful!**

</div>
