# Full-Stack Application

A modern full-stack web application built with FastAPI (Python) backend and React frontend, using MongoDB for data persistence.

## 🚀 Tech Stack

### Backend
- **FastAPI** - Modern, fast Python web framework
- **MongoDB** - NoSQL database with Motor (async driver)
- **Pydantic** - Data validation using Python type annotations
- **Python 3.11+**

### Frontend
- **React 19** - Modern UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component library

## 📁 Project Structure

```
/app/
├── backend/              # FastAPI backend
│   ├── server.py         # Main application file
│   ├── requirements.txt  # Python dependencies
│   ├── .env             # Environment variables (local)
│   └── .env.example     # Environment template
├── frontend/            # React frontend
│   ├── src/            # Source files
│   │   ├── App.js      # Main React component
│   │   └── index.js    # Entry point
│   ├── public/         # Static assets
│   ├── package.json    # Node dependencies
│   ├── .env            # Environment variables (local)
│   └── .env.example    # Environment template
├── tests/              # Test files
├── railway.json        # Railway deployment config
├── vercel.json         # Vercel deployment config
└── README.md           # This file
```

## 🛠️ Local Development Setup

### Prerequisites
- Python 3.11 or higher
- Node.js 18+ and Yarn
- MongoDB (local or Atlas)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your MongoDB connection string:
   ```env
   MONGO_URL="mongodb://localhost:27017"  # or your MongoDB Atlas URL
   DB_NAME="test_database"
   CORS_ORIGINS="http://localhost:3000"
   ```

5. **Run the backend:**
   ```bash
   uvicorn server:app --reload --host 0.0.0.0 --port 8001
   ```
   Backend will be available at `http://localhost:8001`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env`:
   ```env
   REACT_APP_BACKEND_URL=http://localhost:8001
   ```

4. **Run the frontend:**
   ```bash
   yarn start
   ```
   Frontend will be available at `http://localhost:3000`

## 🌐 API Endpoints

### Base URL
- **Local**: `http://localhost:8001/api`
- **Production**: `https://your-railway-url.up.railway.app/api`

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/` | Health check / Hello World |
| POST | `/api/status` | Create status check entry |
| GET | `/api/status` | Get all status check entries |

### Example API Call

```bash
# Health check
curl http://localhost:8001/api/

# Create status check
curl -X POST http://localhost:8001/api/status \
  -H "Content-Type: application/json" \
  -d '{"client_name": "Test Client"}'

# Get all status checks
curl http://localhost:8001/api/status
```

## 🚀 Deployment

### Quick Deployment Guide

For detailed deployment instructions, see:
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide
- **[QUICK_START.md](./QUICK_START.md)** - Fast deployment checklist

### Deployment Platforms

1. **Database**: MongoDB Atlas (Free tier available)
2. **Backend**: Railway.app ($5/month, 500 free hours)
3. **Frontend**: Vercel (Free tier)

**Total Cost**: $0-5/month

### Environment Variables for Production

#### Backend (Railway)
```env
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/
DB_NAME=your_database_name
CORS_ORIGINS=https://your-frontend.vercel.app
```

#### Frontend (Vercel)
```env
REACT_APP_BACKEND_URL=https://your-backend.up.railway.app
```

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
yarn test
```

## 📝 Development Notes

### Backend
- All API routes are prefixed with `/api`
- MongoDB ObjectID is avoided; using UUID for document IDs
- CORS is configured via environment variables
- Async MongoDB operations using Motor

### Frontend
- Uses environment variables for backend URL
- Axios for API calls
- React Router for navigation
- Tailwind CSS for styling

## 🔐 Security Notes

- Never commit `.env` files to Git
- Always use environment variables for sensitive data
- Use strong passwords for MongoDB
- Configure CORS properly for production
- Keep dependencies updated

## 🐛 Troubleshooting

### Backend won't start
- Check MongoDB connection string in `.env`
- Verify Python version (3.11+)
- Ensure all dependencies are installed: `pip install -r requirements.txt`

### Frontend won't connect to backend
- Verify `REACT_APP_BACKEND_URL` in `.env`
- Check backend is running on port 8001
- Check CORS settings in backend `.env`

### CORS errors
- Update `CORS_ORIGINS` in backend `.env` to include your frontend URL
- For development: `http://localhost:3000`
- For production: `https://your-app.vercel.app`

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Railway Documentation](https://docs.railway.app/)
- [Vercel Documentation](https://vercel.com/docs)

## 📄 License

MIT License - feel free to use this project as you wish.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

**Built with ❤️ using modern web technologies**