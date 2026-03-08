# 🎨 Infographic Studio

Turn raw notes, goals, timelines, and KPIs into premium executive-ready visual boards — exportable as PNG, JPEG, PDF, or Word.

## ✨ Features

- **Live preview** — board updates as you type
- **4 visual themes** — Midnight Luxe, Pearl Executive, Obsidian Neon, Aurora Drift
- **5 section toggles** — Timeline, Pie Chart, Bar Chart, Highlights, Checklist
- **4 export formats** — PNG (2.5×), JPEG, PDF, Word (.docx)
- **Beautiful landing page** with animated hero
- **Fully responsive** — works on mobile and desktop

---

## 🚀 Quick Start (Local)

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Open http://localhost:5173
```

---

## 🌐 Deploy to Netlify (Recommended — Free)

### Option A: Drag & Drop (fastest)

```bash
# Build the project
npm run build

# This creates a `dist/` folder
# Go to https://app.netlify.com/drop
# Drag and drop the `dist/` folder
# Your site is live instantly!
```

### Option B: GitHub + Netlify Auto-Deploy

1. Push this project to a GitHub repository
2. Go to [app.netlify.com](https://app.netlify.com) → "Add new site" → "Import from Git"
3. Connect your GitHub repo
4. Set build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Click "Deploy site" — done! Auto-deploys on every push.

---

## ▲ Deploy to Vercel (Also Free)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (follow prompts)
vercel

# For production
vercel --prod
```

Or use the dashboard:
1. Go to [vercel.com](https://vercel.com) → "Add New Project"
2. Import your GitHub repo
3. Vercel auto-detects Vite — just click Deploy

---

## 📄 Deploy to GitHub Pages

```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json scripts:
# "deploy": "gh-pages -d dist"
# "predeploy": "npm run build"

# Then run:
npm run deploy
```

Also add to `vite.config.js`:
```js
export default defineConfig({
  base: '/your-repo-name/',  // ← add this line
  plugins: [react()],
})
```

---

## 📝 How to Use

Paste any free-form text into the input box. The parser looks for:

| Pattern | Example | Effect |
|---|---|---|
| Vision / Title | `Vision: My startup plan` | Sets the board title |
| Dates + label | `Jan 2026 - Launch beta` | Adds to Timeline |
| Percentages | `Services 45%` | Adds to Pie Chart |
| Key: Value | `Leads: 120` | Adds to Metrics & Bar Chart |
| Bullet goals | `- Reach $500k ARR` | Adds to Action Checklist |
| Other bullets | `- Any other text` | Adds to Highlights |

---

## 🏗️ Tech Stack

- **React 18** + **Vite**
- **Tailwind CSS** — utility styling
- **Framer Motion** — animations
- **Recharts** — pie + bar charts
- **html-to-image** — PNG/JPEG capture
- **jsPDF** — PDF export
- **docx** — Word export
- **file-saver** — download handling
- **Lucide React** — icons
- **Google Fonts** — Syne + DM Sans

---

## 📁 Project Structure

```
infographic-studio/
├── public/
│   └── favicon.svg
├── src/
│   ├── App.jsx          ← All app logic + components
│   ├── main.jsx         ← React entry point
│   └── index.css        ← Tailwind + custom styles
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

---

## 🎨 Adding Custom Themes

In `src/App.jsx`, find the `palettes` object and add your own:

```js
myTheme: {
  name: "My Custom Theme",
  gradient: "from-rose-950 via-pink-900 to-purple-950",
  accent: "#f43f5e",
  accent2: "#a855f7",
  // ... etc
}
```

---

Made with ♥ using React + Vite
