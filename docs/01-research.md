# Phase 1 — Research brief

**Brief:** a responsive wedding invitation website. It should feel earthy and rooted in culture and in both hometowns: the bride's **Pune (Maharashtra)** and the groom's **Ranchi (Bihar / Jharkhand)**.

**References:**
- [Meenaya](https://www.missingpieceinvites.com/demos/meenaya) (Missing Piece)
- [City-3](https://www.missingpieceinvites.com/demos/city-3) (Missing Piece)
- [Vijay & Rashmika, Temple Theme](https://myshaadhilink.in/invitation/vijay-rashmika-wedding-invitation?to=Guest&demo=true) (MyShaadhi Link)
- The web-design skills in [MengTo/Skills](https://github.com/MengTo/Skills/tree/main/agent-skills/web-design), studied for how the site should move.

Status: second pass. The references have been studied from their page code and artwork. Still needed: the couple's own notes on what they like, their assets, and answers to the open questions at the end.

---

## 1. The references

### How we studied them
All three demos load from our build environment. Content, artwork, fonts, colours and motion settings were read from each page's code and files.

**Not yet seen:** the pages actually moving in a browser. The browser setup for this was blocked by the environment's safety check, so motion is documented from code, not from watching it.

**Rule:** all three are commercial products. We borrow structure, features and motion ideas, **never their artwork, code or copy**.

### Missing Piece: Meenaya and City-3 (Framer, ₹3,999)
Both are **one template with different artwork**: identical sections, fonts, music and features. The whole page is one long scroll, about 13,000px on desktop and 14,000px on a phone.

**Section order** (our baseline):
1. Hero with names.
2. "ॐ श्री गणेशाय नम" and blessings from grandparents.
3. The invite line, naming the couple and parents.
4. Event cards (date, venue, time, **See the route**), then a map.
5. "Meet the bride and groom", a personal note.
6. **RSVP**: one button that opens a WhatsApp chat.
7. **Things to know**: hashtag, weather, where to put up staff, parking.
8. Instagram.
9. **Countdown**.
10. Closing note.

**Fonts:** Cormorant (serif display), Manrope (sans) and Gotu (Devanagari). **Music:** background music with a play button.

**Artwork:**
- **Meenaya** (Tamil): an oil-paint blue sky with floating pink sky lanterns, and a colourful temple tower rising from the bottom.
- **City-3** (Rajasthani): a starry indigo night over a lamp-lit palace courtyard; **one painting per event**, all in the same gold-ochre miniature style with blank faces; sky backdrops in several moods (night, pink sunset, dusk blue); a Mughal-garden flower strip with a peacock; gold and silver frames for photos.

**Demo slips:** the invocation drops the visarga (नम instead of नमः), and the countdown sits at 00:00:00:00 because the demo dates have passed.

**Takeaway:** **one painted style carried through the whole page, with a painting per event.** For us that style is Warli / Khovar / Kohbar.

### MyShaadhi Link: "Temple Theme" (Next.js, ₹3,999)
A different product. It is richer in features and more physical in feel.

**Page order:**
1. A **cover card** ("The Wedding of … · Open Invitation") that guests tap to open.
2. || Shree Ganeshay Namah ||, then the **names appear one letter at a time**.
3. The couple, with both sets of parents.
4. A **countdown carved into a wooden wall with elephant pillars** ("Our Muhurtham in").
5. "**The Wedding Journey**: function to function, to the sacred hour", the event timeline.
6. An "Our Story" video in a carved frame.
7. A "Before the Vows" gallery under a ceremonial umbrella.
8. An **RSVP form** on the page (attending / not attending).
9. A closing blessing in Telugu, **శుభమస్తు**.

**Ideas worth taking:**
- **`?to=<name>` personal links.** The guest's name travels in the URL and is used on the page.
- **Ritual objects as event icons**: a haldi bowl, a mehendi cone, a nadaswaram and drum.
- **Everyday parts look like real objects.** The countdown is carved wood and the gallery sits under a ceremonial umbrella.
- **The music button is a temple bell.**
- **Each section can be switched on or off**, including livestream, video and gallery.
- **The closing blessing is in the regional language.**

**Palette:** parchment `#fbeeb8`, maroon `#9a1b41`, gold `#c9932f`, dark brown ink `#2b1608`, leaf green `#3f4a26`. **Fonts:** Cormorant Garamond, Marcellus, Cinzel, and Great Vibes (a script).

### What all three share, and what we add
**The shared baseline:** Ganesha invocation → blessings and parents → events with Maps → countdown → RSVP → music with an on/off button → hashtag / Instagram.

**Features in the product listings** (not shown in the demos):
- Different guests can get different sets of events.
- RSVP through WhatsApp or Google Forms.
- An "**elder-friendly**" design.
- Details can be edited after sending, without re-sharing the link.

**How ours differs:** a story that belongs to the two of you (two walls, two cities, one line of track), folk art as the one visual language, and scroll motion with real choreography. The motion is covered in §2.

## 2. Motion: smooth, Apple-like scroll

**The brief:** motion as you scroll, smooth and polished like Apple's product pages.

### What the references actually do
All of this was read from their code, not watched: exact timings and easing curves, with nothing guessed.

| | Missing Piece (Framer) | MyShaadhi Link (GSAP + Lenis) |
|---|---|---|
| **Smooth scroll** | Lenis on Meenaya only (a 1s glide on the mouse wheel). City-3 uses normal scrolling. | Lenis (1.18s, ease-out). |
| **On phones** | Normal native touch scrolling (smoothing is off for touch). | Same. |
| **Opening** | No cover. Everything rises together on page load on very long, soft springs (5–6s, 90% there by about 2s). The lanterns tilt and settle like they're floating. | **Tap-to-open cover**, a 1.5s timeline: the text lifts away, a warm glow blooms, the card zooms past, the veil fades, *then* the music starts. |
| **Names** | Three lines rise 400–600px with a tilt and settle. | **Letter by letter**: each letter rises 40px out of an 8px blur, 50ms apart, with a small overshoot. |
| **Scroll reveals** | **None** on content; sections are static. | Every block fades and rises 22–36px **once**, as it crosses 75–90% of the screen height. 0.8–1s, `power3.out`, 90–120ms apart. |
| **Parallax** | **Whole-page parallax**: the lanterns move at 30–70% of scroll speed, which creates depth. | The hero video drifts and slowly zooms. Gallery photos shift ±3.5% inside their frames. The umbrella travels down its section. |
| **Scroll-controlled / pinned** | A "**curtain hand-off**": each section's main button stays pinned for about 700px while the next section slides over it, with artwork (a car, a ship) hanging over the seam. City-3's **ship sails in, tied to scroll**. That's the only truly scroll-controlled element in either product. | No pinning. A "**focus band**": the event nearest the middle of the screen is sharp while the others shrink (scale .94) and fade (.38). The page leans up to 2.5° during fast scrolls. Footprints appear along a winding path. |
| **Background loops** | The music button pulses, ring buttons breathe, the ship rocks 1°, petals fall on a canvas (60 of them, 30 on phones). | Glows breathe (4.6s), birds cross the sky (38–60s), a string of decorations sways ±0.45°, gold specks drift. **All pause off-screen.** |
| **Countdown** | Plain text that changes once a minute. | Each changed number drops in (0.38s). |
| **Reduced motion** | Ignored. | Partly respected. |

**Verdict:** neither is really "Apple-like".
- **Missing Piece** feels smooth because of long soft springs and parallax.
- **MyShaadhi Link** feels polished because its entrance reveals are well choreographed.

Apple's signature move is a section that **pins in place while scrolling plays a transformation forwards and back**. That only appears in City-3's ship. **That's the room we have to stand out.**

### The playbook (MengTo web-design skills)
The relevant skills are `animation-systems`, `cinematic-gsap-lenis-motion-system`, `cinematic-scroll-storytelling`, `scroll-scrubbed-visual-sequence`, `scroll-scrubbed-word-reveal`, `scroll-progress-timeline`, `ambient-section-particles`, `falling-leaves`, `scroll-world-storytelling` and `build-awwwards-quality-sites`.

- **Restraint:** one strong hero moment, with everything else supporting it. The main element moves first and the rest follow with a small stagger. No bounce, elastic or big jumps in scale.
- **Stack:** GSAP + ScrollTrigger, plus **one** smooth-scroll engine (Lenis), driven by GSAP's ticker.
- **Pinned, scroll-controlled scenes only for story moments.** Scroll position is the single source of truth; it must work forwards, backwards and with a fast flick. **Never hijack scrolling.**
- **Performance:** animate only `transform` and `opacity`; blur only small things; pause everything off-screen; cap canvas resolution.
- **Reduced motion:** show the final state instantly, with no Lenis, no pinning and no loops. The page must read fine with all motion removed.
- **Artwork warning:** don't use AI- or code-drawn illustrations; use real, licensed or commissioned art. Warli's circles-and-triangles grammar is a reasonable exception for patterns and small figures. Madhubani and Khovar are not (see the illustration research).

### Draft motion tokens for us
| Token | Value |
|---|---|
| Smooth scroll | Lenis on **mouse wheel only** (~1.1s glide); native touch scrolling on phones, as both references do |
| Entrance | rise 24–36px + fade, 0.9s, `power3.out` (CSS `cubic-bezier(.22,1,.36,1)`), trigger at 82% of screen height, **once** |
| Text | **by word**, 50ms apart, 6–8px blur to sharp |
| Scroll-controlled scenes | linear (`ease: none`), `scrub: 1–1.4` for a slight trailing lag |
| Parallax | backgrounds at 30–70% of scroll speed, or a ±3–12% drift |
| Background loops | `sine.inOut`, 4–60s, paused off-screen |
| Taps and hovers | 0.18–0.22s |
| Cover exit | ~1.5s timeline; the music starts from the tap |

**Devanagari rule: never split Hindi or Marathi text into letters.** Wrapping single characters in separate animated elements breaks conjuncts (न्द) and vowel signs (ि), which then render wrongly. Animate Devanagari **by word**. Letter-by-letter is safe only for Latin names.

### Where the motion goes (proposal, to settle in design)
1. **Antarpat opening (tap).** The cloth drops, akshata rains down, and the music starts from the same tap. This is MyShaadhi Link's cover pattern, made ours.
2. **Hero.** A layered folk scene with gentle parallax; names rise by word.
3. **"Two walls meet": the Apple moment.** Pinned and controlled by scroll. The Warli wall slides in from one side and Khovar/Kohbar from the other; they join into the Lagna Chowk with the couple at the centre. It plays in reverse when you scroll back up. The chowk itself is commissioned artwork and is revealed with care (see §9).
4. **Mangalashtak.** A verse lights up word by word as you scroll, landing on **"शुभमंगल सावधान"**.
5. **Events as the Pune → Hatia line.** A track fills as you scroll and a train moves along it. The current "station" is in focus while the others recede (MyShaadhi Link's focus band).
6. **Background.** Palash petals or sal leaves tumble down (the `falling-leaves` technique) in one or two sections, not the whole page.
7. **Everything else** (countdown, RSVP, travel) gets calm, once-only reveals. Borrow Missing Piece's **curtain hand-off** between chapters, with artwork hanging over each seam.

**Phones:** native touch scrolling; shorter pinned scenes; half the particles; everything pauses off-screen. Test on a real ₹10k Android before calling it done.

## 3. Cultural core

### Her side: Pune, Maharashtra

| Layer | Material |
|---|---|
| Folk art | **Warli**, the Adivasi painting of Maharashtra: white rice paste on red-ochre (geru) mud walls, built from circles, triangles and lines. Its best-known form is the **Lagna Chowk**, the *wedding square* painted by married women for a marriage, with the goddess Palaghata blessing the couple at its centre. **Warli began as wedding art.** |
| Textile | **Paithani**: peacock (*mor*, *bangdi mor*), lotus (*kamal*), the coconut **narali border**, parrots (*tota-maina*), *asawalli* vine. Deep jewel colours with gold zari. |
| City | Shaniwar Wada (Peshwa seat, 1732) and its gates · Dagdusheth Halwai Ganpati (Pune is *the* Ganpati city) · Sinhagad fort · Parvati hill. |
| Wedding rituals | Sakharpuda (sugar for the engagement) · Halad (haldi) · **Mundavalya** (pearl strings on the forehead) · **Antarpat** (cloth held between the couple and dropped at the end of the Mangalashtak) · **Mangalashtak**, whose every verse ends in **"शुभमंगल सावधान"** · Akshata (rice showered on the couple) · Saptapadi · Kanyadaan. |
| Food | Puran poli, modak, misal, Chitale bakarwadi. |

### His side: Ranchi (Jharkhand, historically Bihar)

| Layer | Material |
|---|---|
| Folk art | **Khovar**, from Hazaribagh near Ranchi: *kho* (chamber) + *vara* (bridal couple). Mud walls are painted in the **marriage season** by coating black earth with white earth and **comb-scraping** patterns through it. The sister art **Sohrai** is for the harvest; they share a GI tag (2020). **Madhubani Kohbar**, from Mithila in Bihar, is the painted **wedding chamber**: lotus (bride), bamboo (groom's line), **pair of fish** (fertility and a good match), sun and moon. **Both are wedding art too.** |
| Flora | **Palash** (flame-of-the-forest), Jharkhand's state flower, flame orange · **Sal**, the state tree; its leaves are the traditional wedding-feast plates (*pattal*, *dona*) · Koel, the state bird. |
| City | **Pahari Mandir** (Shiva temple on a hill in the city centre) · Hundru Falls on the Subarnarekha river (Ranchi is "the city of waterfalls") · Tagore Hill. |
| Wedding rituals | **Tilak** (bride's brother visits the groom) · **Matkor** (women fetch sacred **earth** from a riverbank to build the wedding hearth, literally "earthy") · Haldi · **Sindoor daan** with shankh, shehnai and dhol · **Chumawan** (married women touch the couple with **uncooked rice**, to Bhojpuri songs) · **Kohbar ghar**. |
| Food | Litti chokha, thekua, khaja, dhuska. |

### The threads that tie the two together

These are the strongest findings, and they give the site its story:

1. **Both sides paint mud walls for weddings.** Warli's Lagna Chowk and Khovar/Kohbar are both painted by women to bless a marriage. The site can literally be *two wedding walls meeting*.
2. **Rice blesses the couple on both sides:** Maharashtrian *akshata* and Bihari *chumawan*. It's a natural shared animation, a shower of rice grains.
3. **One script, both languages.** Marathi and Hindi are both written in **Devanagari**, so a bilingual site needs only one set of fonts. There are even companion typefaces, *Tiro Devanagari Marathi* and *Tiro Devanagari Hindi*, that respect each language's letterforms.
4. **Ganesha opens both.** "॥ श्री गणेशाय नमः ॥" heads invitations on both sides, and Pune is the Ganpati city.
5. **A real line between the two cities.** Train **22845 / 22846, the Pune–Hatia Superfast Express**, runs about 1,769 km from Pune Jn to Hatia (Ranchi). That's a charming spine for "two cities" storytelling.

## 4. Design directions (to pick or mix in Phase 2)

**A. "Lagna Chowk × Kohbar": folk walls** *(most earthy)*
The page is a painted mud wall. Warli figures in white lines on geru for her side, Khovar comb-cut and Kohbar motifs for his, meeting in a shared wedding square. Warli's geometric grammar suits code-drawn SVG, so figures can **draw themselves, dance in the tarpa circle, and respond to scroll** without heavy image files.

**B. "22845: Pune → Hatia": city journey** *(most "city")*
Scrolling is a journey from Shaniwar Wada to Pahari Mandir. Each "station" is a chapter: her city, his city, how they met, the events, the venue. Playful, story-driven, and a great way to include food and inside jokes.

**C. "Paithani & Palash": textile luxe** *(most elegant, elder-favourite)*
Narali and lotus borders frame each section, with peacocks, palash sprays and sal leaves. Deeper jewel-earth tones and gold. The closest to a classic printed card, made digital.

**Recommendation: A as the visual language, B as the story spine, C for borders and accents.**
Everything is drawn in one folk line style, including the city landmarks. Paithani borders and palash flowers add richness. One coherent look instead of a collage.

**Signature opening, recommended: the Antarpat.** The site opens on a cloth curtain, the one held between the couple. Guests tap **"शुभमंगल सावधान"**, the curtain drops, and akshata rains down to reveal the couple. Only a Maharashtrian wedding has this moment, and the rice shower brings in the Bihari chumawan too.

## 5. Palette draft: colours named after ritual materials

Final values will be set in Phase 2 and checked for contrast.

| Name | Material | Hex (draft) |
|---|---|---|
| Geru | red-ochre wall wash (Warli) | `#9C4A2F` |
| Mitti | raw mud / clay | `#C79A6B` |
| Chuna | rice paste / white earth | `#F5EFE3` |
| Kajal | black earth (Khovar), lamp-black | `#2B211B` |
| Haldi | turmeric | `#D99A1E` |
| Sindoor | vermilion | `#B3261E` |
| Palash | Jharkhand's flame flower | `#E2582B` |
| Sal | sal leaf | `#5E6B3A` |
| Mor | Paithani peacock, accent only | `#245B57` |

## 6. Type candidates (all on Google Fonts, all support Devanagari)

- **Devanagari display:** Tiro Devanagari Marathi / Hindi (refined, bookish) · Yatra One (brush, folk) · Rozha One (high-contrast poster).
- **Latin display:** Fraunces (warm, soft serif) paired with a Devanagari face.
- **Body, bilingual:** Mukta or Martel.
- **Handwritten notes:** Kalam (Devanagari and Latin).
- **Elder-friendly rule:** body text at least 18px on mobile, strong contrast, tap targets at least 48px.

## 7. Feature baseline

- **Must:** mobile-first; readable for elders; event cards (time, venue, dress code, **Open in Maps**); RSVP; countdown; **WhatsApp link preview** (image + title); fast on mobile data.
- **Should:**
  - Links per family or guest, which greet them by name and show **only their events**.
  - Add to calendar.
  - Music with a clear mute button.
  - English plus Marathi/Hindi.
- **Could:** our story, gallery, travel and stay guide (two cities, one venue), FAQ, livestream link for faraway family, Instagram hashtag.

## 8. Tech notes (carried into Phase 3)

- A static site: no backend, free hosting (GitHub Pages, Vercel, Netlify or Cloudflare Pages), optional custom domain.
- All wedding details in **one data file**. Editing it and pushing updates the live link, the same "edit after sending" benefit Framer offers.
- **Motion:** GSAP + ScrollTrigger (now fully free) with Lenis smoothing the mouse wheel only; native touch scrolling on phones. Full reduced-motion mode. See §2.
- **Artwork:** code-drawn SVG only for Warli patterns and small figures. Everything else comes from real artwork, commissioned or licensed, in separate layers so it can be animated.
- RSVP through a WhatsApp deep link (zero setup) or a Google Form / Sheet (collects data).
- Images in AVIF/WebP, lazy-loaded; audio loads only when a guest turns it on.

## 9. Artwork: who makes it

This is the biggest production risk, so it gets its own plan.

### What the research found
- **Traditional artists work on paper or cloth**, not digitally. The route is paint → courier → scan at 600 dpi → separate into layers.
- **Khovar on paper is painted with a brush or twig.** The comb-cut texture belongs to the mud walls, so we'd need to scan a real sample for that.
- **Warli is the only one of the three that code can draw well.** Its whole vocabulary is circles, triangles and lines. Madhubani's double outlines and dense hatching, and Khovar's comb texture, look mechanical when generated.
- **The Lagna Chowk is sacred.** The marriage can't happen without it, and it stays covered until the ceremony. **Commission it from a Warli woman artist; don't code-generate it.** Our Antarpat reveal mirrors its ritual unveiling, so a *respectful* reveal fits.
- **Kohbar carries fertility symbolism** and is painted inside the private wedding chamber. **Let the elders decide** whether it belongs in a public hero.
- **No AI artwork.** Studies show AI simplifies Indian cultural elements. It also gives flat single-layer images and can't stay consistent across a set of 6–8 scenes. And these are GI-tagged community art forms, with livelihoods at stake. Stock sites are full of AI knockoffs; about half of Adobe Stock is now AI-generated.

### Where to find artists
| Art form | Where | Typical prices |
|---|---|---|
| **Warli** (Palghar / Dahanu) | **AYUSH** (a Warli-led NGO, takes custom orders), the **Dhavleri group** (women reviving the chowk painting), Memeraki | Small originals ₹1–4k; named artists ₹22k+ |
| **Sohrai-Khovar** (Hazaribagh, ~90 km from Ranchi) | **Sanskriti Museum / Tribal Women Artists Cooperative** (Bulu Imam), **Virasat Trust** (database of ~500 artists), Memeraki | On paper ₹2–3k per piece; a set of 4 ~₹12k |
| **Madhubani / Kohbar** (Mithila) | Memeraki, **Madhubani Art Centre** (Delhi), the Jitwarpur cluster | Apprentice under ₹1.5k; mid-career ₹1.5–5k; named artists ₹10–50k |

**Turnaround:** existing pieces take 1–2 weeks. A custom set of 6–8 pieces takes about 3–6 weeks plus shipping.

### How to commission artwork you can animate
1. **One element per sheet**, or widely spaced: figures, animals, trees, 12–16 ritual objects, a border's straight run plus a corner (so it tiles), and **a blank sheet of the same paper and wash** for background texture.
2. Same paper, pigments and scale across the whole set. Ask for 2–3 poses of key figures.
3. **A written licence** to scan, crop, separate, animate and publish on the site. Under Indian copyright law the artist keeps both the copyright and the right to object to distortion. Show them the animated result before launch.
4. **Credit the artists on the site**, and say "Warli-inspired" for anything drawn in code.

### Recommendation
- **Code-drawn Warli** for dancers, the tarpa circle, the procession, borders and the rice shower. It's the most animatable layer and the cheapest.
- **Commissioned Warli Lagna Chowk**, with the artist also paid to review our code-drawn figures.
- **Groom's side:**
  - **Sohrai-Khovar** is the regional fit for Ranchi. It's mostly animals and plants, so use it for the hero wall, borders and flora, and keep the event scenes in Warli.
  - **Madhubani** if the family is from Mithila. It's narrative, so it can carry the event scenes itself.
- **Ritual-object icons:** one painted sheet, or Warli line drawings. Licensed icons as a stopgap.

| Tier | What you get | Budget | Time |
|---|---|---|---|
| **Low** | Warli in code; buy 2–3 existing small originals with permission to scan; licensed icons | ~₹8–20k | 2–3 weeks |
| **Mid** *(recommended)* | Commissioned Khovar or Madhubani set (hero + 5 sheets + an object sheet), the Warli Lagna Chowk, and cleanup into layers | ~₹35–80k | 4–6 weeks |
| **High** | Award-winning artists, large originals kept as décor at the venue, a professional animator, an artists page | ~₹1.5–3 lakh | 8–12 weeks |

**Timeline implication:** artwork is the long pole. If the invites need to go out by a certain date, the commission has to start **6+ weeks before that**.

## 10. Invitation wording, Mangalashtak and music

Elders read an invite through the conventions of a printed card. Getting these right is what makes the site feel like *their* invitation and not a template.

### Marathi लग्नपत्रिका: the order of a card
1. **Invocation:** ॥ श्री गणेशाय नमः ॥ (or ॥ श्री गजानन प्रसन्न ॥).
2. **Family deity:** one line per deity, e.g. ॥ श्री [कुलदैवत] प्रसन्न ॥ / ॥ श्री कुलस्वामिनी [नाव] प्रसन्न ॥.
3. **Greeting:** सप्रेम नमस्कार वि. वि., then श्री कुलस्वामिनी कृपेने…
4. **The couple:**
   - **चि.** [groom] (श्री. … यांचा ज्येष्ठ सुपुत्र).
   - **चि. सौ. कां.** [bride] (सौ. … व श्री. … यांची सुकन्या).
   - The host family's child is named first.
5. **Muhurta:** ॥ यांचा शुभविवाह ॥, with the tithi and शके date, and the time.
6. **Request:** …सहकुटुंब, सहपरिवार अगत्य उपस्थित राहून वधूवरांस शुभाशीर्वाद द्यावेत ही नम्र विनंती.
7. **Ceremonies**, then the **venue** (विवाह स्थळ).
8. **Inviters:** आपले नम्र / आपले आगमनाभिलाषी / निमंत्रक. Grandparents come first; deceased elders are written **कै.** (or स्व.).
9. **Close:** समस्त [surname] परिवार. Optionally *फक्त आशीर्वाद* ("blessings only, no gifts").

**Name convention:** a man is written as given name + father's name + surname. A married woman takes her husband's name as her middle name.

### Hindi / Bihari शादी कार्ड: the order of a card
1. **Invocations:**
   - ॥ श्री गणेशाय नमः ॥
   - the shloka **वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥**
   - and/or **मङ्गलं भगवान् विष्णुः मङ्गलं गरुडध्वजः। मङ्गलं पुण्डरीकाक्षः मङ्गलायतनो हरिः॥**
   - **Printed cards often misspell both shlokas; ours won't.**
2. **The programme panel**, e.g. तिलक, हल्दी, मटकोर, बारात प्रस्थान, जयमाला, कन्यादान, सिंदूरदान, कोहबर, विदाई.
3. **Opening:** मान्यवर, परमपिता परमेश्वर की असीम अनुकम्पा से…
4. **The couple:**
   - **चि. / आयुष्मान्** [groom], सुपौत्र / सुपुत्र [elders].
   - **संग**.
   - **सौ. कां. / आयुष्मती** [bride], सुपौत्री / सुपुत्री.
   - Deceased elders are written **स्व.**
5. **Request:** …के शुभ विवाह के मांगलिक अवसर पर आप सपरिवार सादर आमंत्रित हैं।
6. **Role blocks:** **दर्शनाभिलाषी** (relatives longing to see you), **स्वागतोत्सुक** (eager to welcome), and **बाल मनुहार**, the children's plea in baby-talk ("मेले चाचा की छादी मे जलूल आना").
7. **Sender:** **विनीत / निवेदक**.

**Traps to avoid:**
- **Never call the bride सौभाग्यवती.** That word is for married women such as mothers and aunts. The bride is सौ. कां. (सौभाग्यकांक्षिणी).
- **गं. भा.** for widows became contested in 2023; many families now write श्रीमती.

**Made for a web invite:**
- *"समयाभाव के कारण निमंत्रण पत्रिका को ही मनुहार की मान्यता प्रदान कर अनुगृहीत करें"*, a traditional line meaning "please accept this card as our personal visit."
- **उत्तराकांक्षी** (literally "awaiting your reply") could label the RSVP. That RSVP use is our own idea, so check it with an elder.

**Regional notes:**
- Bihar and Jharkhand cards may open with **"श्री श्री 108 बाबा बैद्यनाथ एवं माता पार्वती की असीम अनुकम्पा से"** (Deoghar, Jharkhand).
- Maithil families call the invitation **हकार**.
- Ranchi's local language is Nagpuri (Sadri), but Bihari-origin families usually print their cards in standard Hindi.

### Mangalashtak: the verse to reveal as you scroll
**How it works at the ceremony:**
- The antarpat is held between the couple. After each stanza everyone calls **"शुभमंगल सावधान!"** ("auspicious moment, be attentive!") and throws akshata.
- After the last verse the antarpat drops, garlands are exchanged, and the sanai-choughada starts ("वाजवा रे वाजवा").
- **That's exactly the choreography of our opening.**
- The first verse is always the Ashtavinayak invocation and the last is always "तदेव लग्नं…".

**Verse 1: Ashtavinayak.** Five of these eight Ganesha temples are in Pune district, so this is the bride's side:
> स्वस्ति श्री गणनायकं गजमुखं मोरेश्वरं सिद्धिदम्।
> बल्लाळं मुरुडं विनायकमहं चिन्तामणिं थेवरम्॥
> लेण्याद्रिं गिरिजात्मजं सुवरदं विघ्नेश्वरं ओझरम्।
> ग्रामे रांजणनामके गणपतिः कुर्यात् सदा मङ्गलम्॥

**The rivers verse: both families in one line.** It names the **Godavari** (Maharashtra) and the **Gandaki** (Bihar):
> गङ्गा सिन्धु सरस्वती च यमुना गोदावरी नर्मदा
> कावेरी सरयू महेन्द्रतनया चर्मण्वती वेदिका।
> शिप्रा वेत्रवती महासुरनदी ख्याता च या गण्डकी
> पूर्णाः पुण्यजलैः समुद्रसहिताः कुर्वन्तु वो मङ्गलम्॥

**The final verse:**
> तदेव लग्नं सुदिनं तदेव ताराबलं चन्द्रबलं तदेव।
> विद्याबलं दैवबलं तदेव लक्ष्मीपते तेऽङ्घ्रियुगं स्मरामि॥

**The groom's side (Ramcharitmanas, public domain):**
- **मंगल भवन अमंगल हारी। द्रवउ सो दसरथ अजिर बिहारी॥**
- **सीय राममय सब जग जानी। करउँ प्रनाम जोरि जुग पानी॥** Sita's Mithila makes this a lovely Bihari counterpart.

**Reveal rule:** reveal by word (§2), keeping compound words whole. End each verse on ॥ शुभमंगल सावधान ॥ with an akshata burst.

### Music
- **Famous recordings are off-limits without a licence.** That includes Sharda Sinha's vivah geet (Saregama / T-Series), film songs, Bismillah Khan's shehnai and Mangalashtak recordings on YouTube. The copyright exemption for weddings covers the ceremony itself, not a website. The YouTube Audio Library is licensed for videos, not sites.
- **Best free option:** Pixabay Music's shehnai and wedding tracks. They are free with no attribution; keep the licence certificate.
- **Free Music Archive:** check each track's licence (CC BY is fine).
- **Most personal option:** **record a family elder singing the Ashtavinayak verse and "तदेव लग्नं"**. You'd own it, and it can play as the Mangalashtak scene finishes.
- **File spec:**
  - Format: AAC (`.m4a`) at 96 kbps, or 64–80 kbps mono for a solo shehnai.
  - Length: a 60–90s seamless loop, **under 1.5 MB**.
  - Loading: `preload="none"`, started from the tap on the cover, with a visible mute button.

### Needs a family elder or purohit to confirm
- Both families' **kuladaivat and kulaswamini** names.
- **चि. सौ. कां.** or चि. for both; **कै.** or स्व.
- The **tithi / शके** date from the purohit's panchang.
- **Which Mangalashtak variants** your purohit sings, so the site matches the ceremony.
- The groom's roots (Bhojpuri, Magahi or Maithili), which decide हकार and the Baidyanath line.
- Every Maithili sentence (none were verified).
- **उत्तराकांक्षी** as the RSVP label.

## 11. Open questions for the couple

1. **The references.** What exactly do you like in Meenaya, City-3 and MyShaadhi Link? For example: City-3's gold paintings, the carved countdown, the tap-to-open cover, or the personal guest links. Screenshots help.
2. **The basics.**
   - Names, as you want them written in English and Devanagari.
   - Wedding date(s).
   - **Where the wedding is:** Pune, Ranchi, or elsewhere? Is there a reception in the other city?
3. **Events.** The list, with date, time, venue and dress code for each. Which rituals come from which side?
4. **His side's art.** Does Madhubani/Kohbar (Mithila, Bihar) or Sohrai/Khovar (Jharkhand) feel like *yours*? Where are the family roots: Mithila, Bhojpur, Magadh, Ranchi itself?
5. **Languages.** English only, or English plus Marathi and Hindi (for example, headings in Devanagari)?
6. **Assets.** What you have (photos, illustrations, a Ganesha artwork, music, a monogram), pushed to `assets/` in this repo.
7. **Direction.** A, B, C, or the recommended mix?
8. **Logistics.** The date you want to send invites, a custom domain, and where RSVPs should land.
9. **Artwork.** Which budget tier (low, mid or high; see §9)? Are you happy to commission artists? Should the elders be asked about using Kohbar imagery?
10. **For the card wording (§10).**
    - Both families' kuladaivat / kulaswamini.
    - Honorific choices (चि. सौ. कां., कै. / स्व.).
    - The tithi date from your purohit.
    - Which Mangalashtak variants they sing.
    - Would an elder record the Ashtavinayak verse for the site?

---

### Sources
- Reference demos: https://www.missingpieceinvites.com/demos/meenaya · https://www.missingpieceinvites.com/demos/city-3 · https://myshaadhilink.in/invitation/vijay-rashmika-wedding-invitation?to=Guest&demo=true
- Motion playbook: https://github.com/MengTo/Skills/tree/main/agent-skills/web-design
- Warli artists and the Lagna Chowk: https://www.adiyuva.in/2020/02/warli-world-art-store-by-ayush.html · https://scroll.in/article/1026111/the-women-who-are-reclaiming-warli-art · http://www.sahapedia.org/warli-painting
- Sohrai-Khovar artists: https://en.wikipedia.org/wiki/Tribal_Women_Artists_Cooperative · https://villagesquare.in/saving-khovar-and-sohrai-mural-arts-of-hazaribaghs-tribal-villages/ · https://www.folkartopedia.com/folk-painting/khovar-and-sohrai-murals-of-hazaribagh-sk/
- Madhubani artists and prices: https://www.madhubani.com/ · https://www.myehaat.in/blogs/guide/madhubani-painting-a-buyer-s-guide · https://www.memeraki.com/blogs/art-guides/how-to-get-commissioned-indian-artworks-on-memeraki-right
- Kohbar symbolism: https://theprint.in/pageturner/excerpt/maithil-weddings-arent-fixed-using-horoscope-a-phallic-kohbar-painting-is-more-important/2273044/
- AI and Indian cultural imagery: https://impressions.manipal.edu/open-access-archive/11412/ · https://community.adobe.com/questions-32/images-are-overwhelmingly-ai-generated-1497463
- Artist moral rights (India): https://www.intepat.com/blog/moral-rights-copyright-law
- Marathi lagna patrika format and honorifics: https://happyinvites.co/wordings/lagna-patrika-format-in-marathi/ · https://www.marathisrushti.com/articles/chi-sau-kan/ · https://www.mumbaitak.in/political-news/story/why-widow-women-are-called-ganga-bhagirathi-what-is-the-real-reason-828346-2023-04-14
- Hindi / Bihari card format: https://hindiyatra.com/wedding-card-matter-in-hindi/ · https://milanmantra.com/wedding-card-matter-in-hindi/ · https://happyinvites.co/wordings/wedding-card-matter-in-hindi/ · https://www.aajtak.in/visualstories/education/indian-wedding-card-chi-before-groom-sau-before-bride-name-wedding-card-glossary-viral-pvpw-209544-15-02-2025
- Shlokas: https://shlokam.org/shloka/vakrathunda-mahakaya.htm · https://www.ramcharit.in/6032-2/
- Mangalashtak: https://mr.wikipedia.org/wiki/मंगलाष्टक · https://en.wikipedia.org/wiki/Mangal_Ashtaka · https://marathi.webdunia.com/article/hinduism-marathi/mangalashtak-in-marathi-121101200030_1.html · https://en.wikipedia.org/wiki/Ashtavinayaka
- Maithil and Bihari rites: https://en.wikipedia.org/wiki/Maithil_Vivah · https://www.weddingwire.in/wedding-tips/bihari-wedding--c2615 · https://www.hindwidictionary.com/maithili/meaning-of-hakaar
- Music rights and format: https://pixabay.com/service/license-summary/ · https://freemusicarchive.org/License_Guide · https://support.google.com/youtube/answer/3376882 · https://lawgist.in/copyright-act/27 · https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Audio_codecs · https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay
- Meenaya product page: https://www.missingpieceinvites.com/product-cards/product-card-meenaya
- City template page: https://www.missingpieceinvites.com/product-cards/product-card-city
- Warli Lagna Chowk and Palaghata: https://www.memeraki.com/blogs/posts/warli-paintings-different-types-styles · https://www.astaguru.com/blogs/from-tribal-homes-to-canvas-the-tale-of-warli-painting-725
- Sohrai and Khovar: https://www.memeraki.com/blogs/posts/the-comb-cut-paintings-of-jharkhand-sohrai-and-khovar · https://en.wikipedia.org/wiki/Sohrai_and_Khovar_painting
- Kohbar symbolism: https://mithilamelange.in/blog/understanding-kohbar-wedding-painting/ · https://www.memeraki.com/blogs/posts/understanding-the-symbolism-of-motifs-in-madhubani-art
- Maharashtrian rituals: https://weddingsutra.com/planning/wedding-tradition-series-explore-the-authentic-charm-of-maharashtrian-weddings/ · https://www.culturalindia.net/weddings/regional-weddings/maharashtrian-wedding.html
- Bihar and Jharkhand rituals: https://www.azafashions.com/blog/bihar-jharkhand-wedding-traditions-rituals-guide-2026/ · https://en.wikipedia.org/wiki/Chumavan
- Paithani motifs: https://paithanistore.com/blogs/paithani/paithani-saree-motifs-meaning
- Jharkhand state symbols and Ranchi: https://www.incredibleindia.gov.in/en/jharkhand/ranchi · https://en.wikipedia.org/wiki/Pahari_Mandir
- Pune landmarks: https://www.incredibleindia.gov.in/en/trips/trip-listing/pune-a-fusion-of-history-and-today
- Pune–Hatia Express: https://en.wikipedia.org/wiki/Hatia%E2%80%93Pune_Superfast_Express · https://erail.in/train-enquiry/22845
