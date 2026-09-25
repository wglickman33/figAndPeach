# Fig & Peach Shop

Custom jewelry shop: browse categories, customize or add ready-made pieces, checkout, and order emails to your inbox via Resend. Catalog and images are managed in **Admin** (upload from your machine—e.g. exports from Google Drive—not synced automatically).

## Stack

| Layer | Service |
|--------|---------|
| Frontend | Vite + React + TypeScript |
| Hosting + API | Netlify (static site + serverless functions) |
| Database | Postgres (`DATABASE_URL`, e.g. Heroku Postgres) |
| Images | Cloudinary (admin uploads) |
| Order email | Resend |

## Prerequisites

- Node.js 20+
- Heroku app with **Postgres** addon (or any Postgres you control)
- [Cloudinary](https://cloudinary.com) account
- [Resend](https://resend.com) account
- Netlify site connected to this repo

## One-time database setup

1. **Create tables** — connect to your database and run the full script [`db/schema.sql`](db/schema.sql) (Heroku: `heroku pg:psql -a YOUR_APP`, paste SQL, `\q`).

2. **Seed structure** (categories, bead groups, default customize fields—not your product photos):

```bash
npm install
npm run db:seed
```

3. **Create admin login** — set in `.env` first (see below), then:

```bash
npm run seed:admin
```

Re-run `seed:admin` anytime you change `ADMIN_PASSWORD` in `.env`.

## Environment variables

Copy [`.env.example`](.env.example) to `.env` locally. Use the **same keys** in **Netlify → Site configuration → Environment variables** for production (except `ADMIN_PASSWORD` and `VITE_SKIP_ORDER_EMAIL`).

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Postgres connection string (Heroku: `heroku config:get DATABASE_URL`) |
| `SESSION_SECRET` | Long random string; **required in production** for admin sessions |
| `ADMIN_EMAIL` | Only this email can sign in to `/admin` |
| `ADMIN_PASSWORD` | Local only: used by `npm run seed:admin` to set the password hash |
| `CLOUDINARY_URL` | `cloudinary://API_KEY:API_SECRET@CLOUD_NAME` (no duplicate prefix) |
| `RESEND_API_KEY` | Resend API key |
| `ORDER_NOTIFICATION_EMAIL` | Inbox that receives new orders |
| `ORDER_FROM_EMAIL` | Resend sender (verified domain or `onboarding@resend.dev` for testing) |
| `VITE_SKIP_ORDER_EMAIL` | Optional, **local only**: `true` with `npm run dev` to skip email on checkout |

Never commit `.env`.

## Local development

**Full stack (shop + admin + API):**

```bash
npm run dev:netlify
```

Open the URL Netlify prints (often `http://localhost:8888`). Admin: `/admin/login`.

**Frontend only** (catalog offline, no login):

```bash
npm run dev
```

Use `VITE_SKIP_ORDER_EMAIL=true` if you only run Vite and still want to reach the confirmation page without Resend.

## Admin workflow (your catalog)

All sellable content lives in the **database + Cloudinary**, entered through admin—not in repo files.

1. **`/admin/login`** — email must match `ADMIN_EMAIL`; password from `seed:admin`.
2. **Categories** — sidebar sections (Necklaces, Scrunchies, …).
3. **Products** — name, price, photo upload, **Pre-made** vs **Customizable**, visible toggle.
4. **Bead types** — customization groups (bead sizes, clasps, pony beads, …).
5. **Bead options** — images inside each group (pickers on the customize page).
6. **Customize fields** — which steps each category (or product override) shows: length, clasps, colors, etc.

**Google Drive:** download images to your computer, then upload via admin (products + bead options). There is no Drive sync.

## Customer flow

1. `/shop/:categoryId` — grid of products  
2. Pre-made → add to cart; customizable → configure → add to cart  
3. `/order` — cart, name, pickup/shipping, submit  
4. `/confirmation` — thank-you page; **Resend** emails `ORDER_NOTIFICATION_EMAIL`

Payment is off-site (Zelle/Venmo)—copy in [`src/constants/config.ts`](src/constants/config.ts).

## Deploy to Netlify

1. Connect repo; build settings are in [`netlify.toml`](netlify.toml) (`npm run build`, publish `dist`).
2. Add all production env vars listed above (`DATABASE_URL` must be reachable from Netlify—Heroku Postgres often allows external connections; use SSL).
3. Deploy. Test `/shop/necklaces`, `/order`, and `/admin/login`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev:netlify` | Local Vite + Netlify functions + `.env` |
| `npm run dev` | Vite only |
| `npm run build` | Production build |
| `npm run db:seed` | Re-apply [`db/seed.sql`](db/seed.sql) (idempotent structure) |
| `npm run seed:admin` | Set admin password hash from `ADMIN_EMAIL` / `ADMIN_PASSWORD` |

## Repo layout (what matters)

| Path | Purpose |
|------|---------|
| `src/` | Shop + admin UI |
| `netlify/functions/` | API + order email |
| `db/schema.sql` | Database tables |
| `db/seed.sql` | Default categories, groups, customize field templates |
| `scripts/` | Seed helpers |
