# Farai Thabang Ratshee — Portfolio

A single-page portfolio site for Farai Thabang Ratshee, a Senior Art Director. Presents work as a stack of overlapping "folders" by category — Branding & Identity, Campaign & Social, Web & Interface, Print & Environmental, and Illustration — each opening into a project grid and full case-study view.

Built as static, dependency-free HTML/CSS/JS — no build step required.

## Structure

- `index.html` — page markup (sidebar, hero, overlay containers)
- `styles.css` — all styling, including responsive breakpoints for tablet and mobile
- `script.js` — renders folders/menu/project grid/case studies from `content.json`, handles navigation state and the folder float/hover animation
- `content.json` — all copy, categories, projects and image references
- `assets/` — client work images, organized by project

## Running locally

Any static file server works, e.g.:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Editing content

All copy, project data, and image paths live in `content.json`. Add or edit a project there and it will appear automatically in the relevant category folder — no HTML/JS changes needed.
