# Genius Mind Chess Academy

A fully static Vite + React 19 + TypeScript website for Genius Mind Chess Academy in Noida.

## Static architecture

- No FastAPI, Node server, database, server actions, authentication, or server-side environment variables.
- Production output is plain HTML, CSS, JavaScript, images, `.htaccess`, and `config.json`.
- Live public content is loaded in the visitor's browser from Google Drive, published Google Sheets, Google Maps, Google Places, and CallMeBot.
- All external values are public runtime configuration. Never put private credentials in `config.json`.

## Development and build

```bash
cd frontend
yarn
yarn dev
yarn typecheck
yarn build
```

The deployable static output is `frontend/dist/`. Upload the **contents** of that directory to Hostinger's `public_html/`.

## Runtime configuration

Edit `frontend/public/config.json` before building, or edit `/config.json` directly after deployment. The app requests it with `cache: no-store`, so updating IDs and browser keys does not require a rebuild.

Required public values:

- CallMeBot: enabled flag, destination phone, API key
- Google Drive API v3: referrer-restricted browser API key and public folder ID
- Published Google Sheets CSV URLs: class schedule, tournaments, testimonials
- Google Maps Embed API: referrer-restricted browser API key plus Place ID or address query
- Google Places/Maps JavaScript API: referrer-restricted browser API key and Place ID

Placeholder values beginning with `REPLACE_WITH_` intentionally render clear setup states rather than broken content.

## Published sheet columns

- Schedule: `Date, Time, Program, Mode, Fees, Zoom Link, Notes`
- Tournaments: `Tournament, Date, Time, Format, Platform, Fees, Prize, Registration Link`
- Testimonials: `Name, Review, Rating`

## Hostinger

The included `public/.htaccess` is copied into `dist/` and routes unknown browser paths to `index.html`. No PHP or Web Apps/Node.js feature is required.