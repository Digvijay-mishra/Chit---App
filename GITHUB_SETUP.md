# 📦 GitHub Setup and Deployment Guide

This guide focuses specifically on preparing your code and pushing it to GitHub.

---

## 🎯 What This Guide Covers

1. Preparing your repository for GitHub
2. Creating a GitHub repository
3. Pushing your code
4. Setting up for continuous deployment
5. Best practices for GitHub

---

## 📋 Pre-Push Checklist

Before pushing to GitHub, ensure these files exist:

### Required Files ✅

- [ ] `.gitignore` - Excludes sensitive files
- [ ] `README.md` - Project documentation
- [ ] `backend/.env.example` - Environment template
- [ ] `frontend/.env.example` - Environment template
- [ ] `backend/requirements.txt` - Python dependencies
- [ ] `frontend/package.json` - Node dependencies

### Files to NEVER Commit ❌

- [ ] `.env` files (all environments)
- [ ] `node_modules/`
- [ ] `__pycache__/`
- [ ] `venv/` or `env/`
- [ ] `build/` directories
- [ ] Any files with credentials or API keys

---

## 🔐 Step 1: Secure Your Repository

### Check .gitignore

Verify your `.gitignore` includes:

```bash
cd /app
cat .gitignore
```

Should contain:
```
# Environment files
.env
.env.local
.env.production
*.env

# Dependencies
node_modules/
__pycache__/
venv/

# Build outputs
build/
dist/

# Sensitive data
*token.json*
*credentials.json*
```

### Remove Sensitive Data

**Check for committed .env files:**
```bash
cd /app
git status

# If .env files appear, remove them from git tracking
git rm --cached backend/.env frontend/.env
git commit -m "Remove environment files from tracking"
```

**Verify no secrets in code:**
```bash
# Search for potential hardcoded secrets
grep -r "mongodb+srv://" . --exclude-dir=node_modules --exclude-dir=.git
grep -r "password" . --exclude-dir=node_modules --exclude-dir=.git
grep -r "api_key" . --exclude-dir=node_modules --exclude-dir=.git
```

---

## 📝 Step 2: Create Environment Templates

### Backend Environment Template

```bash
cd /app/backend

# Should already exist, verify content:
cat .env.example
```

Should contain:
```env
# MongoDB Connection String
MONGO_URL="mongodb://localhost:27017"

# Database Name
DB_NAME="test_database"

# CORS Origins (comma-separated)
CORS_ORIGINS="*"

# Port (optional)
PORT=8001
```

### Frontend Environment Template

```bash
cd /app/frontend

# Should already exist, verify content:
cat .env.example
```

Should contain:
```env
# Backend API URL
REACT_APP_BACKEND_URL=http://localhost:8001

# Development only
WDS_SOCKET_PORT=443
ENABLE_HEALTH_CHECK=false
```

---

## 🐙 Step 3: Create GitHub Repository

### Option A: Via GitHub Website (Recommended)

1. **Log in to GitHub**: https://github.com
2. Click **"+"** button (top right) → **"New repository"**
3. **Repository Name**: Choose a name (e.g., `my-fullstack-app`)
4. **Description**: Add a brief description
5. **Visibility**: 
   - **Private**: Only you can see it
   - **Public**: Everyone can see it
6. **Important**: **DON'T** initialize with:
   - ❌ README (we already have one)
   - ❌ .gitignore (we already have one)
   - ❌ License (can add later)
7. Click **"Create repository"**
8. **Save the repository URL** shown on next page

### Option B: Via GitHub CLI

```bash
# Install GitHub CLI first: https://cli.github.com/

# Authenticate
gh auth login

# Create repository
gh repo create my-fullstack-app --private --source=. --remote=origin --push
```

---

## 🚀 Step 4: Initialize and Push to GitHub

### First Time Setup

```bash
cd /app

# Check git status
git status

# If git is not initialized (no .git folder)
git init

# Configure git (if not done)
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Full-stack application with FastAPI and React"

# Add remote repository
# Replace YOUR-USERNAME and REPO-NAME with your actual values
git remote add origin https://github.com/YOUR-USERNAME/REPO-NAME.git

# Verify remote was added
git remote -v

# Should show:
# origin  https://github.com/YOUR-USERNAME/REPO-NAME.git (fetch)
# origin  https://github.com/YOUR-USERNAME/REPO-NAME.git (push)

# Push to GitHub
git branch -M main
git push -u origin main
```

### If Git Already Initialized

```bash
cd /app

# Check current status
git status

# Stage all changes
git add .

# Commit changes
git commit -m "Prepare for deployment"

# Check if remote exists
git remote -v

# If no remote, add it:
git remote add origin https://github.com/YOUR-USERNAME/REPO-NAME.git

# If remote exists but wrong URL, update it:
git remote set-url origin https://github.com/YOUR-USERNAME/REPO-NAME.git

# Push to GitHub
git push -u origin main
```

---

## 🔑 Step 5: Authentication

### Personal Access Token (Recommended)

When pushing, GitHub will ask for credentials:

**Username**: Your GitHub username

**Password**: Use a **Personal Access Token** (not your GitHub password)

**To create a token:**

1. Go to https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Name: `My App Deployment`
4. Expiration: Choose duration (90 days recommended)
5. Scopes: Select **`repo`** (full control of private repositories)
6. Click **"Generate token"**
7. **IMPORTANT**: Copy the token immediately (you won't see it again!)
8. Save it securely (password manager recommended)

**Use the token:**
```bash
# When prompted for password, paste your token
Username: your-github-username
Password: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### SSH Authentication (Alternative)

**Setup SSH keys:**

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your.email@example.com"

# Press Enter to accept default location
# Press Enter twice for no passphrase (or set one)

# Copy public key
cat ~/.ssh/id_ed25519.pub

# Add to GitHub:
# 1. Go to https://github.com/settings/keys
# 2. Click "New SSH key"
# 3. Paste the public key
# 4. Click "Add SSH key"

# Change remote to use SSH
git remote set-url origin git@github.com:YOUR-USERNAME/REPO-NAME.git

# Test connection
ssh -T git@github.com

# Push (no password needed now)
git push
```

---

## 🔄 Step 6: Ongoing Development

### Daily Workflow

```bash
cd /app

# Pull latest changes (if working in a team)
git pull origin main

# Make your code changes...

# Check what changed
git status
git diff

# Stage specific files
git add backend/server.py
git add frontend/src/App.js

# Or stage all changes
git add .

# Commit with descriptive message
git commit -m "Add: new status check feature"

# Push to GitHub
git push origin main
```

### Commit Message Best Practices

Use clear, descriptive messages:

```bash
# Good ✅
git commit -m "Add: user authentication endpoint"
git commit -m "Fix: CORS error on production"
git commit -m "Update: MongoDB connection pooling"
git commit -m "Refactor: split API routes into modules"

# Bad ❌
git commit -m "updates"
git commit -m "fix stuff"
git commit -m "changes"
```

**Format:**
```
Type: Brief description

Longer description if needed

- Bullet points for details
- What changed
- Why it changed
```

**Common types:**
- `Add:` - New feature or file
- `Fix:` - Bug fix
- `Update:` - Modify existing feature
- `Refactor:` - Code restructuring
- `Remove:` - Delete code or feature
- `Docs:` - Documentation changes

---

## 🌿 Step 7: Branching Strategy

### For Solo Development

```bash
# Work directly on main
git checkout main
git pull origin main
# make changes
git add .
git commit -m "Your changes"
git push origin main
```

### For Team Development

```bash
# Create feature branch
git checkout -b feature/user-auth

# Make changes and commit
git add .
git commit -m "Add: user authentication"

# Push branch to GitHub
git push origin feature/user-auth

# Create Pull Request on GitHub
# After review and merge, delete branch
git checkout main
git pull origin main
git branch -d feature/user-auth
```

---

## 🚨 Step 8: Handle Mistakes

### Undo Last Commit (not pushed)

```bash
# Undo commit but keep changes
git reset --soft HEAD~1

# Undo commit and discard changes
git reset --hard HEAD~1
```

### Remove File from Git (keep local)

```bash
# Remove from git tracking but keep file
git rm --cached filename

# Example: Remove .env accidentally committed
git rm --cached backend/.env
git commit -m "Remove .env from tracking"
git push origin main
```

### Fix Wrong Commit Message

```bash
# If not pushed yet
git commit --amend -m "New correct message"

# If already pushed (avoid if possible)
git commit --amend -m "New correct message"
git push --force origin main  # Use with caution!
```

### Accidentally Committed Secrets

**If secrets were pushed to GitHub:**

1. **Immediately revoke/change the credentials**
2. Remove from git history:
```bash
# Install BFG Repo Cleaner or use git-filter-repo
# Example with git-filter-repo:
git filter-repo --path backend/.env --invert-paths

# Force push (this rewrites history!)
git push origin --force --all
```

3. **Change all secrets immediately** - assume they're compromised

---

## 📊 Step 9: Verify Your Repository

After pushing, check on GitHub:

### Repository Checklist

Visit: `https://github.com/YOUR-USERNAME/REPO-NAME`

- [ ] README.md displays correctly
- [ ] All necessary files are present
- [ ] `.gitignore` is working (no .env files visible)
- [ ] No sensitive data visible
- [ ] Deployment config files present (railway.json, vercel.json)

### Check Repository Settings

1. Go to repository **Settings** tab
2. **General**: Repository name and description are correct
3. **Branches**: Main branch is protected (optional but recommended)
4. **Secrets**: Add secrets for GitHub Actions if needed

---

## 🔗 Step 10: Connect to Deployment Platforms

### Railway Setup

Railway will automatically detect your GitHub repository:

1. Go to https://railway.app
2. **New Project** → **Deploy from GitHub repo**
3. Select your repository
4. Configure as per DEPLOYMENT.md

### Vercel Setup

Vercel will automatically detect your GitHub repository:

1. Go to https://vercel.com
2. **Add New** → **Project**
3. Import your GitHub repository
4. Configure as per DEPLOYMENT.md

### Auto-Deploy on Push

Both platforms will automatically redeploy when you push to `main`:

```bash
# Make changes
git add .
git commit -m "Update: improve error handling"
git push origin main

# Railway and Vercel automatically detect the push
# Both redeploy in ~2-3 minutes
```

---

## 🛡️ Security Best Practices

### Never Commit

- ❌ `.env` files
- ❌ API keys or tokens
- ❌ Passwords or credentials
- ❌ `node_modules/` directory
- ❌ Build artifacts (`build/`, `dist/`)
- ❌ Database files
- ❌ SSH keys

### Always Commit

- ✅ `.env.example` files (without real values)
- ✅ `.gitignore`
- ✅ `README.md`
- ✅ Deployment configurations
- ✅ Source code files
- ✅ Requirements/dependencies files

### Use GitHub Secrets

For GitHub Actions or CI/CD:

1. Go to Repository **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"**
3. Add secrets like:
   - `MONGO_URL`
   - `API_KEY`
   - etc.

---

## 📚 Additional GitHub Features

### GitHub Actions (CI/CD)

Create `.github/workflows/deploy.yml` for automated testing:

```yaml
name: Test Application

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
    
    - name: Install backend dependencies
      run: |
        cd backend
        pip install -r requirements.txt
    
    - name: Run backend tests
      run: |
        cd backend
        pytest
```

### GitHub Issues

Track bugs and features:
- Go to **Issues** tab
- Click **"New issue"**
- Describe the bug or feature
- Assign to team members

### GitHub Wiki

Add documentation:
- Go to **Wiki** tab
- Click **"Create the first page"**
- Add guides and documentation

---

## 🆘 Troubleshooting

### Issue: Permission denied (publickey)

**Solution**: Set up SSH keys or use HTTPS with token

```bash
# Switch to HTTPS
git remote set-url origin https://github.com/YOUR-USERNAME/REPO-NAME.git
```

### Issue: Repository not found

**Solution**: Check repository name and permissions

```bash
# Verify remote URL
git remote -v

# Update if wrong
git remote set-url origin https://github.com/YOUR-USERNAME/CORRECT-REPO-NAME.git
```

### Issue: Merge conflicts

**Solution**: Resolve conflicts manually

```bash
# Pull latest changes
git pull origin main

# Git will show files with conflicts
# Edit files, look for <<<<<<< markers
# Choose which changes to keep

# After resolving
git add .
git commit -m "Resolve merge conflicts"
git push origin main
```

### Issue: Large file error

**Error**: "File exceeds GitHub's 100 MB limit"

**Solution**: Add to .gitignore and remove from history

```bash
# Add to .gitignore
echo "large-file.zip" >> .gitignore

# Remove from git
git rm --cached large-file.zip

# Commit
git commit -m "Remove large file"
git push origin main
```

---

## ✅ Final Checklist

Before considering your repository ready:

- [ ] All code pushed to GitHub
- [ ] No sensitive data in repository
- [ ] README.md is comprehensive
- [ ] .env.example files exist
- [ ] .gitignore is comprehensive
- [ ] Repository description added
- [ ] License added (optional)
- [ ] Connected to Railway
- [ ] Connected to Vercel
- [ ] Auto-deploy working

---

## 🎉 Success!

Your code is now safely on GitHub and ready for deployment!

**Next Steps:**
1. **Deploy**: Follow [DEPLOYMENT.md](./DEPLOYMENT.md)
2. **Develop**: See [LOCAL_DEVELOPMENT.md](./LOCAL_DEVELOPMENT.md)
3. **Quick Reference**: Use [QUICK_START.md](./QUICK_START.md)

---

## 📞 Resources

- [GitHub Docs](https://docs.github.com/)
- [Git Documentation](https://git-scm.com/doc)
- [GitHub CLI](https://cli.github.com/)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)

---

Happy coding! 🚀
