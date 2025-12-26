# 🚀 Complete Deployment Guide - Step by Step

This guide will help you deploy your full-stack application to the cloud independently, outside of Emergent.

## 📋 Overview

We'll deploy:
- **Database**: MongoDB Atlas (Free)
- **Backend**: Railway.app ($0-5/month)
- **Frontend**: Vercel (Free)

**Total Time**: ~60 minutes  
**Total Cost**: $0-5/month

---

## 📦 Phase 1: Setup MongoDB Atlas (15 minutes)

### Step 1: Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas
2. Click **"Try Free"**
3. Sign up with:
   - Email address
   - Password
   - Or use Google/GitHub login

### Step 2: Create Free Cluster

1. After login, click **"Create a deployment"** or **"Build a Database"**
2. Choose **M0 (FREE tier)**:
   - 512 MB storage
   - Shared RAM
   - No credit card required
3. Choose Provider: **AWS** (recommended)
4. Choose Region: **Closest to your location**
5. Cluster Name: Leave as default or name it `AppCluster`
6. Click **"Create Deployment"**
7. Wait 3-5 minutes for cluster creation

### Step 3: Create Database User

1. Security Quickstart will appear
2. Choose **"Username and Password"**
3. Enter:
   - **Username**: `appuser`
   - **Password**: Click **"Autogenerate Secure Password"**
4. **IMPORTANT**: Save your credentials:
   ```
   Username: appuser
   Password: [your generated password]
   ```
5. Click **"Create User"**

### Step 4: Configure Network Access

1. In Security Quickstart: "Where would you like to connect from?"
2. Choose **"My Local Environment"**
3. Click **"Add My Current IP Address"**
4. Then click **"Add IP Address"** button
5. Enter: `0.0.0.0/0` (Allow access from anywhere)
6. Description: `Allow all`
7. Click **"Finish and Close"**

### Step 5: Get Connection String

1. Click **"Connect"** button on your cluster
2. Choose **"Connect your application"**
3. Driver: **Python** / Version: **3.12 or later**
4. Copy the connection string:
   ```
   mongodb+srv://appuser:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password from Step 3
6. **Save this connection string** - You'll need it!

Example:
```
mongodb+srv://appuser:MySecurePass123@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority
```

✅ **Database Setup Complete!**

---

## 🐙 Phase 2: Prepare and Push to GitHub (10 minutes)

### Step 1: Check Your Local Environment

```bash
# Navigate to your app directory
cd /app

# Check what files exist
ls -la
```

### Step 2: Create GitHub Repository

1. Go to https://github.com
2. Click **"+"** (top right) → **"New repository"**
3. Repository settings:
   - **Name**: `my-fullstack-app` (or your preferred name)
   - **Description**: "Full-stack application with FastAPI and React"
   - **Visibility**: Choose Private or Public
   - **DON'T** check any boxes (no README, no .gitignore, no license)
4. Click **"Create repository"**
5. **Save the repository URL** shown on the next page

### Step 3: Initialize Git and Commit

```bash
cd /app

# Check git status
git status

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Full-stack application"
```

### Step 4: Push to GitHub

```bash
# Add your GitHub repository as remote
# Replace YOUR-USERNAME and REPO-NAME with your actual values
git remote add origin https://github.com/YOUR-USERNAME/REPO-NAME.git

# Verify remote was added
git remote -v

# Push to GitHub
git branch -M main
git push -u origin main
```

**Authentication Options:**
- If prompted for credentials, use your GitHub username
- For password, use a **Personal Access Token** (not your GitHub password)
- To create a token: GitHub → Settings → Developer settings → Personal access tokens → Generate new token

✅ **Code on GitHub!**

---

## 🚂 Phase 3: Deploy Backend to Railway (20 minutes)

### Step 1: Sign Up for Railway

1. Go to https://railway.app
2. Click **"Login"** → **"Sign in with GitHub"**
3. Authorize Railway to access your GitHub account

### Step 2: Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. You may need to **"Configure GitHub App"** first
   - Select your GitHub account
   - Choose **"Only select repositories"**
   - Select your repository
   - Click **"Install & Authorize"**
4. Back on Railway, select your repository
5. Railway will detect FastAPI automatically!

### Step 3: Configure Root Directory

1. Click on your deployed service (the card that appears)
2. Go to **"Settings"** tab
3. Scroll to **"Root Directory"**
4. Click **"Edit"**
5. Enter: `backend`
6. Click **"Save"**
7. Service will automatically redeploy

### Step 4: Add Environment Variables

1. Click on **"Variables"** tab
2. Click **"New Variable"** and add these one by one:

**Variable 1:**
```
Name: MONGO_URL
Value: mongodb+srv://appuser:YourPassword@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```
(Use your actual MongoDB connection string from Phase 1, Step 5)

**Variable 2:**
```
Name: DB_NAME
Value: test_database
```

**Variable 3:**
```
Name: CORS_ORIGINS
Value: *
```
(We'll update this later with your Vercel URL)

3. Service will auto-redeploy with new variables (wait 1-2 minutes)

### Step 5: Get Backend URL

1. Go to **"Settings"** tab
2. Scroll to **"Networking"** or **"Domains"** section
3. Click **"Generate Domain"**
4. Copy your domain (something like):
   ```
   https://your-app-production.up.railway.app
   ```
5. **Save this URL!** You'll need it for frontend

### Step 6: Test Backend

```bash
# Replace with your actual Railway URL
curl https://your-app-production.up.railway.app/api/

# Should return:
# {"message":"Hello World"}
```

If you see "Hello World", your backend is working! 🎉

✅ **Backend Deployed on Railway!**

---

## 🎨 Phase 4: Deploy Frontend to Vercel (15 minutes)

### Step 1: Update Frontend Environment

Before deploying, we need to create a production environment file:

1. In your local `/app/frontend` directory, create `.env.production`:

```bash
cd /app/frontend

# Create production environment file
cat > .env.production << 'EOF'
REACT_APP_BACKEND_URL=https://your-railway-url.up.railway.app
EOF
```

2. Edit the file and replace with your **actual Railway URL** from Phase 3, Step 5:

```bash
nano .env.production
# or use any text editor
```

Example:
```env
REACT_APP_BACKEND_URL=https://your-app-production.up.railway.app
```

3. Save the file

### Step 2: Commit and Push Changes

```bash
cd /app

# Add the new production environment file
git add frontend/.env.production

# Commit
git commit -m "Add production environment configuration"

# Push to GitHub
git push origin main
```

### Step 3: Deploy to Vercel

1. Go to https://vercel.com
2. Click **"Sign Up"** or **"Login"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub
5. You'll see the Vercel dashboard

### Step 4: Import Your Project

1. Click **"Add New..."** → **"Project"**
2. Find your repository in the list
3. Click **"Import"**

### Step 5: Configure Vercel Project

**Configure Project Settings:**

1. **Framework Preset**: Should auto-detect as **"Create React App"**
2. **Root Directory**: 
   - Click **"Edit"**
   - Enter: `frontend`
   - Click **"Continue"**
3. **Build Command**: `yarn build` (default, leave as is)
4. **Output Directory**: `build` (default, leave as is)
5. **Install Command**: `yarn install` (default, leave as is)

**Environment Variables:**

1. Click **"Environment Variables"** section (expand if collapsed)
2. Add variable:
   - **Name**: `REACT_APP_BACKEND_URL`
   - **Value**: `https://your-railway-url.up.railway.app`
   - (Use your actual Railway URL from Phase 3, Step 5)
3. Leave **"Environment"** as **"Production"** (default)

3. Click **"Deploy"**

### Step 6: Wait for Deployment

- Status will show: **"Building..."** (2-3 minutes)
- Then: **"Deploying..."**
- Finally: **"✅ Ready!"**

### Step 7: Get Frontend URL

1. Once deployment completes, you'll see your site URL:
   ```
   https://your-app.vercel.app
   ```
2. Click on the URL to open your app!
3. **Save this URL!**

✅ **Frontend Deployed on Vercel!**

---

## 🔒 Phase 5: Update CORS Settings (5 minutes)

Now that your frontend is deployed, update the backend CORS settings for security.

### Step 1: Update Railway CORS

1. Go back to https://railway.app
2. Open your project
3. Click on your backend service
4. Go to **"Variables"** tab
5. Find **`CORS_ORIGINS`** variable
6. Click the **"Edit"** icon (pencil)
7. Change value from `*` to your Vercel URL:
   ```
   https://your-app.vercel.app
   ```
8. Click outside or press Enter to save
9. Service will auto-redeploy (wait 1-2 minutes)

✅ **CORS Updated for Security!**

---

## ✅ Phase 6: Test Your Deployment (10 minutes)

### Step 1: Open Your App

1. Go to your Vercel URL: `https://your-app.vercel.app`
2. Wait for page to load

### Step 2: Check Browser Console

1. Press **F12** to open Developer Tools
2. Go to **Console** tab
3. You should see the "Hello World" message logged
4. Check for any errors (red text)

### Step 3: Test API Connection

1. In the Console, you should see the API call succeeding
2. No CORS errors should appear
3. Check the **Network** tab to see successful API calls (status 200)

### Step 4: Test Basic Functionality

Create a test API call:

```bash
# Test creating a status check (replace with your Railway URL)
curl -X POST https://your-railway-url.up.railway.app/api/status \
  -H "Content-Type: application/json" \
  -d '{"client_name": "Test Client"}'

# Should return the created status check with ID and timestamp
```

### Step 5: Verify in Browser

Open your browser console and run:

```javascript
// Replace with your Railway URL
fetch('https://your-railway-url.up.railway.app/api/status')
  .then(res => res.json())
  .then(data => console.log('Status checks:', data));
```

You should see the test data you just created!

✅ **Testing Complete!**

---

## 🎉 Deployment Complete!

### Your Live URLs

- **Frontend (Vercel)**: `https://your-app.vercel.app`
- **Backend (Railway)**: `https://your-app-production.up.railway.app`
- **Database (MongoDB Atlas)**: Managed cluster

### Features Working

✅ Backend API deployed and accessible  
✅ Frontend deployed and accessible  
✅ Database connected and operational  
✅ CORS configured properly  
✅ HTTPS security automatic  

---

## 📊 Cost Summary

| Service | Plan | Cost |
|---------|------|------|
| MongoDB Atlas | M0 Free Tier | **FREE** |
| Railway | Hobby Plan | **$5/month** |
| Vercel | Hobby Plan | **FREE** |
| **Total** | | **$5/month** |

**Note**: Railway offers 500 free hours per month (~20 days). First month might be free!

---

## 🔧 Making Updates

### To Update Your Code

```bash
cd /app

# Make your changes to files
# Example: edit backend/server.py or frontend/src/App.js

# Commit changes
git add .
git commit -m "Description of changes"

# Push to GitHub
git push origin main
```

**Auto-Deploy:**
- Railway will automatically detect the push and redeploy backend (~2 minutes)
- Vercel will automatically detect the push and redeploy frontend (~2 minutes)

No manual deployment needed after initial setup! 🎊

---

## 🆘 Troubleshooting

### Issue: Frontend can't connect to backend

**Symptoms**: CORS errors, network errors, 404 errors

**Solutions**:
1. Check `.env.production` has correct Railway URL
2. Verify Railway backend is running (check Deployments tab)
3. Test backend directly: `curl https://your-railway-url.up.railway.app/api/`
4. Check CORS_ORIGINS in Railway includes your Vercel URL
5. Try redeploying frontend on Vercel

### Issue: CORS Error in Browser Console

**Error**: "Access to fetch at '...' from origin '...' has been blocked by CORS policy"

**Solutions**:
1. Go to Railway → Your Project → Variables
2. Update `CORS_ORIGINS` to your exact Vercel URL (no trailing slash)
3. Wait for Railway to redeploy (1-2 minutes)
4. Clear browser cache (Ctrl+Shift+R)
5. Refresh your app

### Issue: Database connection failed

**Error**: "Connection refused" or "Authentication failed"

**Solutions**:
1. Check Railway Variables → `MONGO_URL` is correct
2. Verify password has no special characters causing issues (try URL encoding)
3. Test connection string in MongoDB Compass desktop app
4. Verify Network Access in MongoDB Atlas allows `0.0.0.0/0`
5. Check if cluster is active (not paused due to inactivity)

### Issue: Build failed on Railway

**Solutions**:
1. Check Railway deployment logs (click on service → Deployments tab → View logs)
2. Verify `backend/requirements.txt` exists and has correct dependencies
3. Check Root Directory setting is `backend`
4. View error message in logs and fix accordingly
5. Try manual redeploy: Settings → Manual Deploy

### Issue: Build failed on Vercel

**Solutions**:
1. Check Vercel deployment logs (click on deployment → View Function Logs)
2. Verify `frontend/package.json` exists
3. Check Root Directory is `frontend`
4. Verify build command is correct: `yarn build`
5. Check environment variables are set correctly
6. Try redeploying: Deployments → Click ⋯ → Redeploy

### Issue: Railway service keeps crashing

**Solutions**:
1. Check Railway logs for error messages
2. Verify all environment variables are set
3. Test MongoDB connection string locally first
4. Check if you're on correct Python version (3.11+)
5. Verify Procfile or start command is correct

### Issue: Vercel shows old version of app

**Solutions**:
1. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
2. Check latest deployment on Vercel dashboard is "Ready"
3. Verify environment variables are set
4. Check if build completed successfully
5. Try hard refresh in incognito window

---

## 🔐 Security Best Practices

### Never Commit Secrets

The `.gitignore` file is configured to exclude:
- `.env` files
- `node_modules/`
- Build directories
- Sensitive credentials

### Secure Your MongoDB

1. Use strong passwords (auto-generated preferred)
2. Don't share your connection string publicly
3. Regularly rotate credentials
4. Monitor database access logs

### Update Dependencies

```bash
# Backend
cd backend
pip list --outdated

# Frontend
cd frontend
yarn outdated
```

---

## 📞 Need More Help?

### Resources

- [Railway Documentation](https://docs.railway.app/)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)

### Support Communities

- Railway Discord: https://discord.gg/railway
- Vercel Discord: https://vercel.com/discord
- MongoDB Community: https://www.mongodb.com/community

---

## 🎊 Congratulations!

You've successfully deployed your full-stack application to the cloud!

**What you achieved:**

✅ Professional cloud deployment  
✅ Your own database (MongoDB Atlas)  
✅ Your own backend (Railway)  
✅ Your own frontend (Vercel)  
✅ HTTPS security automatic  
✅ Auto-scaling enabled  
✅ Continuous deployment setup  

**Share your app with the world!** 🌍

---

**Total time spent**: ~60 minutes  
**Total cost**: $5/month  
**Skills gained**: Full-stack deployment mastery! 💪
