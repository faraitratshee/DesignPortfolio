# Farai Thabang Ratshee — Portfolio 2026

Single-page portfolio for Farai Thabang Ratshee, **Senior Art Director**. Presents selected client work as a grid of "folders" (Orange, Absa, BITC, Nando's, Hilton Garden Inn, BIFM, and more) — each opening into a full artwork gallery — plus services, an experience timeline, a full CV view, and a lockable rate card.

## Single self-contained file

The entire site is one file: [`index.html`](index.html). Fonts, the React runtime, and every artwork image are embedded as `data:` URIs, so it has **no external dependencies** and works when opened directly (double-click / `file://`) or hosted anywhere — no build step, no bundle loader.

## Running locally

Just open `index.html` in a browser. Or serve it:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Assets

- `assets/` — original client work images, organized by project (source archive; the live site embeds optimized copies inline).
