# Speech-to-Text Converter

A web application that converts audio files to text using AI transcription.

## Features

- User authentication with JWT tokens
- Audio file upload and transcription
- Real-time speech recognition
- User session management
- Transcription history storage

## Technology Stack

### Frontend

- React 18
- Redux Toolkit Query
- React Router DOM
- Tailwind CSS
- Vite

### Backend

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Multer for file uploads
- Deepgram API for transcription

## Project Structure

```
speech-to-text-app/
  src/
    components/
      auth/
        1. AuthPage.jsx
        2. LoginForm.jsx
        3. RegisterForm.jsx
        4. ProtectedRoute.jsx
      5. AudioTranscriber.jsx
      6. Header.jsx
      7. Footer.jsx
    store/
      api/
        1. baseApi.js
        2. authApi.js
        3. transcriptionApi.js
      slices/
        1. authSlice.js
      2. store.js
    pages/
      1. Home.jsx
      2. Upload.jsx
    3. main.jsx
  backend/
    config/
      1. database.js
      2. config.js
    controllers/
      1. authController.js
      2. transcriptionController.js
    middleware/
      1. auth.js
      2. validation.js
      3. upload.js
    models/
      1. User.js
      2. Transcription.js
    routes/
      1. auth.js
      2. transcriptions.js
    utils/
      1. jwt.js
    2. server.js
  package.json

## Installation

### Prerequisites
- Node.js 18 or higher
- MongoDB database
- Deepgram API key

### Setup

1. Clone the repository
2. Install frontend dependencies:
```

npm install

```

3. Install backend dependencies:
```

cd backend
npm install

```

4. Create environment files:

Frontend (.env):
```

VITE_API_BASE_URL=http://localhost:8000/api

```

Backend (.env):
```

PORT=8000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
DEEPGRAM_API_KEY=your_deepgram_api_key

```

## Running the Application

1. Start the backend server:
```

cd backend
npm start

```

2. Start the frontend development server:
```

npm run dev

```

3. Open browser and navigate to http://localhost:5173

## API Endpoints

### Authentication
- POST /api/auth/register - User registration
- POST /api/auth/login - User login
- GET /api/auth/me - Get current user
- GET /api/auth/logout - User logout

### Transcriptions
- POST /api/transcriptions - Upload and transcribe audio
- GET /api/transcriptions - Get user transcriptions
- DELETE /api/transcriptions/:id - Delete transcription

## Usage

1. Register a new account or login
2. Upload an audio file
3. Wait for transcription processing
4. View and manage transcription results
5. Download transcriptions as text files

## Supported Audio Formats

- MP3
- WAV
- M4A
- FLAC
- OGG

## File Size Limit

Maximum file size: 25MB
```
