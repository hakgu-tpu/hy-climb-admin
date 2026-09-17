# Hy-Climb Admin

Internal operator tool for editing the data behind [hy-climb.pages.dev](https://hy-climb.pages.dev/): the `centers` catalog and site-wide `app_config` (event banner, regular meeting, departure point, Instagram link) in the same Supabase project the public site reads from.

This is Phase 2 of `WIKI-DEC-005` in the `hy-climb` repo's wiki (`docs/wiki/09-decisions.md`). It is a separate, unlinked app on purpose — see that decision for the full shape (RLS, auth, Storage) this app depends on.

## Stack

Vite + React + React Router + Tailwind CSS, matching the public `hy-climb` app. `@supabase/supabase-js` for auth, data, and Storage.

## Scope

- `centers` table: create, edit, delete. Structured fields for name/address/region/description/affiliation/Naver place id/phone/images; `prices`, `affiliate_prices`, `sns_links`, `parking`, and `i18n` are edited as raw JSON (validated on blur) rather than dedicated widgets — this keeps the app small while still being safer than editing JSON directly in Supabase Studio.
- `app_config` (single row): Instagram URL as a plain field; `departure`, `event`, `meeting` as JSON.
- **Out of scope**: operator account creation/role changes (`profiles.role`). Invite and promote operators in Supabase Studio (Authentication → Users, then `update profiles set role = 'admin' where id = '...'` in the SQL Editor) — see the `hy-climb` repo's `supabase/README.md`.

## Auth

Supabase Auth, email + password only, no public sign-up screen. Any authenticated user whose `profiles.role` is `admin` or `operator` (checked via the `is_operator()` RPC) can use the app; anyone else sees a "not authorized" screen with a sign-out button. Accounts are created by an admin in Supabase Studio, not here.

## Images

Uploads go to the public `center-images` Storage bucket (`hy-climb` repo's `supabase/migrations/20260917100000_center_images_storage.sql`). New images get an absolute Storage URL in `centers.images`; the 11 originally seeded centers still use plain file names resolved against `public/images/centers/` in the `hy-climb` repo — both forms work on the public site (`src/utils/centerImageUrl.js` there). This app's image thumbnails only preview the Storage-URL form; legacy file names show as a broken-image icon here (harmless — they still render correctly on the public site).

## Setup

```bash
npm install
cp .env.example .env   # fill in VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY
npm run dev
```

Both env vars are the same publishable (anon-equivalent) values the public `hy-climb` app uses — safe to ship in a client bundle, protected by RLS, not the `service_role` key.

## Deploy

Cloudflare Pages, as its own project with its own (not publicly linked) domain — build command `npm run build`, output directory `dist`, with `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` set as project environment variables (see the `hy-climb` repo's `supabase/README.md` for the same Cloudflare Pages env var steps).
