# WikiComic Flask Backend

A Flask-based backend for generating comics from Wikipedia articles using AI-powered story and image generation.

## 🚀 Quick Start

### 1. Environment Setup

Copy the environment template and configure your variables:

```bash
cp env_example.txt .env
```

Edit `.env` with your actual values:

```bash
# Required API Keys
GROQ_API_KEY=your-groq-api-key-here
GEMINI_API_KEY=your-gemini-api-key-here

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=Wikicomic
MONGODB_COLLECTION=comics

# Flask Configuration
SECRET_KEY=your-secret-key-change-in-production
DEBUG=True

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Test Startup

Test if your application can start without errors:

```bash
python test_startup.py
```

This will check:
- All required imports
- Configuration loading
- Flask app creation
- Database initialization

### 4. Database Initialization

Initialize and test your MongoDB connection:

```bash
python init_database.py
```

This script will:
- Validate your environment variables
- Test MongoDB connection
- Create a sample comic to verify functionality
- Clean up the test data

### 5. Run the Application

```bash
python run.py
```

The server will start on `http://localhost:5000`

## 🗄️ Database Operations

### Using the Database Utility

The `db_operations.py` script provides command-line tools for managing your MongoDB data:

```bash
# List all comics
python db_operations.py --action list

# Get a specific comic
python db_operations.py --action get --title "Albert Einstein"

# Get database statistics
python db_operations.py --action stats

# Export all comics to JSON
python db_operations.py --action export --file comics_backup.json

# Import comics from JSON
python db_operations.py --action import --file comics_backup.json

# Delete a comic
python db_operations.py --action delete --title "Albert Einstein"
```

### Manual Comic Creation

You can manually create comics using the database utility:

```bash
python db_operations.py --action save --title "Test Comic" --json '{
  "scenes": [
    {
      "scene_number": 1,
      "prompt": "A scientist in a laboratory",
      "dialogue": "Eureka! I have discovered something amazing!",
      "image": "base64_encoded_image_data",
      "image_format": "base64"
    }
  ],
  "style": "Manga",
  "storyline": "A story about scientific discovery",
  "summary": "A brief summary of the comic"
}'
```

## 📁 Project Structure

```
wikicomic_flask/
├── app/                    # Main application package
│   ├── __init__.py        # Flask app factory
│   ├── config.py          # Configuration management
│   ├── routes/            # API endpoints
│   │   ├── home.py        # Home route
│   │   ├── search.py      # Search and comic generation
│   │   ├── input.py       # Input handling
│   │   └── comics.py      # Comic management
│   ├── utils/             # Utility modules
│   │   ├── database.py    # MongoDB operations
│   │   ├── imagegen.py    # Image generation
│   │   ├── storygen.py    # Story generation
│   │   └── wikiextract.py # Wikipedia extraction
│   ├── models/            # Data models
│   └── templates/         # HTML templates
├── requirements.txt       # Python dependencies
├── run.py                # Flask entry point
├── start.py              # Enhanced startup script
├── test_startup.py       # Startup test script
├── init_database.py      # Database initialization script
├── db_operations.py      # Database operations utility
├── env_example.txt       # Environment variables template
└── README.md             # This file
```

## 🔧 API Endpoints

### Search and Generation
- `GET/POST /search` - Search Wikipedia and generate comics
- `GET /suggest` - Get search suggestions

### Comic Management
- `GET /comics` - List all comics
- `GET /comic/<title>` - Get specific comic by title

## 🗄️ Database Schema

Comics are stored in MongoDB with the following structure:

```json
{
  "title": "Comic Title",
  "style": "Manga|Western|Minimalist|Cartoon|Noir|Indie",
  "storyline": "Generated storyline",
  "summary": "Wikipedia summary",
  "scenes": [
    {
      "scene_number": 1,
      "prompt": "Scene description",
      "dialogue": "Character dialogue",
      "image": "base64_encoded_image",
      "image_format": "base64"
    }
  ],
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `MONGODB_URI` | MongoDB connection string | Auto-generated | Yes |
| `MONGODB_DB` | Database name | `Wikicomic` | No |
| `MONGODB_COLLECTION` | Collection name | `comics` | No |
| `DEBUG` | Debug mode | `True` | No |
| `SECRET_KEY` | Flask secret key | Auto-generated | No |
| `CORS_ORIGINS` | Allowed origins | `*` | No |
| `GROQ_API_KEY` | Groq API key | None | Yes |
| `GEMINI_API_KEY` | Gemini API key | None | Yes |
| `DEFAULT_COMIC_STYLE` | Default comic style | `Manga` | No |
| `DEFAULT_COMIC_LENGTH` | Default comic length | `medium` | No |
| `MAX_SCENES` | Maximum scenes per comic | `10` | No |
| `IMAGE_FORMAT` | Image storage format | `base64` | No |
| `IMAGE_QUALITY` | Image quality (1-100) | `95` | No |

### Configuration Constants

The application uses constants defined in `app/config.py` for:
- Database field names
- Scene field names
- Default values
- Validation rules

## 🛠️ Troubleshooting

### Common Issues

1. **Google Genai Import Error**
   ```bash
   AttributeError: module 'google.genai' has no attribute 'configure'
   ```
   **Solution**: Install the correct package:
   ```bash
   pip install google-generativeai>=0.3.0
   ```

2. **Database Connection Failed**
   - Check MongoDB credentials in `.env`
   - Verify network connectivity
   - Run `python init_database.py` to diagnose

3. **Import Errors**
   - Install dependencies: `pip install -r requirements.txt`
   - Check Python version (3.8+ required)
   - Run `python test_startup.py` to identify specific issues

4. **API Key Errors**
   - Ensure all required API keys are set in `.env`
   - Check API key validity
   - Run `python init_database.py` to validate environment

5. **CORS Errors**
   - Verify `CORS_ORIGINS` in `.env`
   - Check frontend URL configuration

6. **Image Generation Not Working**
   - Verify `GEMINI_API_KEY` is set correctly
   - Check if the API key has image generation permissions
   - Run `python test_startup.py` to check image generator initialization

### Debug Mode
Set `DEBUG=True` in `.env` for detailed error messages and auto-reload.

### Startup Testing
Run the startup test to identify issues:
```bash
python test_startup.py
```

This will test:
- All required imports
- Configuration loading
- Flask app creation
- Database initialization

## 🔒 Security Notes

- Change default `SECRET_KEY` in production
- Use environment variables for sensitive data
- Configure proper CORS origins for production
- Validate and sanitize all inputs
- Never commit `.env` files to version control

## 📝 Environment Variables

Copy `env_example.txt` to `.env` and configure:

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

# Optional API Keys
HF_TOKEN=your-huggingface-token-here
GOOGLE_API_KEY=your-google-api-key-here

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,https://your-frontend-domain.com

# Comic Generation Settings
DEFAULT_COMIC_STYLE=Manga
DEFAULT_COMIC_LENGTH=medium
MAX_SCENES=10

# Image Generation Settings
IMAGE_FORMAT=base64
IMAGE_QUALITY=95
```

## 🚀 Deployment

For production deployment:
1. Set `DEBUG=False`
2. Use proper `SECRET_KEY`
3. Configure production CORS origins
4. Set up proper MongoDB credentials
5. Use environment variables for all sensitive data 