# 05 · The art: sources, licences and how to change it

Guests said the first design looked old: every peacock, border and medallion was drawn in code. The redesign (October 2026) keeps the story and the engineering, but takes its colour from **real paintings and textiles**:
- the page itself is quiet ivory paper and ink;
- the type is editorial: Instrument Serif for the names, Tiro Devanagari for Marathi, Hindi and Sanskrit;
- each artwork gets its own screen and a museum-style label.

## The rule for art on this site

Only openly licensed works, with the licence recorded:
1. **Public domain / CC0 first.** Museum open-access images (Cleveland, Smithsonian, the Met, Art Institute of Chicago), Rijksmuseum, Internet Archive scans of old books.
2. **CC BY / CC BY-SA** only with the credit shown on the page.
3. **Never** "found on Google", Pinterest, stock sites without a licence, or anything marked ND/NC without checking.

Every work used is listed in `src/data/art.json` (title, date, place, museum, credit line, licence, link) and credited in the footer under **The art on this page**.

## What the page uses

Each chapter is a pair: a work from his side (Bihar) and one from hers (Maharashtra). The pairs and their captions are in `src/data/tours.json`; the research behind them is in `docs/research/`.

| Where | His side · Bihar | Her side · Maharashtra |
|---|---|---|
| Cover | *Gauri Ragini*, Marwar, c. 1625–30 (National Museum of Asian Art, Smithsonian, S2018.1.49, CC0). Not yet replaced. | |
| Blessing | Ganesha, a Mithila (Madhubani) painting, 20th century (The Cleveland Museum of Art, 2005.84, CC0) | The Buddha seated on a lotus, a wall painting at Ajanta (photograph by Vasukrishnan57, 2011, Wikimedia Commons, CC BY-SA 4.0: credited in the footer, and the crop is shared under the same licence) |
| Two homes | A Chhath scene on mica, probably Patna, 19th century (Wellcome Collection, Public Domain Mark) | Two mothers embrace, Paithan, c. 1850 (LACMA, M.82.234.2, public domain) |
| Haldi | Shiva Dayal Lal, *Four women selling food-grains, vegetables and fruit*, Patna, c. 1850 (V&A IS.66-1949, via Wikimedia Commons, PD-Art) | The bath of King Mahajanaka of Mithila, Ajanta Cave 1: Herringham's *Ajanta Frescoes* (1915), plate XIV (Smithsonian Libraries via Internet Archive, public domain) |
| Sangeet | *Holi being played in a courtyard*, Patna, c. 1795 (British Library Add.Or.939, via Wikimedia Commons, PD-Art) | *Fugdi*, Chitrashala Press print no. 102, Pune, c. 1880–1900 (Wellcome Collection, Public Domain Mark) |
| Shaadi | A baraat by night, probably Patna, 19th century (Wellcome Collection, Public Domain Mark) | A bride is blessed by elders, Paithan, c. 1850 (LACMA, M.85.297.6, public domain) |
| Bodhi leaf (ornament, the toran over the verses, leaves among the RSVP petals) | | One leaf from *Peepul tree (Ficus religiosa): fruiting stem*, c. 1843, the Buddha's tree of Bodh Gaya, in his Bihar (Wellcome Collection V0043954, Public Domain Mark). Cut out by `scripts/leaf.mjs`. |
| Paper texture | Ingres hand-made paper, Canson & Montgolfier sample book, 1922 (Getty Research Institute via Internet Archive, public domain) | |

**Licence notes.**
- The Ajanta Buddha is the one work here that is not public domain: CC BY-SA 4.0 asks for the photographer's name (in the footer credits) and that our crop carries the same licence.
- No better openly licensed Mithila Ganesha exists than Cleveland's (searched October 2026). Finer ones are by living artists (for example on Memeraki); one bought with the artist's written permission can replace it: add it to `art.json` like any other work.
- The two Commons works are faithful photographs of paintings long out of copyright (PD-Art). The V&A's own terms for its photograph are non-commercial; this is a private, non-commercial invitation either way.
- Upload.wikimedia.org refuses this pipeline's requests (HTTP 429), so those two `src` links are Commons' own thumbnails (1920 and 3840 px wide).
- The Ajanta plates come from archive.org's IIIF server, which fails on `max`; the links ask for an explicit width.
- Plate III of the same book (a copy by Nandalal Bose, d. 1966) is deliberately not used: it may still be protected in life-plus-70 countries.

## How the images are made

```sh
npm run art            # every work in src/data/art.json
npm run art -- holi    # one
```

`scripts/art.mjs` downloads each museum master once (kept in `node_modules/.cache/art`). It then writes:
- each crop at a few widths, as AVIF plus a smaller WebP fallback, to `public/art/`;
- the sizes, srcsets and a loading colour to `src/data/art-files.json`.

Commit both. `src/components/Art.astro` renders them as a responsive `<picture>`.

**Crops** are fractions of the image: `[x, y, width, height]`. A crop can be turned first (`"rotate": 90`), which the silk uses on wide screens so its gold end bands sit at the sides.

**Textiles** photographed thread by thread compress badly. A small median filter (`"median": 3`) keeps a pattern's edges and halves the file. Paintings don't need it. The phone cover is 109 KB at most.

**Opening the cover:** a circle of light grows from the seal, and the page shows through it. It is a CSS mask whose radius GSAP animates (`src/scripts/motion/cover.ts`).

*Earlier versions, dropped after the family's review:*
- a silk brocade (Cleveland 1916.1213) as the cover, falling away in a WebGL cloth effect: the cloth looked artificial and the brocade read as a worn fragment;
- court paintings from Rajasthan, the Punjab Hills and Lucknow for the chapters: beautiful, but from neither family's home, so they told no story of theirs. The October 2026 pairs replace them.

**The Bodhi leaf** (`public/art/bodhi-leaf.<hash>.webp`, 8 KB): `node scripts/leaf.mjs` cuts the small top-right leaf out of the 1843 plate by its colour (the paper is a pale, greyish cream; the leaf is saturated green), keeps the largest shape and fills its pale veins. Then update `--leaf` in `src/styles/base.css` and the `tile` in `art.json`. It is used three ways: as a gold ornament through a CSS mask (`.leaf`, between the two invocations and in the footer and RSVP), as the toran of leaves over the verses, and drawn among the petals when a reply is sent. The Vishnu lotus frieze it replaced is no longer used.

**The paper** (`public/art/paper-1922.<hash>.webp`) is the 1922 scan, made grey, with its dark flecks evened out (they read as stray punctuation next to text), and re-toned so its average is exactly the page ivory (#F4EEE3). It tiles without seams and weighs 13 KB.

## Looking into a pair of paintings

Each chapter's art is a *tour* of two works, his side's and hers:
- **On scroll** the pair stays on screen while the view glides to a detail of each, with a line of text, then out to both together for a closing line that joins them.
- **In `src/data/tours.json`** each tour lists its two `works` (ids in `art.json`) and its `stops`. A stop has `w` (0 for his work, 1 for hers), a `box` (fractions of that work's crop: `[x, y, width, height]`) and its words. A stop with no `w` shows the whole pair.
- **Side by side or one above the other:** `Tour.astro` works out both layouts and the boxes for each. A container query stands the pair side by side once the stage is wider than the square root of the two layouts' aspect ratios multiplied, which is where side by side fills more of it. `tour.ts` reads which layout is showing each time the page is measured.
- **Living details** come from a work's `"live"`: `twinkle` areas get stars, and `fire` points (`[x, y, size]`) flicker. The baraat's sky twinkles and its torches flicker, only while on screen.
- **With Gentle motion, or without JavaScript**, the two paintings simply appear one above the other, with the lines listed under them.

## Swapping in the family's own art (recommended)

The museum works are a strong backstop. The most personal version of this page uses the family's own things:
1. **Mrunalini's (or her mother's) Paithani.** Lay it flat by a window in soft side light (not direct sun), phone parallel to the cloth. Take one photo of the whole pallu, and one close-up of the peacock in the zari. Add it to `art.json` as `silk`, keeping the same crop names, and re-measure the medallion or motif for the seal.
2. **A Madhubani painting from Bihar.** Buy or commission one: a peacock pair with lotus, fish and the sun and moon is traditional for weddings. Ask the artist to photograph the line-only (*kachni*) stage before colouring as well. Replace `ganesha`, or add it as a new plate.

Ask the elders before using any explicit Kohbar imagery: it is nuptial-chamber art.

## The research behind this

All in the session scratchpad, not in the repository:
- Cleveland: 57 picks.
- Smithsonian, Met and AIC: 57 picks.
- Textures and botanicals: 48 picks.
- A design-research note.

Strong alternates if a family member prefers them:
- Golconda night wedding procession, c. 1650 (Met 458034), for Sangeet.
- A kalamkari hanging with a facing pair of peacocks (Met 447849).
- A Kalighat painting of Parvati garlanding Shiva (Cleveland 2003.108.a).
- Royal women with sparklers (already used), or *Hindola Raga*, a swing with drums (Cleveland 1975.9).
- A magenta sari with a zari paisley pallu, c. 1875 (Met 1978.50).
- A Maharashtra sari fragment with gold geese (Cooper Hewitt 2022-15-4).
