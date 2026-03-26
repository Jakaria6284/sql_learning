# Deploy SQL Learning Site to Vercel

## Prerequisites
1. **GitHub Account** — https://github.com (free)
2. **Vercel Account** — https://vercel.com (free)
3. **Git Installed** — https://git-scm.com

## Step 1: Create a GitHub Repository

### Option A: Using Command Line
```bash
cd /home/jakaria/baby
git init
git add .
git commit -m "Initial commit: SQL learning website"
git branch -M main
```

Then on GitHub:
- Go to https://github.com/new
- Create repository named `sql-learning` (or any name)
- Copy the commands shown and run:
```bash
git remote add origin https://github.com/YOUR_USERNAME/sql-learning.git
git push -u origin main
```

### Option B: GitHub Desktop
1. Go to https://github.com/new
2. Create new repository
3. Open GitHub Desktop
4. Clone the repository
5. Copy `/home/jakaria/baby/` files into the cloned folder
6. Commit and push

---

## Step 2: Deploy to Vercel

### Method 1: Simple (Recommended)
1. Go to https://vercel.com
2. Click **"New Project"**
3. Click **"Import from Git"**
4. Connect your GitHub account
5. Select your `sql-learning` repository
6. Click **"Import"**
7. Vercel auto-detects it's static HTML — click **"Deploy"**
8. **Done!** Your site is live in ~1 minute

### Method 2: Using Vercel CLI
```bash
npm install -g vercel
vercel login
cd /home/jakaria/baby
vercel
```

Follow the prompts. Your site will be live with a URL like: `https://sql-learning.vercel.app`

---

## Step 3: Custom Domain (Optional)

In Vercel Dashboard:
1. Select your project
2. Go to **Settings** → **Domains**
3. Click **"Add Domain"**
4. Enter your domain (e.g., `sqlmastery.com`)
5. Update DNS records at your domain registrar (instructions provided)

---

## Step 4: Keep It Updated

After making changes locally:
```bash
cd /home/jakaria/baby
git add .
git commit -m "Update: new feature description"
git push origin main
```

Vercel automatically redeploys! No manual step needed.

---

## Important Files for Vercel

Vercel automatically detects:
- ✅ HTML files (`*.html`)
- ✅ CSS files (`assets/style.css`)
- ✅ JavaScript files (`assets/app.js`)
- ✅ External CDN resources (SQL.js loading fine)

**No special configuration needed** — Vercel treats this as a static site.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Files not showing | Make sure all paths are relative (`./assets/`, not `/assets/`) |
| CSS/JS not loading | Check File → View for actual URLs in browser DevTools |
| SQL.js errors | It loads from CDN; check internet connection |
| Domain not working | DNS changes take 24-48 hours to propagate |

---

## Performance

Your site will be:
- ⚡ **Globally cached** — fast everywhere
- 🔒 **HTTPS by default** — secure
- 📊 **Analytics included** — see traffic
- 🚀 **Auto-scaling** — handles traffic spikes

---

## Share Your Site

Once live:
- **Development**: `https://your-project.vercel.app`
- **Production**: `https://yourdomain.com` (if added custom domain)
- Share the link anywhere!

---

## Next: Advanced (Optional)

Want more control? Create `vercel.json`:

```json
{
  "buildCommand": "echo 'Static site, no build needed'",
  "outputDirectory": ".",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=3600"
        }
      ]
    }
  ]
}
```

But honestly, for this project, **you don't need it** — Vercel handles everything automatically.

---

## Questions?

- **Vercel Docs**: https://vercel.com/docs
- **GitHub Help**: https://docs.github.com
- Need help with your specific setup? Ask!
