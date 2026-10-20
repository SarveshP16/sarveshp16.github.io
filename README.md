# sarveshp16.github.io

My personal site, served by GitHub Pages at **https://sarveshp16.github.io**.

Plain HTML, CSS and vanilla JavaScript — no build step, no dependencies. Push to
`main` and GitHub publishes it.

```
index.html          the whole page
404.html            not-found page
assets/css/style.css
assets/js/main.js   theme toggle, cursor spotlight, scroll-spy nav, reveal animations
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
2. **Name, role and the one-line pitch** in `.intro`.
3. **Social links** — GitHub is already correct; LinkedIn and the email address
   are placeholders (`your-handle`, `you@example.com`). The email appears twice:
   in the sidebar and in the contact section.
4. **About** — three short paragraphs. Specifics beat adjectives.
5. **Experience** — one `<li class="card">` per role, most recent first.
6. **Projects** — one `<li class="card card--project">` each. Drop screenshots
   into `assets/img/` and replace the `.card__thumb` placeholder with an `<img>`.
7. **Skills** — keep the lists to things you'd happily be tested on.
8. **Résumé** — put a PDF at `assets/resume.pdf`, or delete that link.

Finally, delete the `<p class="draft-flag">` element — it's the badge in the
bottom-right corner reminding you the copy is still placeholder text.

## Theming

Colours live in two blocks at the top of `assets/css/style.css`: `:root` for
dark, `[data-theme="light"]` for light. Change `--accent` in both and the whole
page follows. The site picks up the visitor's system preference on first visit
and remembers any manual choice in `localStorage`.
