# Phase 2 — Design

- **Design canvas:** https://claude.ai/artifact/SGiypJevJt1eNSEZsSa3fx
- **Scroll-motion prototype:** https://claude.ai/artifact/PHnbz3mYgvhdaqpMkC4VWZ. Its source is in `design/prototype/`.

Both are private until shared from their Share menus.

## What the couple decided

| | |
|---|---|
| **Names** | Shreyansh Shrey · श्रेयांश श्रेय — Mrunalini Waghmare · मृणालिनी वाघमारे |
| **Haldi** | Tuesday 8 Dec 2026, 12 noon · Haveli Banquet, Ranchi · wear yellow |
| **Sangeet** | Tuesday 8 Dec 2026, 8 pm · Haveli Banquet, Ranchi · formals |
| **Shaadi** | Wednesday 9 Dec 2026, 8 pm · Haveli Banquet, Ranchi · traditional (our wording below) |
| **Groom's-side art** | Madhubani |
| **Languages** | English, Marathi and Hindi |
| **Direction** | **A · the peacock pair: Paithani meets Madhubani** (chosen after v1) |

## Feedback on v1, and what changed in v2
1. **"Text calligraphy can be improved; keep it traditional even in English."**
   - Before: Eczar and Mukta, which are modern.
   - Now: **Amita** for names, titles and numbers. It is a calligraphic face whose Latin and Devanagari were drawn with one pen.
   - All other text uses **Tiro Devanagari**, with italic for flourishes, in all three languages. **There is no sans-serif anywhere.**
2. **"Schedule and RSVP look disconnected from the landing."**
   - Both now use the landing's vocabulary: silk, paper, zari, double lines and the peacock medallion.
   - The generic app cards and sans-serif buttons are gone.
3. **"I like A with the peacocks; keep the crossing of two cultures."**
   - A is now the whole system.
   - Every motif is drawn by both hands: gold on silk on her side, double line on paper on his.
4. **"Think more about responsiveness and Apple / Framer-style scroll motion."**
   - A four-frame storyboard of the pinned scroll scene.
   - Desktop layouts for the hero and schedule, and responsive rules.
   - A **live scroll prototype** built on the real stack.

## The direction: "The peacock pair"
- **Concept:** her Paithani (woven silk, Maharashtra) and his Madhubani (painted paper, Bihar) share the peacock. Two peacocks, one from each art, face each other and meet.
- **The medallion** is one component used everywhere: a circle whose left half is rani silk with a zari ring, and whose right half is paper with a hatched ring. Its **poses tell the story down the page:**

| Pose | Where | Story |
|---|---|---|
| Apart | Hero | They see each other |
| Haldi | Haldi | Across the turmeric bowl |
| Dance | Sangeet; RSVP after sending | Tails fan open |
| Garland | Shaadi | The varmala is exchanged |
| Meet | Cover; RSVP | Beaks touch; a lotus (Mrunalini = lotus) blooms, half silk, half paper |

- **Colours:**
  - Hers (Paithani): rani `#A3195B`, mor `#0E5C63`, zari `#C9A04A` (large text and ornament only), chuna `#F5EFE3`.
  - His (Madhubani): kagaz `#EFE3C8`, kajal `#2B211B`, sindoor `#B3261E`, haldi `#D99A1E` (fills only), neel `#2F3E73`.
  - All text pairings meet 4.5:1, or 3:1 for text 24px and up.
- **Shared pieces, so nothing looks like an app:**
  - Selvedges: zari down her edge and Madhubani hatching down his, on every screen.
  - A divider that is half zari line, half double line.
  - A primary button of rani silk with a zari edge.
  - A secondary button with a Madhubani double line.
  - Fabric swatches for the dress codes.
- **Pune in it:**
  - Paithani itself.
  - The Ashtavinayak Ganpatis (in the Mangalashtak).
  - "From Pune to Ranchi" as the schedule's spine.

## Screens (canvas v2)
1. **Cover:** the Paithani antarpat. Tap शुभमंगल सावधान and the silk drops (interactive).
2. **Hero:** silk and paper halves; the peacocks apart.
3. **The meeting:** the pinned scroll scene, as a four-frame storyboard.
4. **Invitation:** English, मराठी and हिंदी in the new lettering (interactive).
5. **Schedule:** the peacocks' story. Three medallion chapters joined by twin threads, gold and black.
6. **Mangalashtak** on peacock-green silk, with medallion-style countdown dials.
7. **RSVP:** double-line rows, medallion steppers, and a send button with a zari edge. After sending, the peacocks dance (interactive).
8. **Desktop:** hero (her name under the silk, his under the paper, the medallion between) and a three-column schedule.
9. **Style sheet**, the medallion component, and the A/B/C options kept for reference.

## Motion
- **Stack:**
  - GSAP and ScrollTrigger (free, including all plugins).
  - Lenis for wheel smoothing on desktop only.
  - Native touch scrolling on phones. Never `syncTouch` or `normalizeScroll`.
  - `ignoreMobileResize` on.
- **Tokens:**
  - Entrances rise 24px with a fade, 0.8–0.9s, `power3.out`, once, when the element is 80–88% of the way up the screen.
  - Staggers are 40–120ms.
  - Scroll-driven scenes are linear, with a 1.2s trailing lag on desktop and 0.5s on touch.
  - Name write-ins are a left-to-right `clip-path` reveal (`power2.inOut`), by word. **Devanagari is never split into letters.**
  - Only transforms, opacity, stroke-dashoffset and clip-path are animated; there is no blur or filter.
- **The pinned meeting:** the scene holds for about 2.1 screens of scroll on desktop and 1.5 on phones.

| Scroll | What happens |
|---|---|
| 0–35% | Silk and paper slide in from opposite edges; the peacocks walk in, bobbing |
| 35–70% | The trailing tails fade; feathers fan open, their lines drawing out and the eyes popping one by one |
| 70–85% | The beaks meet; the garland beads appear over their heads |
| 85–100% | The names write themselves in |
| On release | Akshata falls |

  It plays in reverse when you scroll back up.
- **Schedule chapters:**
  - Each medallion's rings draw themselves in and the peacocks step in from both sides; then the pose plays (the bowl rises, the tail fans, or the garland beads appear).
  - The twin threads between chapters draw with scroll.
- **Mangalashtak:** the verse lights up word by word with scroll; akshata bursts on ॥ शुभमंगल सावधान ॥.
- **Reduced motion:** final states, no pinning, no smooth scroll, no particles.

## Responsive rules

| Width | Layout |
|---|---|
| **Phone (<600px)** | One column; 10px selvedges and a 20px gutter; the medallion is 86vw, max 360–400px; the pinned scene is shorter; fewer particles |
| **Tablet (600–1024px)** | Medallion about 60vw; the schedule stays stacked |
| **Desktop (>1024px)** | Split hero with each name under its own art; three-column schedule; the pinned scene is longer, with wheel smoothing |

- **Type is fluid:** names `clamp(40px, 9vw, 96px)`; text 17–20px.
- **Sizing:** `svh` for full-screen sections; `100svh` for the cover.

## Artwork, for direction A
The peacocks in the design are code-drawn stand-ins. For the real site:
- **His Madhubani peacock pair,** from a Mithila artist (see research §9), painted on paper as separate layers: each bird, the tail feathers, the garland and the lotus.
- **Her Paithani peacock.** Paithani is woven, so the most personal source is **Mrunalini's own Paithani**. Photograph or scan its peacock motif and zari border, and have an illustrator trace them into layers. A textile artist is the alternative.
- **The Warli Lagna Chowk is no longer needed** in A. Warli can return later as a dancing crowd if wanted.

## Assumptions to confirm
- **The groom is named first** in running text. The **desktop hero puts each name on its own art's side:** Mrunalini under the silk on the left, Shreyansh under the paper on the right. Say if you'd rather flip it.
- **Venue:** written as "Haveli Banquet, Ranchi". Confirm the exact name and send the Maps pin.
- **Dress codes:**
  - Sangeet: "Evening formals; Indo-western welcome".
  - Shaadi: "Traditional finery: Paithani, Banarasi, lehengas, sherwanis. Jewel tones."
- **Event names:**
  - Hindi: संगीत संध्या, शुभ विवाह.
  - Marathi: हळद, लग्न.
- **The train glyph is gone.** "From Pune to Ranchi" remains as the schedule's title.

## Placeholders still in the design
- Parents' names for both sides, in all three languages.
- Kuladaivat / kulaswamini.
- The मिती / शके tithi line.
- Inviters (निमंत्रक / दर्शनाभिलाषी).
- The बाल मनुहार child and relation.
- The RSVP deadline.
- The WhatsApp number.

## Timeline
- **Distance to the wedding:** 72 days from 27 Sep 2026.
- **Invites:** usually 4–6 weeks before, so **around 27 Oct – 10 Nov**.
- **Artwork:** a Madhubani commission takes 4–6 weeks, so it has to **start this week**. The fallback is buying existing Madhubani peacock originals with permission to scan them (1–2 weeks).

## History
- **v1, "Two walls, one chowk":** Warli × Madhubani, with the Pune → Hatia train as the story. The couple felt Maharashtra was under-represented.
- **Options:** B (Lotus & sun) and C (Rangoli × Aripan) stay on the canvas for reference.

## Next
Phase 3, `/plan`: the build plan. It covers the stack, one data file, the guest-code scheme, the RSVP pipeline (Apps Script → Sheet, with WhatsApp as fallback), porting the prototype's motion, the artwork pipeline, and the launch checklist.
