# CareerForge — Frontend

Vite + React + Tailwind v4. Talks to the `careerforge-server` backend for
everything — auth, resume data, AI rewriting, and certificate uploads.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Point it at your backend:**
   ```bash
   cp .env.example .env
   ```
   The default (`http://localhost:5000`) is correct if you're running the
   backend locally on its default port — no changes needed unless you moved it.

3. **Make sure the backend is running first** (`npm run dev` in the
   `careerforge-server` folder, in a separate terminal).

4. **Run this project:**
   ```bash
   npm run dev
   ```
   Opens at `http://localhost:5173`. You'll land on the sign-in/sign-up
   screen — create an account, and it'll take you straight to the resume
   builder.

## How it's wired

- **`src/lib/api.js`** — the only file that talks to the backend. Every
  request goes through here, and it automatically attaches your JWT to
  authenticated calls.
- **`src/context/AuthContext.jsx`** — tracks who's logged in app-wide. The
  token lives in `localStorage`; on page load it re-validates against
  `/api/users/me` so refreshing doesn't log you out.
- **`src/components/ProtectedRoute.jsx`** — redirects to `/login` if you're
  not authenticated. Wraps the resume builder route in `App.jsx`.
- **`src/pages/ResumeBuilder.jsx`** — loads your existing resume on mount
  (or creates a blank one if you don't have one yet), and the "Forge"
  buttons call the real `/api/ai/rewrite-*` endpoints.

## What "Forge" does now

Unlike the earlier mockup, clicking **Forge** calls your backend's
`/api/ai/rewrite-bullets` or `/api/ai/rewrite-summary`. If your backend
doesn't have `OPENAI_API_KEY` set yet, you'll see a red banner with the
backend's error message instead of a rewritten bullet — that's expected,
not a bug. Same idea for certificate uploads and `CLOUDINARY_*`.

## Build for production

```bash
npm run build    # outputs to dist/
npm run preview  # serve the production build locally to sanity-check it
```
