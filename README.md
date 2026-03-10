# JSO HR Consultation Monitoring Agent
### AariyaTech Corp — Phase-2 Live Prototype (Next.js)

---

## ⚠️ Why Next.js instead of a plain HTML file?

The Anthropic API blocks direct browser requests (CORS policy).
This Next.js app fixes that by routing all Claude API calls through
**server-side API routes** (`/pages/api/`) — the browser never
touches the Anthropic API directly, and your API key stays secret.

---

## 🚀 Deploy to Vercel

### Step 1 — Push to GitHub
Make sure this folder is pushed to your GitHub repo.

### Step 2 — Import on Vercel
1. Go to **vercel.com/new**
2. Import your GitHub repo
3. Framework will be auto-detected as **Next.js**
4. Click **Deploy** (it will fail the first time — that's expected)

### Step 3 — Add your API key (CRITICAL)
After first deploy:
1. Go to your project on Vercel
2. **Settings → Environment Variables**
3. Add:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** `sk-ant-...` (your key from console.anthropic.com)
   - **Environments:** ✅ Production ✅ Preview ✅ Development
4. Click **Save**
5. Go to **Deployments → Redeploy** (top right → ⋯ → Redeploy)

### Step 4 — Done ✅
Your live URL is something like: `https://jso-agent-kiran.vercel.app`

---

## 💻 Run locally

```bash
npm install
```

Create a `.env.local` file:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

```bash
npm run dev
```

Open http://localhost:3000

---

## 📁 Project Structure

```
jso-nextjs/
  pages/
    index.js          ← Full React UI (home, session, report)
    _app.js           ← Global CSS loader
    api/
      analyze.js      ← Server-side: scores each HR utterance via Claude
      report.js       ← Server-side: generates post-session AI report
  styles/
    globals.css       ← CSS variables and animations
  package.json
  next.config.js
  README.md
```

---

Built for AariyaTech Corp · JSO Phase-2 Technical Assignment · Kiran
