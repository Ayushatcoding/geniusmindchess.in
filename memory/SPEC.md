# Genius Mind Chess Academy — Living Spec

## Product
Single-page, mobile-first static website for Genius Mind Chess Academy (GMCA), a Noida chess academy established in 2011. It includes Home, About/Why Chess, Vision & Mission, Coaches, Programs, Curriculum, Fees, live Class Schedule, live Tournaments, sheet-powered Testimonials, live Google Reviews, Drive-powered Gallery, and Contact.
- The sticky header shows the complete official logo lockup, including its text banner, on both desktop and mobile; the cropped emblem is reserved for the favicon.
- The header trial-class CTA appears beside the logo from 480px upward and stays hidden on narrower phones to avoid crowding.

## Static architecture
- The project has no backend, database, authentication, server actions, or server-side environment variables.
- `cd frontend && yarn build` outputs the complete deployable site to `frontend/dist/`.
- `frontend/public/config.json` is a public runtime configuration file copied to `/config.json`; it can be edited after deployment without rebuilding.
- Placeholder values beginning with `REPLACE_WITH_` render explicit setup states.

## Public integrations
- CallMeBot: contact-form data is sent directly from the browser to the configured WhatsApp destination. Its browser-visible credentials are not secrets. The direct `wa.me` option remains available.
- Google Drive API v3: one public folder powers both the homepage carousel and gallery.
- Published Google Sheets CSV: separate feeds power class schedule, tournaments, and testimonials.
- Google Maps Embed API: location iframe.
- Google Places via Maps JavaScript API: separate live Google reviews section with attribution.
- Google browser keys must be restricted to the deployed HTTP referrers and only their required APIs.

## Placeholder editorial content
- Coach headshots and bios, Facebook URL, footer tagline, curriculum wording, and Vision & Mission wording await owner-approved final content.
- Contact hours use the supplied Google Maps version and still need owner confirmation.
- Location: BL-8, Sector 116, Noida, UP 201301.

## Key flows
1. Visitors navigate the continuous page through sticky desktop or mobile navigation.
2. Live public content loads independently; an unavailable integration never blocks the page shell.
3. Contact submission calls CallMeBot directly and shows success after the browser dispatch completes; a configuration/error state points visitors to direct WhatsApp.