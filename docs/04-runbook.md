# 04 · Runbook: running the invitation

For whoever sets the site up (a developer, once) and for the family members who send invitations and read replies. The build plan is in [03-build-plan.md](03-build-plan.md).

## What lives where

| Piece | Where | Who touches it |
|---|---|---|
| Every word on the page | `src/data/wedding.ts`; the Marathi and Hindi pages in `src/data/i18n.ts` (and `mr`, `hi` in `tours.json`) | Developer, with the family's wording |
| The guest list, phone numbers, replies | The family's Google Sheet | Family |
| Who is invited to what (no phone numbers) | Cloudflare KV key `guests`, published from the Sheet | Sheet menu |
| Each family's latest reply | Cloudflare KV `r:<code>`, copied to the Sheet | The site |
| The site | Cloudflare Workers, built from this repo | Developer |

The guest list never goes into this repository. Keep exports in `private/`, which git ignores.

## One-time setup (developer)

### 1. Cloudflare Workers and ranchiwedspune.in
The site runs as a Cloudflare Worker with static assets (the free plan is plenty). Already done from the repo: the KV store `ranchiwedspune-guests` exists and its id is in `wrangler.toml`; the site's address is `https://ranchiwedspune.in`; Node 22 comes from `.node-version`.

1. **Move the domain's DNS to Cloudflare** (the domain stays registered at GoDaddy). *Done 28 Sep.*
   - Cloudflare → **Domains → Onboard a domain** → `ranchiwedspune.in` → **Free**; no records needed; Cloudflare shows two nameservers.
   - GoDaddy → **ranchiwedspune.in → DNS → Nameservers → Change → I'll use my own** → the two Cloudflare nameservers.
   - Cloudflare emails when the domain is active: usually within an hour, sometimes up to a day.
2. **Connect the repository.** Cloudflare → **Workers & Pages → Create → Continue with GitHub** → allow the Cloudflare app on `shreyshreyansh/my-wedding` → select it → **Next**, then:
   - Project name `my-wedding` (it must match `name` in `wrangler.toml`, or the build fails).
   - Build command `npm run build`; deploy command `npx wrangler deploy` (the default); preview command as it is. **Deploy.**
   - Production branch: the Worker → **Settings → Build → Branch control** → `main` (a new Worker takes whatever was the repo's default branch when it was created); untick preview builds there so other branches don't publish.
   - The site is then live at `my-wedding.<your subdomain>.workers.dev`.
3. **Attach the domain** once it is active: the Worker → **Settings → Domains & Routes → Add → Custom domain** → `ranchiwedspune.in`, then again for `www.ranchiwedspune.in`. Cloudflare creates the DNS records and certificates.
4. **Secrets**, once the Sheet exists (step 2 below): the Worker → **Settings → Variables and Secrets → Add**, type **Secret**: `APPS_SCRIPT_URL`, `APPS_SCRIPT_SECRET` (any long random string; the same goes in the Sheet), `WA_BRIDE` and `WA_GROOM` (digits with country code, e.g. `919812345678`). Secrets take effect at once and survive later deploys. Until then, replies are kept in KV and marked for `npm run rsvp:resync`, and the WhatsApp button lets the guest pick the contact.
5. Optional, the domain → **Security → WAF → Rate limiting rules** (the free plan has one): URI path equals `/api/rsvp`, method POST, 10 requests per 10 seconds per IP, block for 10 seconds.

Every push to `main` redeploys the site in about two minutes. **Retry build** in the dashboard re-runs the same commit on the same branch; after changing a setting, push a commit to `main` instead.

### 2. The Google Sheet
1. With the family's Google account, create a new Sheet. **Extensions → Apps Script**, paste `apps-script/Code.gs`, save.
2. **Project settings → Script properties**:
   - `SECRET`: the same string as `APPS_SCRIPT_SECRET`.
   - `SITE_URL`: `https://ranchiwedspune.in`.
   - `CF_ACCOUNT_ID`, `CF_NAMESPACE_ID` (the GUESTS id), `CF_API_TOKEN`: a Cloudflare API token with only **Account → Workers KV Storage → Edit**.
3. **Deploy → New deployment → Web app**: execute as **Me**, access **Anyone**. Copy the `/exec` URL into the `APPS_SCRIPT_URL` secret.
   - After editing the script later, use **Manage deployments → Edit → New version**, so the URL stays the same.
4. Reload the Sheet. A **Wedding** menu appears. Run **Wedding → Set up the tabs** (it asks for permission the first time).

### 3. Check it end to end
1. Add a Guests row with `test` = `yes`, generate its code, publish (see below).
2. Open its link on your phone, reply, and check the RSVP tab within a minute.
3. **Wedding → Clear test replies** afterwards.

## Content still to fill in

Placeholders show on the page as `⟦…⟧`. Search `todo(` in `src/data/wedding.ts`. Today they are:
- Parents' names for both families, in English, Marathi and Hindi.
- The kulaswamini (Marathi card), the tithi and शके date (from the purohit).
- The inviters (Marathi), the family members (Hindi दर्शनाभिलाषी) and the English sign-off.
- बाल मनुहार: the relation (e.g. चाचा) and the child's name.

An elder should read all three cards, and the Marathi and Hindi pages (`?lang=mr`, `?lang=hi`), before invitations go out. Before launch, build with `STRICT=1 npm run build`: it fails while any placeholder is left.

Also confirm in `wedding.ts`: the exact Google Maps pin (`venue.maps`), the RSVP deadline (`rsvp.deadline`, default Wed 25 Nov), event times.

## Music

The background music is `public/audio/invite.m4a`. It starts when the guest taps the seal (phones allow sound only after a tap) and plays on a loop. The bell at the top right stays on screen all the way down: tap it to mute or play. A mute is remembered on that phone, and the music pauses while the guest is in another app. On an iPhone it plays the way a video does, so it is heard even with the phone set to silent (tapping the bell is the way to quiet it).

To change it:
1. Make sure the recording is yours to use: a film or label song needs a licence even if you sang it; traditional verses sung by the family are fine.
2. `npm i --no-save ffmpeg-static` once (or install ffmpeg), then `npm run audio -- song.mp3` (add a length in seconds to cut it shorter, e.g. `90`). It trims silence from both ends, so the loop has no gap, evens the loudness, and writes `public/audio/invite.m4a`, at most 1 MB.
3. In `wedding.ts`, bump the `v` in `music.src` (`/audio/invite.m4a?v=2`), so phones fetch the new file. Optionally set `title` and `credit` (shown small in the footer). `loop: false` plays it once. `src: null` removes the music and the bell.

## The guest list (family)

One row per family in the **Guests** tab:

| Column | What to write |
|---|---|
| `family` | How they are greeted: `the Sharma family`, `Nitin mama and family` |
| `family_dev` | The same in Devanagari, shown to Marathi and Hindi families: `शर्मा परिवार` |
| `lang` | `en`, `mr` or `hi`: the language their invitation card opens in |
| `side` | `bride` or `groom`: whose WhatsApp number replies go to |
| `inv_haldi`, `inv_sangeet`, `inv_shaadi` | Tick the events they are invited to |
| `party` | How many people the invitation is for; the RSVP starts at this number |
| `max` | Leave empty, or the most they may bring per event if more than `party` |
| `phone` | Their WhatsApp number with country code: `919812345678`. Stays in the Sheet only |
| `sender` | Who sends it (Mummy, Papa, Mrunalini…) |
| `test` | `yes` for rehearsal rows |

Then:
1. **Wedding → Generate missing codes.** A code is written once and never changes; don't edit codes of invitations already sent.
2. **Wedding → Publish guest list.** Links work within a minute. Publish again after any change (a new family, a changed event).
3. To send: open the Sheet on the sender's phone, tap **Send ↗** in the family's row. WhatsApp opens with the message written; send it from your own number. Note the date in `sent_on`.
   - Send in batches (for example 30 a day), from the family's own phones, to people who have your number saved. Bulk tools get numbers banned.
   - The messages are in the **Templates** tab; edit the wording there.

The backup to the menu, from a CSV export of the Guests tab: `npm run codes -- private/guests.csv` and `npm run guests:push -- private/guests.csv`.

## Replies (family)

- **RSVP** tab: one row per family, their latest answer. **RSVP log**: every reply as it arrived. **Totals**: guests per event.
- A family can change their reply until the deadline; the newer answer replaces the older one.
- If sending fails on their phone, the page offers WhatsApp with the reply already written; it arrives on the side's number (`WA_BRIDE` / `WA_GROOM`). Enter those by hand in the RSVP tab.
- After the deadline the form closes and shows a WhatsApp button instead. A reply already on its way (a slow connection, a retry) is still accepted for three more days.
- Reminders (around 20 Nov): send non-responders their link with `#rsvp` on the end, e.g. `https://…/?g=abc234#rsvp`; it opens straight at the RSVP.

## Greeting a person by name

Add `name=` to any link and the page speaks to that person: their name on the cover, "Rahul, you are invited", "Will you join us, Rahul?", the RSVP's name box filled in, and "Thank you, Rahul!".
- On its own: `https://ranchiwedspune.in/?name=Rahul`. They see every event, and the RSVP points them to WhatsApp (there is no code to reply with).
- With a family's code: `https://ranchiwedspune.in/?g=abc234&name=Anjali`. Anjali is greeted by name; the events and the RSVP are her family's.
- Spaces work as `%20` or `+` (`?name=Rahul+Kumar`); Devanagari works too (`?name=राहुल`). Only letters, spaces and . ' - & are kept, up to 40 characters, and a lower-case first letter becomes a capital.
- Without `name=`, or with nothing usable in it, the page reads as before. The link preview on WhatsApp is the same for everyone and never shows the name.

## The page in one language

Add `lang=` to any link and the whole page is in that language: `lang=mr` (मराठी), `lang=hi` (हिंदी) or `lang=en` (English only).
- `https://ranchiwedspune.in/?g=abc234&lang=mr`: the family's own invitation, in Marathi. It works with `name=` too.
- Without `lang=`, or with anything else in it, the page is as it has always been: English with Devanagari beside it.
- Translated: every heading, the stories under the paintings, the dates, the RSVP and its thank-you, the footer. Not translated: the holy lines (the invocations, the mangalashtak, the Pali verses, the chaupai), the couple's names and the art credits. The invitation card opens in the link's language; the three cards are still there to switch between.
- A reply sent from any language reaches the Sheet the same way, and the WhatsApp fallback message is always in English, so it reads the same to whoever enters it.
- The Marathi and Hindi wording is in `src/data/i18n.ts` and the `mr` / `hi` lines in `src/data/tours.json`. An elder should read them before the links go out. After changing them: `npm run build && npm run fonts && npm run build`.

## When something goes wrong

| Problem | What to do |
|---|---|
| Replies aren't reaching the Sheet | The site keeps every reply. Fix the script (check its deployment and the secret), then run `npm run rsvp:resync` (needs `CF_*`, `APPS_SCRIPT_URL` and `APPS_SCRIPT_SECRET` in `.dev.vars`). |
| A family says their link shows "our family and friends" | Their code is wrong or not published. Check the row, **Publish guest list**, resend the link. |
| A family should see another event | Tick it in Guests, **Publish guest list**. No need to resend. |
| An event's time or place changes | Edit `wedding.ts`, bump `site.calendarSequence`, push. Saved calendar entries update when reopened. Tell guests on WhatsApp too. |
| The WhatsApp preview looks old | Change the card, `npm run og`, bump `site.ogVersion`, push. WhatsApp caches previews for a while. |
| Motion makes someone uncomfortable | Turning on Reduce Motion on their phone (Settings › Accessibility) gives them the still page automatically. |

## For the developer

```sh
npm run build          # build + budget check (sizes, preview tags, nothing private in dist)
npm run dev:edge       # the whole site locally (Worker + static files) on :8788 (seed KV: npm run guests:push -- file.csv --local)
npm test               # builds, then runs everything against the Worker locally (wrangler dev) and a mock Sheet
npm run test:unit
npx playwright test visual --update-snapshots   # after an intended visual change; look at tests/__golden__ before committing
npm run fonts          # after changing text: re-cut the fonts to the page (needs Python: pip install fonttools brotli)
npm run og             # re-shoot the link preview and icons
npm run art            # re-cut the paintings and textiles in src/data/art.json (see 05-art-sources.md)
```

The tests need nothing online except `npm run fonts` (it downloads the fonts once).

## Go / no-go (26 Oct)
- [ ] `STRICT=1 npm run build` passes: no placeholders left.
- [ ] Elder has read the English, Marathi and Hindi cards, and the `?lang=mr` and `?lang=hi` pages.
- [ ] Test family: link preview on WhatsApp, cover tap and music, RSVP reaches the Sheet in a minute, WhatsApp fallback (reply in airplane mode), calendar on an iPhone and an Android, Maps pin.
- [ ] Mid-range Android on Jio and Airtel; an iPhone on Safari; Samsung Internet (with its dark mode).
- [ ] Test replies cleared; the final guest list published.

## After the wedding
- By 31 Dec: delete the `phone` column and the RSVP tabs (or the whole Sheet), the KV namespace and the API token.
- Then either take the site down or keep it as a keepsake without the RSVP.
