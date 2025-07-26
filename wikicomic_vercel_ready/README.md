# WikiComic - AI-Powered Comic Generator

A Flask application that generates comics from Wikipedia articles using AI.

## Features

- Generate comics from Wikipedia articles
- Multiple comic styles (Manga, Western, Minimalist, Cartoon, Noir, Indie)
- AI-powered image generation using Gemini
- MongoDB storage for comics and images
- RESTful API endpoints
- Modern web interface
- Real-time MongoDB connection status

## Quick Setup for Vercel Deployment

### 1. MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account
   - Create a new cluster (M0 Free tier is sufficient)

2. **Get Connection String**
   - In Atlas dashboard, click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with your database name (e.g., `Wikicomic`)

### 2. Vercel Environment Variables

In your Vercel project dashboard, go to Settings → Environment Variables and add:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/Wikicomic?retryWrites=true&w=majority
MONGODB_DB_NAME=Wikicomic
MONGODB_COLLECTION_IMAGES=Images
MONGODB_COLLECTION_COMICS=Comics
MONGODB_COLLECTION_SCENES=Scenes
GROQ_API_KEY=your-groq-api-key
GEMINI_API_KEY=your-gemini-api-key
SECRET_KEY=your-super-secret-key
CORS_ORIGINS=https://your-frontend-domain.vercel.app
```

### 3. Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy with the environment variables set

## Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wikicomic_vercel_ready
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   ```bash
   cp env_example.txt .env
   # Edit .env with your actual values
   ```

4. **Run the development server**
   ```bash
   python run.py
   ```

5. **Access the application**
   - Backend: http://localhost:5000
   - API: http://localhost:5000/api/health

## Testing the Application

### Quick Test
Run the test script to verify everything works:

```bash
python test_app.py
```

### Manual Testing
1. **Home Page**: Visit `/` to see MongoDB connection status
2. **Health Check**: Visit `/api/health` for system status
3. **Debug Info**: Visit `/api/debug` for configuration details
4. **Search Page**: Visit `/search` to generate comics
5. **Comics Page**: Visit `/comics` to view generated comics

## API Endpoints

### Core Endpoints
- `GET /` - Home page with status information
- `GET /search` - Search page for comic generation
- `POST /search` - Generate comic from Wikipedia article
- `GET /comics` - List all comics

### API Endpoints
- `GET /api/health` - Health check with MongoDB status
- `GET /api/debug` - Debug information and configuration
- `GET /api/comics` - Get all comics (JSON)
- `GET /api/comics/<comic_id>` - Get specific comic
- `DELETE /api/comics/<comic_id>` - Delete comic
- `GET /api/images/<image_id>` - Serve comic image

## Comic Styles

The application supports multiple comic styles:

1. **Manga** - Japanese manga style with dynamic poses and expressive characters
2. **Western** - Classic American comic book style with bold colors
3. **Minimalist** - Clean, modern design with limited color palette
4. **Cartoon** - Vibrant, playful cartoon style
5. **Noir** - Dark, dramatic noir style with high contrast
6. **Indie** - Artistic, hand-drawn indie comic style

## MongoDB Connection Status

The application provides real-time MongoDB connection status:

- **Home Page**: Shows database and API key status
- **Health Endpoint**: Detailed connection information
- **Debug Endpoint**: Configuration and connection details
- **Startup Logs**: Clear confirmation of MongoDB connection

## Error Handling

The application includes comprehensive error handling:

- **Graceful Startup**: App starts even if MongoDB is not configured
- **Connection Validation**: All database operations check connection status
- **Clear Error Messages**: User-friendly error messages with helpful guidance
- **Detailed Logging**: Comprehensive logging for debugging

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check `MONGODB_URI` environment variable
   - Ensure MongoDB cluster is accessible
   - Verify network connectivity

2. **API Key Errors**
   - Verify `GROQ_API_KEY` and `GEMINI_API_KEY` are set
   - Check API key validity and quotas

3. **CORS Errors**
   - Update `CORS_ORIGINS` with your frontend domain
   - Ensure proper CORS headers are set

4. **Image Generation Failures**
   - Check Gemini API quota and limits
   - Verify image generation model availability

### Debug Mode

For local development, set `DEBUG=True` in your environment variables to enable detailed error messages.

## Project Structure

```
wikicomic_vercel_ready/
├── api/
│   └── index.py              # Vercel serverless function entry point
├── app/
│   ├── __init__.py           # Flask app factory with startup logging
│   ├── config.py             # Configuration and environment variables
│   ├── database.py           # MongoDB connection and operations
│   ├── routes/
│   │   ├── api.py            # API endpoints for images and comics
│   │   ├── comics.py         # Comic listing endpoints
│   │   ├── home.py           # Home page route with status
│   │   ├── input.py          # Input handling routes
│   │   └── search.py         # Search and comic generation routes
│   ├── templates/
│   │   ├── home.html         # Home page with status display
│   │   ├── search.html       # Simplified search page
│   │   └── comics.html       # Comics listing page
│   └── utils/
│       ├── imagegen.py       # Image generation utilities
│       ├── storygen.py       # Story generation utilities
│       └── wikiextract.py    # Wikipedia content extraction
├── test_app.py               # Test script for verification
├── requirements.txt          # Python dependencies with versions
├── run.py                    # Local development server
├── vercel.json              # Vercel configuration
└── README.md                # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly using `test_app.py`
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation
- Run the test script to diagnose issues 