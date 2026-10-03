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

| Where | Work | Museum | Licence |
|---|---|---|---|
| Cover (the antarpat) and the medallion fly-through | *Fragment of Gold Cloth*, silk brocade with gold and silver threads, India, 1800s | The Cleveland Museum of Art, 1916.1213 | CC0 |
| Invocation (॥ श्री गणेशाय नमः ॥) | Ganesha, Mithila (Madhubani) painting, Bihar, 1900s | The Cleveland Museum of Art, 2005.84 | CC0 |
| Haldi | *Kakubha Ragini*, a woman with two garlands between two peacocks, probably Marwar, c. 1630 | National Museum of Asian Art, Smithsonian, S2018.1.51 | CC0 |
| Sangeet | *Royal Women Celebrating Diwali*, Lucknow, c. 1760 | The Cleveland Museum of Art, 1971.82 | CC0 |
| Shaadi | *Wedding Ceremony with Brahma in Attendance*, Ajmer, c. 1680 | National Museum of Asian Art, Smithsonian, S2018.1.29 | CC0 |
| Mangalashtak friezes | Lotuses from *Vishnu on Ananta*, Chamba, c. 1700 | The Cleveland Museum of Art, 2018.155 | CC0 |
| Paper texture | Ingres hand-made paper, Canson & Montgolfier sample book, 1922 | Getty Research Institute via Internet Archive | Public domain |

## How the images are made

```sh
npm run art            # every work in src/data/art.json
npm run art -- haldi   # one
```

`scripts/art.mjs` downloads each museum master once (kept in `node_modules/.cache/art`). It then writes:
- each crop at a few widths, as AVIF plus a smaller WebP fallback, to `public/art/`;
- the sizes, srcsets and a loading colour to `src/data/art-files.json`.

Commit both. `src/components/Art.astro` renders them as a responsive `<picture>`.

**Crops** are fractions of the image: `[x, y, width, height]`. A crop can be turned first (`"rotate": 90`), which the silk uses on wide screens so its gold end bands sit at the sides.

**The silk** is photographed thread by thread, so it compresses badly. A small median filter (`"median": 3`) keeps the pattern's edges and halves the file. The phone cover is 105 KB.

**The cover seal** sits on the woven medallion. Its position comes from CSS variables:
- `--mx`, `--my`: the medallion's centre, as fractions of the crop;
- `--mw`, `--mh`: its size;
- `--ar`: the crop's height over its width.

They live in `src/styles/cover.css` and `through.css`. If you recrop the silk, update them.

**The paper** (`public/art/paper-1922.webp`) is the 1922 scan, made grey and re-toned so its average is exactly the page ivory (#F4EEE3). It tiles without seams and weighs 14 KB.

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
