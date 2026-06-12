# EmotionApp – Web Application for Facial Emotion Recognition

EmotionApp is a web-based application for real-time facial emotion recognition developed as part of a bachelor's thesis at FER.

The application uses a webcam stream to detect faces, classify facial emotions using a pre-trained deep learning model, and visualize emotion statistics during and after an analysis session.

## Features

- User registration and authentication
- Real-time facial emotion recognition
- Live webcam preview
- Emotion confidence display
- Session management
- Emotion history and statistics
- User profile management

## Technologies

### Frontend
- React
- Vite
- Tailwind CSS
- React Router

### Backend
- Python
- Django
- Django REST Framework

### Machine Learning
- TensorFlow
- Keras
- OpenCV
- Mini-Xception model trained on FER2013

### Database & Authentication
- Supabase
- PostgreSQL

### Deployment
- Vercel (frontend)
- Render (backend)

## System Architecture

Frontend communicates with the backend through a REST API.

```text
Browser
   ↓
React Frontend
   ↓
REST API
   ↓
Django Backend
   ↓
Emotion Recognition Model
   ↓
Supabase Database
```

## Installation

### Clone repository

```bash
git clone https://github.com/USERNAME/emotion-app.git
cd emotion-app
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend

python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt

python manage.py migrate
python manage.py runserver
```

## Environment Variables

Frontend:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_URL=
```

Backend:

```env
DATABASE_URL=
SECRET_KEY=
DEBUG=
```


## Author

Gabriela Perković

Faculty of Electrical Engineering and Computing (FER)
University of Zagreb

Bachelor's Thesis 2026
