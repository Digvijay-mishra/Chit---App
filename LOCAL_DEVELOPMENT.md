# 🏠 Local Development Guide

This guide will help you run the application locally on your machine for development purposes.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.11 or higher** - [Download here](https://www.python.org/downloads/)
- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Yarn** - Install with: `npm install -g yarn`
- **MongoDB** - Choose one:
  - Local: [Download MongoDB Community Server](https://www.mongodb.com/try/download/community)
  - Cloud: [MongoDB Atlas (Free)](https://www.mongodb.com/cloud/atlas)
- **Git** - [Download here](https://git-scm.com/)

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
# Clone from GitHub (if not already local)
git clone https://github.com/YOUR-USERNAME/REPO-NAME.git
cd REPO-NAME

# Or if already local
cd /app
```

### 2. Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Edit .env with your MongoDB connection
nano .env  # or use any text editor
```

**Edit `.env` file:**
```env
MONGO_URL="mongodb://localhost:27017"  # Local MongoDB
# OR
MONGO_URL="mongodb+srv://user:pass@cluster.mongodb.net/"  # MongoDB Atlas

DB_NAME="test_database"
CORS_ORIGINS="http://localhost:3000"
PORT=8001
```

**Start the backend:**
```bash
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

Backend will be available at: `http://localhost:8001`

### 3. Setup Frontend

**In a new terminal:**

```bash
cd frontend

# Install dependencies
yarn install

# Create environment file
cp .env.example .env

# Edit .env
nano .env  # or use any text editor
```

**Edit `.env` file:**
```env
REACT_APP_BACKEND_URL=http://localhost:8001
WDS_SOCKET_PORT=443
ENABLE_HEALTH_CHECK=false
```

**Start the frontend:**
```bash
yarn start
```

Frontend will be available at: `http://localhost:3000`

### 4. Test the Application

Open your browser to `http://localhost:3000`

You should see the application running!

---

## 🗂️ Project Structure

```
/app/
├── backend/              # FastAPI backend
│   ├── server.py        # Main application file
│   ├── requirements.txt # Python dependencies
│   ├── .env            # Environment variables (local)
│   └── .env.example    # Environment template
│
├── frontend/            # React frontend
│   ├── src/
│   │   ├── App.js      # Main component
│   │   └── index.js    # Entry point
│   ├── public/         # Static files
│   ├── package.json    # Node dependencies
│   ├── .env           # Environment variables (local)
│   └── .env.example   # Environment template
│
└── tests/              # Test files
```

---

## 🛠️ Development Workflow

### Backend Development

**File watching with auto-reload:**
```bash
cd backend
source venv/bin/activate  # Activate venv first
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

The `--reload` flag automatically restarts the server when you make changes.

**Test API endpoints:**
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

**View API documentation:**
- Swagger UI: http://localhost:8001/docs
- ReDoc: http://localhost:8001/redoc

### Frontend Development

**Hot reload is enabled by default:**
```bash
cd frontend
yarn start
```

Changes to React files will automatically reload the browser.

**Common commands:**
```bash
# Start development server
yarn start

# Run tests
yarn test

# Build for production
yarn build

# Check for issues
yarn lint  # if ESLint is configured
```

---

## 🗄️ MongoDB Setup

### Option 1: Local MongoDB

**Install MongoDB:**
- macOS: `brew install mongodb-community`
- Ubuntu: Follow [official guide](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/)
- Windows: Download installer from [mongodb.com](https://www.mongodb.com/try/download/community)

**Start MongoDB:**
```bash
# macOS (with Homebrew)
brew services start mongodb-community

# Linux (systemd)
sudo systemctl start mongod

# Windows
# MongoDB runs as a service after installation
```

**Verify it's running:**
```bash
mongosh  # MongoDB Shell
# Should connect without errors
```

**Use in .env:**
```env
MONGO_URL="mongodb://localhost:27017"
```

### Option 2: MongoDB Atlas (Cloud)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a free M0 cluster
3. Add your IP to Network Access (or use `0.0.0.0/0` for development)
4. Create database user
5. Get connection string

**Use in .env:**
```env
MONGO_URL="mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority"
```

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
source venv/bin/activate
pytest
```

### Frontend Tests

```bash
cd frontend
yarn test
```

**Run tests in watch mode:**
```bash
yarn test --watch
```

---

## 📦 Adding Dependencies

### Backend (Python)

```bash
cd backend
source venv/bin/activate

# Install package
pip install package-name

# Update requirements.txt
pip freeze > requirements.txt
```

### Frontend (Node.js)

```bash
cd frontend

# Add package
yarn add package-name

# Add dev dependency
yarn add -D package-name

# package.json is automatically updated
```

---

## 🔍 Debugging

### Backend Debugging

**View logs:**
```bash
# Server logs appear in terminal where uvicorn is running
```

**Python debugger:**
Add breakpoints in your code:
```python
import pdb; pdb.set_trace()  # Breakpoint here
```

**VS Code debugging:**
Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: FastAPI",
      "type": "python",
      "request": "launch",
      "module": "uvicorn",
      "args": ["server:app", "--reload", "--host", "0.0.0.0", "--port", "8001"],
      "cwd": "${workspaceFolder}/backend",
      "env": {"PYTHONPATH": "${workspaceFolder}/backend"}
    }
  ]
}
```

### Frontend Debugging

**Browser DevTools:**
- Press `F12` to open DevTools
- Check Console for errors
- Use Network tab to inspect API calls
- Use React DevTools extension

**React debugging:**
```javascript
console.log('Debug data:', data);
debugger;  // Breakpoint in browser
```

---

## 🐛 Common Issues

### Backend Issues

**Issue: `ModuleNotFoundError`**
```bash
# Solution: Ensure virtual environment is activated and dependencies installed
source venv/bin/activate
pip install -r requirements.txt
```

**Issue: MongoDB connection failed**
```bash
# Solution: Check MongoDB is running
# Local:
sudo systemctl status mongod  # Linux
brew services list  # macOS

# Or use MongoDB Atlas with correct connection string
```

**Issue: Port 8001 already in use**
```bash
# Solution: Find and kill the process
# macOS/Linux:
lsof -ti:8001 | xargs kill -9

# Or use a different port
uvicorn server:app --reload --port 8002
```

### Frontend Issues

**Issue: `Module not found`**
```bash
# Solution: Reinstall dependencies
rm -rf node_modules
yarn install
```

**Issue: API calls fail with CORS error**
```bash
# Solution: Check backend CORS_ORIGINS includes http://localhost:3000
# Edit backend/.env:
CORS_ORIGINS="http://localhost:3000"
```

**Issue: Port 3000 already in use**
```bash
# Solution: Kill the process or use different port
# macOS/Linux:
lsof -ti:3000 | xargs kill -9

# Or React will prompt to use different port automatically
```

**Issue: Environment variables not loading**
```bash
# Solution: Restart the dev server
# React requires restart after .env changes
yarn start
```

---

## 🔄 Git Workflow

### Daily Development

```bash
# Pull latest changes
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name

# Make changes...

# Stage changes
git add .

# Commit
git commit -m "Add: your feature description"

# Push to GitHub
git push origin feature/your-feature-name

# Create Pull Request on GitHub
```

### Keeping .env files safe

The `.gitignore` is configured to never commit `.env` files.

**To share environment setup:**
- Update `.env.example` files (without real credentials)
- Commit `.env.example` files
- Team members copy `.env.example` to `.env` and add their own values

---

## 📊 Project Scripts

### Backend

```bash
cd backend

# Start development server
uvicorn server:app --reload --host 0.0.0.0 --port 8001

# Start production server (no reload)
uvicorn server:app --host 0.0.0.0 --port 8001

# Run tests
pytest

# Run tests with coverage
pytest --cov=.

# Format code
black .

# Lint code
flake8 .
```

### Frontend

```bash
cd frontend

# Development server
yarn start

# Production build
yarn build

# Test build locally
yarn build && npx serve -s build

# Run tests
yarn test

# Run tests with coverage
yarn test --coverage
```

---

## 🚀 Ready for Production?

Once your app works locally, see:
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Full deployment guide
- **[QUICK_START.md](./QUICK_START.md)** - Quick deployment checklist

---

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Python Virtual Environments](https://docs.python.org/3/tutorial/venv.html)
- [Yarn Documentation](https://yarnpkg.com/)

---

## 💡 Tips for Development

1. **Keep dependencies updated**: Regularly update packages
2. **Use environment variables**: Never hardcode secrets
3. **Write tests**: Test as you develop
4. **Use version control**: Commit often with clear messages
5. **Read error messages**: They usually tell you exactly what's wrong
6. **Check logs**: Backend and frontend logs are your friends
7. **Use browser DevTools**: Essential for frontend debugging

---

Happy coding! 🎉
