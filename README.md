# Data-Driven Academic & Central Bank Research Website

This folder contains a bottom-up, data-driven personal website designed for PhD researchers and economists.

---

## 🚀 How Maintenance Works

You **never** need to touch HTML or CSS files when updating your content. All content is decoupled into **3 JSON data files** in the `data/` directory:

1. **`data/profile.json`**: Bio, affiliation, research fields, social links, contact information.
2. **`data/publications.json`**: Working papers, peer-reviewed articles, and policy briefs. Includes title, coauthors, abstract, JEL codes, BibTeX, and PDF/code repository links.
3. **`data/cv.json`**: Education, professional appointments, invited seminar/conference presentations, referee service, and awards.

When uploading PDFs (CV or working paper drafts), place them in `assets/papers/` and reference the relative path in `publications.json` or `profile.json`.

---

## 💻 Local Testing & Preview

To preview the website on your local machine:

```bash
# Open terminal inside .WEBSITE and run:
python -m http.server 8000
```
Then navigate to `http://localhost:8000` in your web browser.

---

## 🔄 Updating & Publishing Site Changes

Whenever you edit your JSON files in `data/` or add new PDFs to `assets/papers/`, run these commands in your terminal inside `.WEBSITE` to publish your updates online:

```bash
git add .
git commit -m "Update website content"
git push
```

GitHub Pages will automatically rebuild and update your live website at `https://bianchichignoli.it` within ~1-2 minutes!

---

## 🌐 Connecting to GitHub & Deploying

### 1. Create a GitHub Repository
- Log in to GitHub and create a new public repository (e.g. `academic-website` or `username.github.io`).

### 2. Push Local Code to GitHub
Open terminal inside `.WEBSITE` and run:

```bash
git add .
git commit -m "Initial academic research website setup"
git branch -M main
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPO_NAME>.git
git push -u origin main
```

### 3. Deploy via GitHub Pages
1. Go to your repository settings on GitHub: `Settings` -> `Pages`.
2. Under **Build and deployment**, set **Source** to `Deploy from a branch` and select `main` / `/ (root)`.
3. Click **Save**. GitHub Pages will build your site in ~60 seconds.

---

## 🏷️ Custom Domain Setup

1. **Edit `CNAME` file**: Update the `CNAME` file in this repository to contain your exact custom domain name (e.g., `janedoe-research.org`).
2. **Configure DNS Records with your Registrar**:
   - For a apex domain (`example.com`), add 4 `A` records pointing to GitHub Pages IPs:
     - `185.199.108.153`
     - `185.199.109.153`
     - `185.199.110.153`
     - `185.199.111.153`
   - For a subdomain (`www.example.com` or `research.example.com`), add a `CNAME` record pointing to `<YOUR_GITHUB_USERNAME>.github.io`.
3. Enable **Enforce HTTPS** in GitHub Pages settings once DNS propagation completes.
