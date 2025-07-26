# 🚀 WikiComic Production Deployment Guide

## Overview
This guide covers deploying both the Flask backend and React frontend to Vercel for production.

## 🔧 Backend Deployment (Flask to Vercel)

### 1. Environment Variables Setup
Create a `.env` file in `wikicomic_flask/` with the following variables:

```bash
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
```

### 2. Vercel Environment Variables
In your Vercel dashboard, add these environment variables:
- `SECRET_KEY`
- `MONGODB_URI`
- `MONGODB_DB_NAME`
- `MONGODB_COLLECTION_IMAGES`
- `MONGODB_COLLECTION_COMICS`
- `MONGODB_COLLECTION_SCENES`
- `GROQ_API_KEY`
- `GEMINI_API_KEY`
- `HF_TOKEN` (optional)
- `GOOGLE_API_KEY` (optional)
- `CORS_ORIGINS`
- `MAX_IMAGE_SIZE`
- `ALLOWED_IMAGE_TYPES`

### 3. Deploy Backend
```bash
cd wikicomic_vercel_ready
vercel --prod
```

## 🎨 Frontend Deployment (React to Vercel)

### 1. Environment Variables Setup
Create a `.env` file in `wikicomic_react/` with:

```bash
# API Configuration
REACT_APP_API_URL=https://your-backend-domain.vercel.app

# Optional: Analytics and Monitoring
REACT_APP_GA_TRACKING_ID=your-google-analytics-id
REACT_APP_SENTRY_DSN=your-sentry-dsn

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_QUIZ=true
REACT_APP_ENABLE_POINTS=true
```

### 2. Vercel Environment Variables
In your Vercel dashboard, add:
- `REACT_APP_API_URL`
- `REACT_APP_GA_TRACKING_ID` (optional)
- `REACT_APP_SENTRY_DSN` (optional)
- `REACT_APP_ENABLE_ANALYTICS`
- `REACT_APP_ENABLE_QUIZ`
- `REACT_APP_ENABLE_POINTS`

### 3. Deploy Frontend
```bash
cd wikicomic_react
vercel --prod
```

## 🔍 Pre-Deployment Checklist

### Backend Checklist:
- [ ] All dependencies in `requirements.txt`
- [ ] Environment variables configured
- [ ] MongoDB connection tested
- [ ] API keys validated
- [ ] CORS origins set correctly
- [ ] Debug mode disabled
- [ ] Secret key changed from default

### Frontend Checklist:
- [ ] API URL points to correct backend
- [ ] Environment variables set
- [ ] Build process works locally
- [ ] All API endpoints tested
- [ ] Image loading works
- [ ] Error handling implemented

## 🐛 Common Issues & Solutions

### 1. MongoDB Connection Issues
```bash
# Test connection locally
cd wikicomic_flask
python db.py
```

### 2. CORS Errors
- Ensure `CORS_ORIGINS` includes your frontend domain
- Check for trailing slashes in URLs
- Verify HTTPS/HTTP protocol matches

### 3. Image Generation Failures
- Verify `GEMINI_API_KEY` is valid
- Check API quota limits
- Test image generation locally

### 4. Build Failures
```bash
# Test backend build
cd wikicomic_vercel_ready
pip install -r requirements.txt
python run.py

# Test frontend build
cd wikicomic_react
npm install
npm run build
```

## 🔒 Security Considerations

1. **Never commit `.env` files**
2. **Use strong SECRET_KEY**
3. **Restrict CORS origins**
4. **Validate all inputs**
5. **Use HTTPS in production**
6. **Monitor API usage**

## 📊 Monitoring & Analytics

### Health Check Endpoint
Test your backend health:
```
GET https://your-backend.vercel.app/api/health
```

### Expected Response:
```json
{
  "status": "healthy",
  "database": "connected",
  "message": "All systems operational"
}
```

## 🚀 Post-Deployment Verification

1. **Test API endpoints**
2. **Verify image generation**
3. **Check database connectivity**
4. **Test frontend-backend communication**
5. **Monitor error logs**
6. **Test all user flows**

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test locally with production config
4. Check MongoDB Atlas dashboard
5. Review API key permissions 