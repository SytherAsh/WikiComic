# WikiComic - AI-Powered Comic Generator

A Flask application that generates comics from Wikipedia articles using AI.

## Features

- Generate comics from Wikipedia articles
- Multiple comic styles (Manga, Western, Minimalist, Cartoon, Noir, Indie)
- AI-powered image generation using Gemini
- MongoDB storage for comics and images
- RESTful API endpoints
- Modern web interface

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