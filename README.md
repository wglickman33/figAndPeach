# Fig & Peach — Necklace Order Form

Custom jewelry order form for Fig & Peach. Customers submit orders (no payment processing); admin reviews and processes orders separately.

## Status

**Project scaffold only** — form, admin dashboard, and order storage are not built yet.

## Stack

- [Vite](https://vite.dev/) + React + TypeScript
- [Netlify](https://www.netlify.com/) for hosting (configured via `netlify.toml`)
- Planned: Netlify Functions for order submission + admin auth

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## What you'll edit most often

| File / folder | Purpose |
|---------------|---------|
| `src/data/necklaces.example.ts` | Necklace catalog template (copy to `necklaces.ts` when ready) |
| `public/necklaces/` | Product photos (add images here) |
| `.env` | Admin credentials and notification settings (copy from `.env.example`) |

## Planned pages

1. **/** — Necklace Order Form (public)
2. **/admin** — Login + order list (private)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |

## Deployment (Netlify)

1. Connect this GitHub repo in Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variables from `.env.example` in Netlify dashboard
