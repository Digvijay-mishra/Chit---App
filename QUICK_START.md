# ⚡ Quick Deployment Checklist

This is a condensed version of the full deployment guide. Use this as a quick reference.

---

## 📝 Pre-Deployment Checklist

- [ ] MongoDB Atlas account created
- [ ] MongoDB connection string saved
- [ ] GitHub account ready
- [ ] Railway account (sign up with GitHub)
- [ ] Vercel account (sign up with GitHub)

---

## 1️⃣ MongoDB Atlas (15 min)

```bash
# What you need to save:
MONGO_URL="mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority"
DB_NAME="test_database"
```

**Quick Steps:**
1. Go to https://www.mongodb.com/cloud/atlas → Sign up
2. Create **M0 FREE** cluster (AWS, closest region)
3. Create user: `appuser` with auto-generated password
4. Network Access: Add `0.0.0.0/0`
5. Get connection string (Connect → Application → Python 3.12+)
6. Replace `<password>` with your actual password

---

## 2️⃣ GitHub (5 min)

```bash
cd /app

# Create repo on GitHub first, then:
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR-USERNAME/REPO-NAME.git
git branch -M main
git push -u origin main
```

---

## 3️⃣ Railway - Backend (10 min)

**Quick Steps:**
1. https://railway.app → Login with GitHub
2. **New Project** → **Deploy from GitHub repo**
3. Select your repository
4. **Settings** → Root Directory: `backend`
5. **Variables** tab → Add:
   ```
   MONGO_URL=mongodb+srv://...
   DB_NAME=test_database
   CORS_ORIGINS=*
   ```
6. **Settings** → **Networking** → **Generate Domain**
7. Save your Railway URL: `https://your-app.up.railway.app`

**Test:**
```bash
curl https://your-app.up.railway.app/api/
# Should return: {"message":"Hello World"}
```

---

## 4️⃣ Vercel - Frontend (10 min)

**Create production environment:**
```bash
cd /app/frontend
cat > .env.production << EOF
REACT_APP_BACKEND_URL=https://your-railway-url.up.railway.app
EOF

# Commit and push
cd /app
git add frontend/.env.production
git commit -m "Add production environment"
git push origin main
```

**Deploy:**
1. https://vercel.com → Login with GitHub
2. **Add New** → **Project** → Import your repo
3. **Root Directory**: `frontend`
4. **Environment Variables**: 
   - `REACT_APP_BACKEND_URL` = `https://your-railway-url.up.railway.app`
5. Click **Deploy**
6. Save your Vercel URL: `https://your-app.vercel.app`

---

## 5️⃣ Update CORS (2 min)

1. Railway → Your Project → **Variables**
2. Edit `CORS_ORIGINS`: Change from `*` to `https://your-app.vercel.app`
3. Wait for redeploy (~1 min)

---

## ✅ Verify Deployment

```bash
# Test backend
curl https://your-railway-url.up.railway.app/api/status

# Test from browser console
fetch('https://your-railway-url.up.railway.app/api/status')
  .then(r => r.json())
  .then(d => console.log(d))
```

**Open**: `https://your-app.vercel.app`
- [ ] Page loads without errors
- [ ] Browser console shows no CORS errors
- [ ] API calls work (check Network tab)

---

## 🔄 Future Updates

```bash
cd /app

# Make changes to your code

# Commit and push
git add .
git commit -m "Your changes"
git push origin main

# Auto-deploys on Railway & Vercel in ~2 minutes!
```

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| CORS error | Update `CORS_ORIGINS` in Railway to exact Vercel URL |
| Frontend can't connect | Check `.env.production` has correct Railway URL |
| DB connection failed | Verify `MONGO_URL` in Railway, check Network Access in Atlas |
| Build failed | Check logs on Railway/Vercel dashboard |

---

## 📋 Your Deployment Info

Fill this in as you deploy:

```
MongoDB Connection String:
mongodb+srv://________________@____________.mongodb.net/?retryWrites=true&w=majority

GitHub Repository:
https://github.com/_______________/_______________

Railway Backend URL:
https://________________________________.up.railway.app

Vercel Frontend URL:
https://________________________________.vercel.app
```

---

## 💰 Cost Summary

- MongoDB Atlas: **FREE** (M0 tier)
- Railway: **$5/month** (500 free hours = ~20 days)
- Vercel: **FREE** (Hobby tier)
- **Total: $0-5/month**

---

## 🎉 Done!

**Total Time**: ~40 minutes  
**Your app is live!** 🚀

For detailed instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)
