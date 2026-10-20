#!/bin/sh
# Stamp each local CSS/JS reference in the HTML with a short hash of the
# file's contents: assets/css/style.css -> assets/css/style.css?v=1a2b3c4d
#
# GitHub Pages caches every file for 10 minutes and offers no way to change
# that. Without a stamp, a returning visitor can get a fresh index.html with a
# stale stylesheet or script, and the page breaks. A changed URL forces a
# fresh fetch, so the HTML and its assets always match.
#
# Runs automatically from .githooks/pre-commit. Safe to run by hand.

set -e
cd "$(git rev-parse --show-toplevel)"

pages="index.html 404.html"
assets="assets/css/style.css assets/js/main.js assets/js/network.js"

for asset in $assets; do
  [ -f "$asset" ] || continue
  hash=$(git hash-object "$asset" | cut -c1-8)
  for page in $pages; do
    [ -f "$page" ] || continue
    # Match the path whether or not it already has a ?v= stamp, and whether
    # it's written relative (assets/…) or root-relative (/assets/…).
    sed -i.bak -E "s#(${asset})(\?v=[0-9a-f]+)?\"#\1?v=${hash}\"#g" "$page"
    rm -f "$page.bak"
  done
done
