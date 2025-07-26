# WikiComic - Vercel Backend

A Flask-based backend API for generating comics from Wikipedia articles using AI. This version is optimized for deployment on Vercel.

## Features

- **Wikipedia Integration**: Extract content from Wikipedia articles
- **AI Story Generation**: Generate comic storylines using Groq LLM
- **AI Image Generation**: Create comic panels using Google Gemini
- **MongoDB Storage**: Store comics and images in MongoDB GridFS
- **RESTful API**: Clean API endpoints for frontend integration
- **CORS Support**: Configured for cross-origin requests
- **Multiple Comic Styles**: Manga, Western, Minimalist, Cartoon, Noir, Indie

## Tech Stack

- **Backend**: Flask (Python)
- **Database**: MongoDB with GridFS
- **AI Services**: 
  - Groq (LLaMA 3.1) for story generation
  - Google Gemini for image generation
- **Deployment**: Vercel
- **CORS**: Flask-CORS

## Project Structure

```
wikicomic_vercel_ready/
├── api/
│   └── index.py              # Vercel serverless function entry point
├── app/
│   ├── __init__.py           # Flask app factory
│   ├── config.py             # Configuration and environment variables
│   ├── database.py           # MongoDB connection and operations
│   ├── models/
│   │   └── gemini.py         # Gemini AI model utilities
│   ├── routes/
│   │   ├── api.py            # API endpoints for images and comics
│   │   ├── comics.py         # Comic listing endpoints
│   │   ├── home.py           # Home page route
│   │   ├── input.py          # Input handling routes
│   │   └── search.py         # Search and comic generation routes
│   ├── static/
│   │   └── comic/            # Static comic assets
│   ├── templates/
│   │   ├── home.html         # Home page template
│   │   └── search.html       # Search page template
│   └── utils/
│       ├── imagegen.py       # Image generation utilities
│       ├── storygen.py       # Story generation utilities
│       ├── test_gen.py       # Testing utilities
│       └── wikiextract.py    # Wikipedia content extraction
├── instance/                 # Instance-specific files
├── env_example.txt           # Environment variables template
├── migrate_to_mongo.py       # Database migration script
├── requirements.txt          # Python dependencies
├── run.py                    # Local development server
├── vercel.json              # Vercel configuration
└── README.md                # This file
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Flask Configuration
SECRET_KEY=your-super-secret-key-change-this-in-production
DEBUG=False

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=Wikicomic
MONGODB_COLLECTION_IMAGES=Images
MONGODB_COLLECTION_COMICS=Comics
MONGODB_COLLECTION_SCENES=Scenes

# API Keys (Required)
GROQ_API_KEY=your-groq-api-key-here
GEMINI_API_KEY=your-gemini-api-key-here

# Optional API Keys
HF_TOKEN=your-huggingface-token-here
GOOGLE_API_KEY=your-google-api-key-here

# CORS Configuration (Production)
CORS_ORIGINS=https://your-frontend-domain.vercel.app,https://your-custom-domain.com

# Image Storage Configuration
MAX_IMAGE_SIZE=10485760
ALLOWED_IMAGE_TYPES=image/png,image/jpeg,image/jpg,image/webp

# Comic Generation Settings
DEFAULT_COMIC_STYLE=Manga
DEFAULT_COMIC_LENGTH=medium
MAX_SCENES=10

# Image Generation Settings
IMAGE_FORMAT=base64
IMAGE_QUALITY=95
```

## API Endpoints

### Core Endpoints

- `GET /` - Home page
- `GET /search` - Search page
- `POST /search` - Generate comic from Wikipedia article
- `GET /suggest` - Get Wikipedia search suggestions

### API Endpoints

- `GET /api/health` - Health check
- `GET /api/comics` - Get all comics
- `GET /api/comics/<comic_id>` - Get specific comic
- `DELETE /api/comics/<comic_id>` - Delete comic
- `GET /api/images/<image_id>` - Serve comic image

### Comic Endpoints

- `GET /comics` - List all comics (legacy endpoint)

## Local Development

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

## Deployment to Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Set environment variables in Vercel dashboard**
   - Go to your project settings
   - Add all environment variables from your `.env` file

5. **Deploy to production**
   ```bash
   vercel --prod
   ```

## API Usage Examples

### Generate a Comic

```bash
curl -X POST "https://your-vercel-app.vercel.app/search" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Albert Einstein",
    "style": "Manga",
    "length": "medium"
  }'
```

### Get All Comics

```bash
curl "https://your-vercel-app.vercel.app/api/comics"
```

### Get Specific Comic

```bash
curl "https://your-vercel-app.vercel.app/api/comics/64f1a2b3c4d5e6f7g8h9i0j1"
```

### Get Comic Image

```bash
curl "https://your-vercel-app.vercel.app/api/images/64f1a2b3c4d5e6f7g8h9i0j1"
```

## Comic Styles

The application supports multiple comic styles:

1. **Manga** - Japanese manga style with dynamic poses and expressive characters
2. **Western** - Classic American comic book style with bold colors
3. **Minimalist** - Clean, modern design with limited color palette
4. **Cartoon** - Vibrant, playful cartoon style
5. **Noir** - Dark, dramatic noir style with high contrast
6. **Indie** - Artistic, hand-drawn indie comic style

## Database Schema

### Comics Collection
```json
{
  "_id": "ObjectId",
  "title": "String",
  "style": "String",
  "scenes": "Array",
  "scene_count": "Number",
  "created_at": "Date",
  "updated_at": "Date"
}
```

### Images Collection
```json
{
  "_id": "ObjectId",
  "comic_title": "String",
  "scene_number": "Number",
  "scene_text": "String",
  "file_size": "Number",
  "created_at": "Date",
  "metadata": "Object"
}
```

## Error Handling

The API includes comprehensive error handling:

- **400 Bad Request** - Invalid input parameters
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server-side errors

All errors return JSON responses with descriptive messages.

## CORS Configuration

CORS is configured to allow requests from specified origins. Update the `CORS_ORIGINS` environment variable to include your frontend domain.

## Monitoring and Logging

- Application logs are available in Vercel dashboard
- Health check endpoint: `/api/health`
- Database connection status is monitored

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

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation 