# sarveshp16.github.io

My personal site, served by GitHub Pages at **https://sarveshp16.github.io**.

A DevSecOps control-plane skin: terminal type, notched panels, a faint grid,
a secure-delivery pipeline strip, and a status bar along the bottom.

Plain HTML, CSS and vanilla JavaScript — no build step, no dependencies. Push
to `main` and GitHub publishes it.

```
index.html          the whole page
404.html            not-found page
assets/css/style.css
assets/js/main.js   theme toggle, cursor spotlight, scroll-spy nav,
                    reveal animations, pipeline stages, status-bar clocks
.nojekyll           serve the files as-is, skip Jekyll
```

## Running it locally

Any static file server works. With Python installed:

```bash
python -m http.server 8000
```

Then open http://localhost:8000.

## Editing the content

Every spot that needs your words is marked with an `EDIT:` comment in
`index.html`. In rough order of importance:

1. **The `<title>` and `<meta name="description">`** — this is what Google and
   link previews show.
2. **Name, role and the one-line pitch** in `.session`.
3. **Social links** — GitHub is already correct; LinkedIn and the email address
   are placeholders (`your-handle`, `you@example.com`). The email appears twice:
   in the sidebar and in the contact section.
4. **Pipeline stages** — the `<li class="stage">` list. Make it the pipeline you
   actually build; it's the first thing on the page.
5. **About** — the terminal block. Three short paragraphs, each under its own
   prompt line. Specifics beat adjectives.
6. **Experience** — one `<li class="card">` per role, most recent first.
7. **Projects** — one `<li class="card card--project">` each. The status badge
   takes `badge--ok` (green), `badge--warn` (amber) or `badge--idle` (grey).
8. **Stack** — keep the lists to things you'd happily be tested on.
9. **Résumé** — put a PDF at `assets/resume.pdf`, or delete that link.

Finally, delete the `<li class="hud__item hud__item--draft">` element — it's the
amber `PLACEHOLDER_COPY` chip in the status bar, there to stop you accidentally
sharing the site while the copy is still filler.

## Design notes

- **Colours** live in two blocks at the top of `assets/css/style.css`: `:root`
  for dark, `[data-theme="light"]` for light. Change `--accent` in both and the
  whole page follows. Dark is the real theme; light is the same structure with
  the glow switched off. The site follows the visitor's system preference on
  first visit and remembers a manual choice in `localStorage`.
- **The cut corners** come from one `clip-path` rule shared by panels, pills and
  buttons. Change `--notch` to adjust the bite, or set it to `0px` to square
  everything off.
- **The status bar is decorative chrome.** The clock and session timer are real;
  the rest describes how the page is built and served, deliberately — no made-up
  metrics on a page about security.
- **The pipeline strip is a diagram, not a live run.** The stages light up in
  sequence on load to show the shape of a secure delivery pipeline.
- **Everything is JetBrains Mono.** If long paragraphs in mono bother you, give
  `.term__body p` and `.card__text` a sans stack and the rest stays as is.
- **Motion** respects `prefers-reduced-motion`: the scanline, the cursor glow,
  the caret and the reveal animations all switch off, and the pipeline renders
  complete.
