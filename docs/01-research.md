# Phase 1 — Research brief

**Brief:** a responsive wedding invitation website. It should feel earthy and rooted in culture and in both hometowns: the bride's **Pune (Maharashtra)** and the groom's **Ranchi (Bihar / Jharkhand)**.

**Reference:** [Meenaya by Missing Piece](https://www.missingpieceinvites.com/demos/meenaya)

Status: first pass. Still needed: the couple's own inspiration notes and assets, plus the open questions at the end.

---

## 1. The reference: Meenaya (Missing Piece)

The demo host is blocked from our build environment, so this is from the product listing, not a hands-on teardown. See the open questions for what we need to fill the gap.

- A paid **Framer** template, marketed for South Indian weddings. The same studio also sells "City", "Laavan", "Mountain" and "Beach".
- It works like a web page, not a video or PDF, and is shared as a WhatsApp link.
- **Features the template family ships with** (our minimum baseline):
  - Event cards, with the option to send **different guests different event combinations**, or separate pages for the bride's and groom's families.
  - RSVP through **WhatsApp** or Google Forms.
  - Venue opens in **Google Maps**.
  - Instagram link.
  - A **Lord Ganesha motif with space for a mantra**.
  - An "**elder-friendly**" design: big, readable, no tiny videos to squint at.
  - Details can be edited after sending, and everyone sees the update without the link being re-shared.
- **Takeaway:** people like it for the feel (illustrated and warm) and the ease (one link, obvious buttons). We build an original site in that spirit and **do not copy its illustrations or layout**, since it's a commercial product.

## 2. Cultural core

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

## 3. Design directions (to pick or mix in Phase 2)

**A. "Lagna Chowk × Kohbar": folk walls** *(most earthy)*
The page is a painted mud wall. Warli figures in white lines on geru for her side, Khovar comb-cut and Kohbar motifs for his, meeting in a shared wedding square. Warli's geometric grammar suits code-drawn SVG, so figures can **draw themselves, dance in the tarpa circle, and respond to scroll** without heavy image files.

**B. "22845: Pune → Hatia": city journey** *(most "city")*
Scrolling is a journey from Shaniwar Wada to Pahari Mandir. Each "station" is a chapter: her city, his city, how they met, the events, the venue. Playful, story-driven, and a great way to include food and inside jokes.

**C. "Paithani & Palash": textile luxe** *(most elegant, elder-favourite)*
Narali and lotus borders frame each section, with peacocks, palash sprays and sal leaves. Deeper jewel-earth tones and gold. The closest to a classic printed card, made digital.

**Recommendation: A as the visual language, B as the story spine, C for borders and accents.**
Everything is drawn in one folk line style, including the city landmarks. Paithani borders and palash flowers add richness. One coherent look instead of a collage.

**Signature opening, recommended: the Antarpat.** The site opens on a cloth curtain, the one held between the couple. Guests tap **"शुभमंगल सावधान"**, the curtain drops, and akshata rains down to reveal the couple. Only a Maharashtrian wedding has this moment, and the rice shower brings in the Bihari chumawan too.

## 4. Palette draft: colours named after ritual materials

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

## 5. Type candidates (all on Google Fonts, all support Devanagari)

- **Devanagari display:** Tiro Devanagari Marathi / Hindi (refined, bookish) · Yatra One (brush, folk) · Rozha One (high-contrast poster).
- **Latin display:** Fraunces (warm, soft serif) paired with a Devanagari face.
- **Body, bilingual:** Mukta or Martel.
- **Handwritten notes:** Kalam (Devanagari and Latin).
- **Elder-friendly rule:** body text at least 18px on mobile, strong contrast, tap targets at least 48px.

## 6. Feature baseline

- **Must:** mobile-first; readable for elders; event cards (time, venue, dress code, **Open in Maps**); RSVP; countdown; **WhatsApp link preview** (image + title); fast on mobile data.
- **Should:**
  - Links per family or guest, which greet them by name and show **only their events**.
  - Add to calendar.
  - Music with a clear mute button.
  - English plus Marathi/Hindi.
- **Could:** our story, gallery, travel and stay guide (two cities, one venue), FAQ, livestream link for faraway family, Instagram hashtag.

## 7. Tech notes (carried into Phase 3)

- A static site: no backend, free hosting (GitHub Pages, Vercel, Netlify or Cloudflare Pages), optional custom domain.
- All wedding details in **one data file**. Editing it and pushing updates the live link, the same "edit after sending" benefit Framer offers.
- SVG for the folk art, GSAP for motion (now fully free, including ScrollTrigger), and `prefers-reduced-motion` respected.
- RSVP through a WhatsApp deep link (zero setup) or a Google Form / Sheet (collects data).
- Images in AVIF/WebP, lazy-loaded; audio loads only when a guest turns it on.

## 8. Open questions for the couple

1. **Meenaya.** What exactly do you like in it (colours, illustrations, the opening, a specific section)? Send 3–5 screenshots, or allow `missingpieceinvites.com` in the environment's network settings so it can be studied directly.
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

---

### Sources
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
