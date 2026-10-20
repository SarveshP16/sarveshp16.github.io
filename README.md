# sarveshp16.github.io

My personal site, served by GitHub Pages at **https://sarveshp16.github.io**.

A security-engineering portfolio with a DevSecOps spine: boot sequence, an
interactive network-topology background, a threat-console hero with a radar
sweep, a scroll-driven secure-delivery pipeline, and a live status bar.

Plain HTML, CSS and JavaScript with no build step. GSAP and ScrollTrigger load
from cdnjs for the scroll animation; push to `main` and GitHub publishes it.

```
index.html             the whole page
404.html               not-found page
assets/css/style.css   design tokens and every component
assets/js/main.js      boot clean-up, name scramble, role typing, nav,
                       mobile menu, scroll reveals, pipeline and timeline
                       progress, counters, card tilt, magnetic buttons, clocks
assets/js/network.js   the background canvas
assets/img/            put your photo and project screenshots here
.nojekyll              serve the files as-is, skip Jekyll
```

## Running it locally

```bash
python -m http.server 8000
```

Then open http://localhost:8000. The boot overlay plays once per browser
session; open a private window, or run `sessionStorage.clear()` in the console,
to see it again.

## Editing the content

Every spot that needs your words is marked with an `EDIT:` comment in
`index.html`. In rough order of importance:

1. **`<title>` and `<meta name="description">`** — what Google and link
   previews show.
2. **Hero** — availability chip, the roles that cycle in `data-typed` (keep the
   `sr-only` sentence beside it in step), and the pitch.
3. **Links** — GitHub is real; LinkedIn (`your-handle`) and email
   (`you@example.com`) are placeholders. The email appears in the hero and the
   contact section; LinkedIn in both of those too.
4. **About** — the terminal block, plus the ID card: location, focus, and the
   four stats. Use real numbers or delete the stats list. Swap the `SP` initials
   for `<img src="assets/img/you.jpg" alt="Sarvesh Pandit">`.
5. **Pipeline** — six stages. Make them the pipeline you actually build.
6. **Experience** — one `<li class="timeline__item">` per role.
7. **Projects** — one `<article class="project">` each. Status tag colour:
   `tag--ok` green, `tag--info` cyan, `tag--warn` amber, `tag--crit` red.
8. **Arsenal and Clearances** — tools you'd be happy to be tested on, and your
   real certifications. Delete the Clearances block if you have none yet.
9. **Résumé** — put a PDF at `assets/resume.pdf`, or remove the hero button.

Finally, delete the `hud__item--draft` element — the amber `PLACEHOLDER COPY`
chip in the status bar that stops you sharing the site while it's still filler.

## Design notes

- **Type.** Space Grotesk for display, Inter for reading, JetBrains Mono for
  labels and terminal output.
- **Colour.** All tokens are at the top of `style.css`. `--green` is the signal
  colour; `--grad` runs green → cyan → violet and drives the gradient text,
  borders and progress bars.
- **Motion that doesn't block content.** The boot overlay and hero entrance are
  pure CSS keyed off classes set by a tiny inline script, so they start at first
  paint instead of waiting for the CDN. GSAP only runs the scroll work. If it
  fails to load, every section renders in its finished state.
- **Honest chrome.** The radar console and status bar are decoration. The clock
  and session timer are real; nothing else claims to be live data.
- **Accessibility.** The scrambled name and the typed roles have stable
  accessible names. The mobile menu manages focus and closes on Escape.
  `prefers-reduced-motion` turns off the boot sequence, canvas animation,
  scramble, typing, radar, marquee and every scroll effect.
