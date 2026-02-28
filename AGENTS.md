## Cursor Cloud specific instructions

This is a **zero-dependency static HTML website** for "Wirdly - Smart Islamic Reminders" (an iOS app marketing site). It is deployed via GitHub Pages.

### Structure

- `index.html` — Landing/homepage
- `privacy.html` — Privacy Policy
- `support.html` — Support & FAQ
- `.github/workflows/pages.yml` — GitHub Pages deployment

### Development

- **No build step, no package manager, no dependencies.** The site is plain HTML + inline CSS.
- To serve locally: `python3 -m http.server 8000` from the repo root, then open `http://localhost:8000`.
- There are no automated tests, no linter, and no JavaScript.
- Validation can be done by opening HTML files in a browser and verifying page content and navigation links work between the three pages.
