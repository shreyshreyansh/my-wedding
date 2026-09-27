# Golden parity checks

The prototype (`design/prototype/motion-prototype.html`) is the approved look and motion. While it is being ported, every step must render the same.

```sh
npm run build
npm run golden            # captures the prototype and the build, then compares them
```

- **What the capture does:** for 390×844, 375×667, 360×800 and 1440×900, it
  - screenshots the cover and the full opened page with reduced motion, so every section is in its final state;
  - scrolls the whole page with full motion and records what the animations left behind: the ScrollTrigger count, the pinned scene, chapter titles, the verse, the threads and the RSVP title.
- **Fixed conditions:** randomness is seeded and fonts come through `curl`, because Chromium here can't verify the proxy's certificate. The clock is fixed for still frames only, because GSAP's ticker reads `Date.now`.
- **Where results go:** captures land in `tests/golden/out/` (gitignored). `compare.mjs` exits non-zero when more than 0.1% of pixels differ or any motion metric changes, and writes diff images to `tests/golden/out/diff/`.

**Baseline at M0:** the verbatim port matched the prototype at 0.000% difference at all four sizes. It has 29–34 scroll triggers depending on width, all of which complete.
