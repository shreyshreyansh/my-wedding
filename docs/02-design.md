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
- **The medallion** is one frame used everywhere: a circle whose left half is rani silk with a zari ring, and whose right half is paper with a hatched ring. **What's inside changes down the page:**
  - **Peacocks open the invitation:** they are apart in the hero and meet under a garland in the pinned scene. After that they step aside, so they don't repeat.
  - **Each celebration brings its own props.** Every prop is drawn half Paithani (gold on silk) and half Madhubani (double line on paper):

| Event | Props | Motion |
|---|---|---|
| **Haldi** | Brass bowl of turmeric, **mango leaves** (used to apply haldi), turmeric roots, marigolds | Mango leaves take turns dipping into the bowl and turmeric splashes; marigold petals drift down |
| **Sangeet** | **Dholak** (the Maharashtrian dholki, the Bihari dholak), **ghungroo**, sargam | The dholak beats *dha-dha*; the ghungroo jingle; सा रे ग म प ध नि float up. **Tap the dholak to play it.** |
| **Shaadi** | **Gathbandhan**: her zari-and-mor Paithani cloth and his yellow pitambar with a hatched Madhubani border, swagged from the rim and tied in one knot whose two ends hang over the fire. Also a stepped **agni kund**, two **kalash** (coconut and mango leaves; banded, never with dot "faces"), and **seven diyas for the saptapadi** | The two cloths slide in from opposite rims and the knot is tied; the seven diyas light one by one; the flames flicker and the knot's ends sway |
| **RSVP** | **Akshata thali** with rice, kumkum and a diya | The diya flickers; on Send the akshata is tossed as a blessing |

  Each loop plays only while its event is on screen, and only after the event's entrance has finished.
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
1. **Cover:** the antarpat under a Madhubani toran, with a doorway arch, the kumkum swastik and a Paithani pallu. The seal beats until you tap it, and then the silk drops (interactive). See "The cover" below.
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

### Layered motion (prototype v2, after "make it as vibrant as the references")
The references feel alive because text and art move together in layers. The prototype now does the same in our own vocabulary:

| Moment | Motion | Taken from |
|---|---|---|
| Hero names | English names rise **letter by letter** with a 3D flip and small overshoot, plus blur-to-sharp on desktop. Devanagari writes in by word. **Hover or tap** a name and its letters ripple. | MyShaadhi Link's letter reveal |
| Hero depth | Paithani and Madhubani **feathers and akshata grains float at five depths**, some behind the names and some in front. Each drifts and moves at its own scroll speed; on desktop they also follow the mouse. | Meenaya's lanterns |
| Crossing ribbons | A Paithani zari ribbon and a Madhubani paper ribbon cross in an X, with text in both scripts. They drift constantly, **race when you scroll fast**, and reverse when you scroll up. | Framer / Awwwards scroll-speed text bands |
| The meeting | The pinned, scroll-driven peacock scene | City-3's ship, extended |
| Schedule | A **marigold toran** drops in and sways. Each event's props play their own loop (see the table above). On phones, the chapter nearest mid-screen stays sharp while the others recede. On desktop, a chapter lifts and its medallion turns on hover. Event names ripple on hover. | MyShaadhi Link's toran and focus band |
| Mangalashtak | The verse lights up word by word as you scroll; **gold specks drift**; a zari glint sweeps across ॥ शुभमंगल सावधान ॥. | MyShaadhi Link's specks |
| Countdown | A live **seconds** dial; each changed digit drops in. | MyShaadhi Link's countdown |
| Curtain | The countdown **sticks at the top of the screen** (CSS `position: sticky`, not a scroll pin), and the **RSVP slides up over it like a curtain**, with a shadow on its leading edge. | Missing Piece's curtain hand-off |
| Details | A rani progress thread grows down the zari edge. Buttons get a zari glint on hover. The seal button is magnetic on desktop. Steppers roll their numbers. | MengTo skills |

A **Moments** guide (bottom left, after opening) jumps to each moment with a note on what to watch for.

### The cover (prototype v4, after "make the tap evident, and make it more awesome")
The first screen is the **antarpat**, the cloth held between the couple while the Mangalashtak is sung. At **शुभमंगल सावधान** it is lowered and they see each other. The cover now reads as that exact moment, with both cultures in it from the first second:

| Element | What it is | Motion |
|---|---|---|
| **Toran** (his) | Mango leaves and marigold strands in Madhubani double line, on a red-and-yellow **mauli** thread. Strands are short over the text and long at the edges, ending in small brass bells. | Drops in from the centre outwards and sways. It swings when the cloth is tugged and lifts away as you pass under it on opening. |
| **Doorway arch** | Her zari line on the left and his chuna double line on the right, meeting at a half-zari, half-chuna gem at the apex. | The two lines **rise from the ground and meet at the top**, and then the gem appears. |
| **Kumkum swastik** | Drawn on a split disc (her chuna silk and his paper with a hatched ring), as it is on a real antarpat. One sign across both halves. | Drawn stroke by stroke, like a finger dipped in kumkum; the four dots follow. |
| **Guest line** | सस्नेह निमंत्रण · "with love, for **the [Guest name] family**", in calligraphy like a hand-addressed envelope. | Fades up. |
| **Names** | As before. | Written in left to right, then the Devanagari. |
| **Seal** (the tap target) | Zari with a kajal double border: शुभमंगल सावधान and "Tap to open your invitation". Underneath is one line for guests who don't know the ritual: *At these words, the antarpat is lowered.* | **Heartbeat, *dha-dha*:** it swells twice every 2.4s, two zari ripples spread out, a glow pulses and a glint crosses it. If nobody taps, the **cloth tugs down and springs back** (after 3s, then every 6.5s, three times at most), the toran jiggles and a few akshata fall. |
| **Pallu** (hers) | A woven Paithani border: **pairs of peacocks facing each other across a lotus**, between mor lines and the narli zigzag. | Still: it is woven. |
| **Silk** | Rani with zari buttis. | A slow sheen crosses it every 8s, and a few buttis twinkle. |

- **The tap:** the seal squashes and bursts (three ripples plus a glint) and the toran swings. The text lifts away and **the silk falls with gravity** (`power2.in`). Akshata and marigold petals shower, the hero starts playing behind the falling cloth, and the toran lifts off. Android phones also give a *dha-dha* buzz.
- **Tap anywhere:** tapping anywhere on the cloth also opens it; the seal is the accessible button.
- **Entrance:** about 2.5s, and it waits for the fonts (up to 0.9s) so nothing jumps. The heartbeat starts only when the entrance ends. A tap during the entrance skips straight to the opening.
- **Reduced motion:** everything is static. The seal gets a fixed zari outline instead of the pulse, and the tap opens at once.
- **No accidental zoom:** the page uses `touch-action: manipulation`, so quick taps (the dholak, the seal) don't trigger iOS double-tap zoom. Pinch zoom still works.
- **Short phones (≤720px tall):** smaller names and swastik, and the explanation line is hidden. Checked on 375×667, 390×844 and 1440×900.
- **Cultural notes:**
  - The swastik is the antarpat's own mark, drawn in kumkum ([WeddingWire India](https://www.weddingwire.in/wedding-tips/mangalashtak-in-marriage--c4807), [Vedic Vaani](https://vedicvaani.com/lagna-antarpath-wedding)).
  - The swastik is easy to swap if the family prefers another sign, such as a kalash or श्री.
- **Checked in a browser:** captured from a real Chromium render, not just read from code. The reference recording and a still are in `design/prototype/`.

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
- **His Madhubani side,** from a Mithila artist (see research §9), painted on paper as separate layers:
  - the peacock pair (each bird, the tail feathers and the garland);
  - the event props: the haldi bowl and mango leaf, the dholak and ghungroo, the kalash, the gathbandhan cloth, the diya and the thali.
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
- **v3, event props:** peacocks only open the invitation; Haldi, Sangeet, Shaadi and the RSVP each got their own props and loops.
- **v4, the cover:** the couple asked for a more obvious tap and a richer first screen. That brought the toran, the doorway arch, the kumkum swastik, the pallu and the heartbeat seal.
- **v4.1, Shaadi redraw:** seen zoomed in on a phone, the gathbandhan read as two broken pipes and one kalash looked like a face. The cloths are now proper swags with one tied knot, the kalash are banded, the kund is stepped, the Haldi roots are real turmeric shapes, and double-tap zoom is off.
- **v4.2, the curtain:** a phone recording showed the countdown pinned at the bottom of the screen while the Mangalashtak kept scrolling above it. That opened an empty teal gap, and the RSVP ate the dials from below. The countdown now sits in its own wrapper with the RSVP and uses `position: sticky; top: 0`. It rides up with the page, stops at the top, and the RSVP covers it with no gap. It is native CSS, so iOS doesn't jitter, and it has extra top padding so the Claude app's title bar doesn't hide the label.

## Next
Phase 3, `/plan`: the build plan. It covers the stack, one data file, the guest-code scheme, the RSVP pipeline (Apps Script → Sheet, with WhatsApp as fallback), porting the prototype's motion, the artwork pipeline, and the launch checklist.
