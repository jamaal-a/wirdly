# AGENTS.md

## Cursor Cloud specific instructions

This is a pure static HTML/CSS website (no JavaScript, no build step, no dependencies). It consists of 3 pages:
- `index.html` — Landing page
- `support.html` — Support/FAQ page
- `privacy.html` — Privacy policy page

### Running the dev server

Serve locally with Python's built-in HTTP server:

```
python3 -m http.server 8080
```

Then open `http://localhost:8080` in a browser.

### Linting

HTML can be linted with `htmlhint` (installed globally via npm):

```
htmlhint index.html support.html privacy.html
```

### Deployment

The site deploys to GitHub Pages via `.github/workflows/pages.yml` on push to `main`. No build step is needed.
