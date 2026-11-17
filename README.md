# Portfolio site

Plain HTML, CSS and JavaScript. No build step, no dependencies.

- `index.html` lists the projects and demos. `project.html?slug=<name>` renders a case study.
- `js/projects.js` holds every project's text and numbers. Each number is copied from that project's README or RESULTS.md.
- `demos/` holds three in-browser demos. The SQL replay reads `data/sql-replay.json`, built by `tools/build_replay_data.py`.

Preview locally: `python -m http.server 8765` in this folder, then open http://localhost:8765/.

## Hosting for free on GitHub Pages

1. Create a public repo named `<username>.github.io` and push the contents of this folder to its `main` branch.
2. In Settings, Pages, choose "Deploy from a branch", `main`, `/ (root)`.
3. The site is live at `https://<username>.github.io/` within a minute or two.

Other free static hosts that work the same way: Cloudflare Pages, Netlify, Vercel.
