# 03 · Build plan: the Shreyansh and Mrunalini invitation site

## Context
The design phase is done. The approved look and motion live in one prototype file, `design/prototype/motion-prototype.html`. It is a ~116 KB HTML fragment with one inline script, plus `design/prototype/vendor/` (GSAP 3.13.0, ScrollTrigger, Lenis 1.3.11). The research and design decisions are in `docs/01-research.md` and `docs/02-design.md`.

The build turns the prototype into a real, personal and private invitation that families open from WhatsApp. It keeps the look and motion as they are.

**What the couple decided:**
- **Personal links.** Each family gets `?g=<code>`, greeting them by name and showing only their events. Sent from family phones.
- **RSVPs land in a Google Sheet.** If sending fails, a pre-filled WhatsApp reply appears instead.
- **Launch with the current code-drawn art**, polished.
- **Music is their own recording.** It starts on the cover tap and has a mute button.

**Timing:** today is 27 Sep. Invites go out from about Tue 27 Oct; the wedding is 8–9 Dec 2026.

## Stack and hosting
- **Astro, static output, vanilla TypeScript.** No frameworks, no view transitions, no i18n routing (one URL for everyone).
  - `gsap`, `gsap/ScrollTrigger` and `lenis` come from npm and are bundled, never from a CDN. A CDN failure already silently killed the motion on a phone.
  - Lenis loads only with `(pointer: fine)` and full motion.
- **Cloudflare Pages** hosts `dist/`, with **Pages Functions** in `functions/`:
  - `functions/index.ts`: personalisation at the edge.
  - `functions/api/guest.ts`, `functions/api/rsvp.ts`.
  - Shared server code lives in `server/`.
- **Deploys:** Git integration on `main`, `npm run build`, output `dist`, `NODE_VERSION=22`.
- **Domain:** a custom `.in` domain on Cloudflare DNS, with `www` → apex 301.
- **Private repo.** It will hold parents' names and the venue.

## Repo layout (new)
```
astro.config.mjs  package.json  wrangler.toml  .dev.vars.example
src/data/wedding.ts   src/data/schema.ts            # the single data file + types, todo(), validate
src/art/{palette,peacock,events,rites,decor,cover}.ts   # pure SVG-string functions from the prototype
src/components/*.astro  (Cover, Hero, Ribbons, Meeting, Invitation, Schedule, Chapter, RiteTokens, Mangal, Countdown, Rsvp, Footer, Controls, SeoHead)
src/styles/*.css      (tokens, base, textiles, buttons, cover, hero, ribbons, meeting, invite, schedule, mangal, curtain, rsvp, footer, controls, gentle)
src/scripts/main.ts guest.ts cover.ts music.ts rsvp.ts calendar.ts countdown.ts motion-pref.ts
src/scripts/motion/{index,env,lenis,burst,cover,hero,ribbons,meeting,invite,schedule,loops,mangal,curtain,rsvp,rites,wave,progress,gentle}.ts
src/pages/index.astro  src/pages/cal/[file].ics.ts  src/pages/og.astro (tooling, removed after build)
functions/index.ts  functions/api/{guest,rsvp}.ts  server/{guests,personalize,rsvp,forward,headers}.ts
apps-script/Code.gs   scripts/{fonts-collect,fonts,og,budget,postbuild,guests-push,rsvp-resync,codes,audio}.mjs
tests/e2e/*.spec.ts tests/unit/*.spec.ts tests/fixtures/guests.json tests/mock-sheet.mjs tests/__golden__/
docs/03-build-plan.md  docs/04-runbook.md (family operations)     private/ (gitignored guest CSVs)
```

## Porting the prototype safely
One commit per step. After each step, run a visual diff against the golden screenshots and a motion smoke test.

1. **Golden baseline.** Run the existing Playwright harness on the prototype at 390×844, 375×667, 360×800 and 1440×900, in full and reduced motion. Record the ScrollTrigger count, which is 29 today.
2. **Verbatim move.** CSS → `styles/prototype.css`; markup → `index.astro`; the IIFE → `scripts/legacy.ts`, importing gsap. The output must be identical.
3. **Extract the art functions** into `src/art/*`:
   - `frame`, `ART`, `eventArt`, `medallion`, `peacock`, `fan`, `beads`, `riteIcon`, `foot`, the feather and grain drawings, the pallu and toran.
   - `eventArt(ev, clipId)` replaces the global `clipUid`.
4. **Render the art at build time** (Astro `set:html`), with a seeded random generator. The no-JS view then shows the art too.
5. **Move all hard-coded content into `wedding.ts`.** No visual change.
6. **Split `gsap.matchMedia` into section modules.**
   - Shared state goes in a `ctx` object.
   - The hero starts on an `invite:open` event.
   - Loop over the chapters that exist, because the edge removes the ones a guest isn't invited to.
7. **Then make the intentional changes:**
   - Body text ≥18px and steppers 48px.
   - Remove the Moments guide and the prototype-only `window.claude` and Blob code.
   - Add the new features below.

**Rules:**
- Essential behaviour (cover open, RSVP, calendar, music) lives in `main.ts` with **no GSAP dependency**. Motion is added by `import('./motion')`.
- An inline ES5 fallback can always open the cover on old browsers. `html.js` is set only if the browser supports modules.
- Content is never hidden by CSS, except `.cv-in` with its 3s `cvsafe` fallback.

## The data file: `src/data/wedding.ts`
It holds:
- `couple` (EN and Devanagari names, surnames, parents per language, order: groom first).
- `venue` (public banquet only).
- `events[]`, each with id, name in en/mr/hi, story, ISO start/end with +05:30, "when" text, dress text, swatch.
- `countdown`.
- `invitation.{en,mr,hi}` as ordered blocks, following research §10.
- `verse`, `ribbons`, `chaupai`.
- `rsvp` (deadline, grace, maxPerEvent).
- `music` (src, loop, title, credit).
- `copy` for every section, including the no-code and bad-code states.
- `site.og`, `calendarSequence`.

The WhatsApp numbers are Cloudflare env vars (`WA_BRIDE`, `WA_GROOM`), not in the repo.

**Placeholders.** Missing content goes through `todo('label')`:
- **Preview builds** show it as `⟦label⟧`.
- **With `STRICT=1`**, the build fails and lists what's missing. Set it in production at go/no-go.

## Guest links
- **Sheet.** A family-owned Google Sheet with tabs `Guests`, `RSVP`, `RSVP log`, `Totals`, `Templates`. `Guests` columns:
  - `code, family, family_dev, lang(en|mr|hi), side(bride|groom), inv_haldi, inv_sangeet, inv_shaadi, party, phone, sender, notes`
  - Formula columns `link`, `message`, and `send` (a `wa.me` link with the personalised message), plus `sent_on`, `replied`, `test`.
- **Codes.** 6 characters from `23456789abcdefghjkmnpqrstuvwxyz`, from the Apps Script menu **Wedding → Generate missing codes**.
  - It fills blank cells only; a sent code never changes.
  - `scripts/codes.mjs` is the backup.
- **Storage.** One Workers KV key, `guests`, holds compact JSON: `{code: {label, label_dev, lang, side, ev[], max}}`.
  - No phone numbers.
  - Published from the Sheet menu **Wedding → Publish guest list**, via the Cloudflare API with a KV-only token.
  - `npm run guests:push` is the backup.
  - The guest list never goes into the repo or `dist`.
- **Edge.** `functions/index.ts` normalises `?g=`, reads KV (cached), then uses `HTMLRewriter` on the static page to:
  - put the family's name in;
  - remove the events they aren't invited to (chapters, RSVP rows, tokens);
  - pre-select their language;
  - prefill or restore the RSVP state;
  - set the side's `wa.me` number and the calendar link for their device;
  - embed a small guest JSON.

  If anything fails, it returns the generic page. Headers are `Cache-Control: private, no-store`, `X-Robots-Tag` and `Referrer-Policy: no-referrer`.
- **No code or a bad code.** A generic greeting and all public events. The RSVP section says "reply to the WhatsApp message that brought you here", with no form and no name search. A bad code adds one quiet line and otherwise gives an identical response.

## RSVP → Google Sheet
- **Browser:** posts to the same-origin `POST /api/rsvp`. The akshata toss starts on tap, with an 8s timeout and one retry.
  - **On failure:** the WhatsApp button appears automatically with a pre-filled message (family, code, per-event counts, name, note). The pending reply is kept for a quiet retry on the next visit.
  - **After sending:** a thank-you card with "Change my reply". On a revisit it opens in the replied state.
  - **No JS:** a normal form POST, followed by a 303 redirect.
  - **Fix the prototype's "6 guests" total:** show per-event counts instead.
- **Function (`server/rsvp.ts`)**, in order:
  1. 4 KB body limit.
  2. Honeypot, and a minimum time since the form was shown.
  3. Code check against KV.
  4. Deadline plus grace.
  5. Clamp counts to invited events and `max`; trim the text.
  6. Idempotent `rid`.
  7. Save to KV at `r:<code>`.
  8. Forward in the background with `ctx.waitUntil` to Apps Script as `text/plain` with a secret. A failure writes `fail:<code>`, and `npm run rsvp:resync` resends.
- **`apps-script/Code.gs`:**
  - `doPost` with `LockService` checks the secret and code, then appends to `RSVP log`.
  - It updates the guest's row in `RSVP` in place and ignores any reply older than the saved `rev`.
  - The `onOpen` menu has Generate codes, Publish guest list and Clear test replies.
  - Re-deploy with "New version", so the URL never changes.
- **Guard rail:** a free Cloudflare WAF rate-limit rule on `POST /api/rsvp`.

## Calendar, music, invitation screen, preview
- **Calendar.**
  - Build-time static files: `src/pages/cal/[file].ics.ts` produces `/cal/haldi.ics` etc., in UTC with `VALARM -P1D`, `SEQUENCE`, the dress code and "times in IST".
  - The edge serves `.ics` to Apple devices and the Google Calendar template link to others.
  - Reuse the prototype's `CAL`, `gcal()` and `downloadIcs()` logic in `lib/ics.ts`.
- **Music (the couple's file).**
  - `npm run audio -- input.wav` (ffmpeg-static): loudness-normalised, fades baked in, AAC `.m4a` ≤1 MB, `+faststart`.
  - `<audio preload="none">`. `play()` is the first line of the cover tap handler.
  - Pauses when the tab is hidden, and remembers a mute.
  - **Mute control:** a round kajal bell button with a zari ring at the top right, as on the canvas. It appears after the cover opens, with a 3s hint.
  - **Licence check:** their own recording of a film or label song still needs a licence. Traditional or original material is fine.
- **Invitation screen.**
  - A new `#invite` section between the meeting and the schedule.
  - The EN / मराठी / हिंदी switch is a CSS radio group: no history entries, works without JS.
  - Panels are rendered from the data blocks with the right `lang`. Devanagari is never split into letters.
  - An elder checks the wording.
- **Preview, meta and headers.**
  - `SeoHead.astro` comes first in `<head>` with the OG tags, `og:url` as the plain domain, `og:image` as `/og/og.jpg?v=N`, noindex robots meta, `color-scheme: only light` and icons.
  - `scripts/og.mjs` renders `og.astro` at 1200×630 with Playwright into a JPEG ≤280 KB. The medallion and names sit in the centre square.
  - `public/_headers` sets `X-Robots-Tag`, `Referrer-Policy`, `nosniff`, `X-Frame-Options`, and immutable caching for `/_astro/*` and `/audio/*`. `/cal/*` is served as `text/calendar`. No robots.txt block, no sitemap.

## Performance
- **Budget:** first view ≤300 KB compressed (estimate ~190 KB); JS on a phone ≤75 KB; total ≤3 MB; audio ≤1 MB, loaded on tap.
- **Fonts:** subset from the rendered page's text (`scripts/fonts-collect.mjs`), then `pyftsubset --layout-features='*' --flavor=woff2`. Preload only the three cover faces. A glyph screenshot test compares subset and full fonts.
- **CSS and art:** inline CSS; art built at build time. Only the cover toran, twinkles and bursts are made at runtime. Half the particles on low-memory devices. A **Gentle motion / कम हलचल** switch, and the system Reduce Motion setting is respected.
- **Check:** `scripts/budget.mjs` fails the build when:
  - a size limit is broken;
  - an OG tag is missing or late in the page;
  - `og.jpg` is the wrong size;
  - any `wa.me/<digits>`, CSV or guest JSON, robots Disallow or sitemap is in `dist`;
  - any `todo` is left under `STRICT`.

## Verification
- **Local stack.** Playwright (`@playwright/test@1.56.1`, Chromium at `/opt/pw-browsers`), running against `wrangler pages dev dist`. It uses local KV seeded from `tests/fixtures/guests.json` and `tests/mock-sheet.mjs` in place of Apps Script. The clock is fixed and the art uses a seeded random generator.
- **Specs:**

| Spec | What it checks |
|---|---|
| `visual` | The four viewports × reduced motion and gentle; every section and every RSVP state |
| `motion` | Trigger count equals the baseline; every trigger's progress changes; no console errors; cover and meeting frame captures |
| `guest` | Guest-code variants: none, bad, 1–3 events, a Devanagari label, a long label, language preselect, the `#rsvp` deep link |
| `rsvp` | Happy path, change, retry idempotency, abort → WhatsApp fallback, honeypot, clamping, closed state |
| `nojs` | Page readable, form works, calendar links |
| `a11y` | axe, `lang` attributes, 48px targets, 18px body text, no sideways scroll, history length 1 |
| `seo` | Same OG for every guest, headers, `og.jpg`, `.ics` content (12:00 IST = 06:30Z) |
| `perf` | Throttled 6 Mbps / 85 ms / CPU×4: LCP ≤2.5s, CLS ≤0.05, tap response <200ms |
| `glyphs` | Subset font renders the same as the full font |
| `unit` | Normalising codes, clamping counts, building `.ics`, IST→UTC, the personalise rewriter |

- **Music in tests:** stub `play()` and check it's called synchronously inside the tap.
- **Manual.** Run on the preview URL, then on production:
  - **Devices and networks:** a mid-range Android on Chrome and Samsung Internet (including its dark mode), on Jio and Airtel; an iPhone on Safari.
  - **Checks:** the WhatsApp preview when you send the link to yourself; the cover tap and music; mute and switching apps; the pinned scene forwards and back; the sticky curtain; RSVP, including airplane mode; Maps; the calendar alarm; reduce motion and gentle; an elder reading the Marathi and Hindi.

## Timeline and what the family supplies

| Dates | Milestone | Build | Family supplies (by date) |
|---|---|---|---|
| 28–30 Sep | **M0** | Scaffold, golden baseline, verbatim port, first `pages.dev` deploy | Buy the `.in` domain and point its nameservers to Cloudflare (29 Sep). Cloudflare account (29 Sep). Family Google account and the Sheet from the template (30 Sep). |
| 1–4 Oct | **M1** | Art at build time, `wedding.ts`, CSS and motion modules, no-JS pass, custom domain | Confirm the venue name and timings (4 Oct) |
| 5–11 Oct | **M2** | Edge personalisation, KV, RSVP API and Apps Script, WhatsApp fallback, `.ics`, invitation screen, music and bell, gentle switch, headers, rate limit | By 10 Oct: **audio file**, RSVP deadline, WhatsApp numbers for each side, Maps pin, parents' names ×3 languages, inviters, बाल मनुहार. By 12 Oct: kuladaivat and tithi. |
| 12–18 Oct | **M3** | Content in, font subsets, OG image and icons, art polish, performance and a11y, full suite green | Guest list v1 (14 Oct), codes generated (15 Oct), elder review of the wording (16 Oct) |
| 19–21 Oct | **M4** | Dry run with 5 test families on real phones | Senders take part |
| 22–24 Oct | Freeze | Fix, clear test replies, final publish | Final guest list (24 Oct) |
| 26 Oct | Go / no-go | `STRICT=1` green, preview checked, RSVP → Sheet in a minute, fallback, calendar, music | – |
| 27 Oct–10 Nov | **Invites out** | Three batches from saved family numbers | – |
| 20 Nov / 25 Nov | Reminder / RSVPs close | Reminder links to non-responders; headcount to the caterer | – |
| After 10 Dec | Thank-you mode | – | – |
| By 31 Dec | Cleanup | Delete the phone column and RSVP tabs, the KV namespaces and the API token; decide keepsake or take down | – |

## Small open decisions (defaults in brackets)
- **RSVP deadline** [Wed 25 Nov]
- **Domain name** [to choose, e.g. shreyansh-mrunalini.in]
- **Prefill RSVP counts** [party size]
- **Music** [play once, not loop, unless the recording is made to loop]
- **Record "link opened"** [off, for privacy]

## Critical files
- `design/prototype/motion-prototype.html`: the source to port. Reuse its functions: `frame`, `ART`, `eventArt`, `medallion`, `peacock`, `riteIcon`, `burst`, `sealPulse`, `tug`, `openCover`, `CAL`/`gcal`/`downloadIcs`, the loops and the matchMedia sections.
- `src/data/wedding.ts`, `functions/index.ts`, `server/personalize.ts`, `functions/api/rsvp.ts`, `apps-script/Code.gs`, `scripts/budget.mjs`, `tests/e2e/*`.

## Build status (27 Sep)

**Built, and tested locally against Cloudflare Pages (wrangler) with a mock Sheet:** M0 to M3 in code. The golden check showed the restructured build pixel-identical to the approved prototype before the intentional changes.

**Measured**
- First view on a phone: 264 KB of 300 (HTML 19, JS 52, cover fonts). JS on a phone: 52 KB of 75. Whole site: about 1 MB.
- Throttled phone (6 Mbps, 85 ms, CPU ×4): LCP about 1.2–1.5 s, CLS 0, tap to next frame about 112 ms.
- Tests: 11 unit and 55 end-to-end (phone and desktop), all passing: guest links, RSVP (send, change, fallback, Sheet down, closed, clamping, idempotency), no-JS, music, SEO and privacy headers, accessibility (axe, lang, 48 px targets, 18 px text, no sideways scroll, history), motion (every trigger moves and finishes; Gentle motion), glyphs, performance, and still frames of every section and RSVP state at four sizes.

**Changes from the plan, and why**
- **Too-fast replies wait instead of vanishing.** The server's "faster than a person" check would have silently dropped a real reply sent from a `#rsvp` reminder link with prefilled counts. It now answers "wait", and the page retries by itself.
- **Fonts:** Latin files stay whole (names can be anything); Devanagari is cut to what each face draws, except Amita Bold, which draws the families' names on the cover. Hints are dropped: phones ignore them and they double the size. The glyph test compares with hinting off, against Google's own files.
- **Calendar choice happens in the browser** (Apple gets the `.ics`, others Google Calendar), not at the edge: same result, one less thing on the server.
- **Gentle motion is the still page**, the same one Reduce Motion gets, and it switches live without a reload.
- Added a 404 page (without one, Cloudflare Pages answers every unknown address with the invitation).
- The motion code is split by section, with fewer files than the list above (the curtain lives with the Mangalashtak; the small touches share one module).
- WhatsApp numbers and the Sheet's address are encrypted Cloudflare secrets, so the repo holds no numbers.

**Still to do (needs the family or their accounts)**
- Content marked `todo()` in `src/data/wedding.ts` (parents' names ×3 languages, kulaswamini, tithi, inviters, बाल मनुहार), the Maps pin, and the audio file.
- Cloudflare account, domain, KV namespace id, secrets; the Google Sheet and its script. Steps in `docs/04-runbook.md`.
- M4: the dry run on real phones with test families.
