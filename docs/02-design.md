# Phase 2 — Design

**Design canvas:** https://claude.ai/artifact/SGiypJevJt1eNSEZsSa3fx (private until shared from its Share menu)

## What the couple decided

| | |
|---|---|
| **Names** | Shreyansh Shrey · श्रेयांश श्रेय — Mrunalini Waghmare · मृणालिनी वाघमारे |
| **Haldi** | Tuesday 8 Dec 2026, 12:00 pm · Haveli Banquet, Ranchi · wear yellow |
| **Sangeet** | Tuesday 8 Dec 2026, 8:00 pm · Haveli Banquet, Ranchi · formals |
| **Shaadi** | Wednesday 9 Dec 2026, 8:00 pm · Haveli Banquet, Ranchi · traditional (our wording below) |
| **Groom's-side art** | Madhubani |
| **Languages** | English, Marathi and Hindi |
| **Direction** | The recommended mix (below) |

## The direction: "Two walls, one chowk"
- **The look:** two painted walls meet in one chowk.
  - Her side is **Warli**: white rice-paste figures on a red-ochre wall.
  - His side is **Madhubani**: bold double-line art on handmade paper.
  - They meet in a **Lagna Chowk** with the couple's names at the centre.
- **The story:** the **Pune → Hatia train (22845)**. The wedding is in Ranchi, so the bride's family really does make this journey. The three events are its stations.
- **The details:** a woven Paithani-style border, grains of akshata, Warli triangle bands, and palash and sal accents.
- **The opening:** the **Antarpat**. Tap "शुभमंगल सावधान", the cloth drops, akshata bursts, and the shehnai starts on the same tap.
- **Colours:** named after ritual materials (geru, chuna, kagaz, kajal, sindoor, haldi, neel, sal, palash, mitti). Every text pairing meets 4.5:1 contrast. Haldi and palash are never used for body text.
- **Type:**
  - **Eczar** for display. It covers both Latin and Devanagari in one voice.
  - **Tiro Devanagari Marathi / Hindi** for the invitation text and verses.
  - **Mukta** for the interface.
  - On phones, Devanagari body text uses the system font.

## The canvas
1. **Cover: the Antarpat.** Interactive: tap to drop the cloth.
2. **Hero:** names in Latin and Devanagari, the date, and the two walls with a gap between them.
3. **Two walls meet:** the pinned scene that plays as you scroll, shown in its end state.
4. **Invitation:** interactive switch between English, मराठी and हिंदी. Written to card conventions (चि. / चि. सौ. कां., आयुष्मान् / आयुष्मती, दर्शनाभिलाषी, बाल मनुहार).
5. **Events:** Haldi, Sangeet and Shaadi as stations on the track. The middle one shows the "focused" state.
6. **Mangalashtak:** the rivers verse (Godavari and Gandaki) lit word by word, "॥ शुभमंगल सावधान ॥", and a live countdown.
7. **RSVP:** interactive per-event counts and a thank-you state, with WhatsApp as the fallback and a closing chaupai.
8. **Desktop hero.**
9. **Style sheet:** colours, type, and which art is drawn in code vs commissioned.

The motion for each screen is written in sticky notes under the phone row. It follows research §2.

## Open decision: how Maharashtra meets Madhubani
**The couple's goal:** "Madhubani meets Maharashtra, like two souls meeting into one."

The first pass under-delivered on this. Warli's thin white lines lose to Madhubani's bold colour. Paithani, the Maharashtrian art Pune families actually treasure, was only a border. Pune itself was absent.

**The bridge:** Paithani and Madhubani share the same symbols: the peacock (mor), the parrot pair (tota-maina) and the lotus. **Mrunalini (मृणालिनी) means lotus.** One symbol drawn half in each hand becomes the two of them meeting.

Three hero directions are now on the canvas (top row, beside the style sheet):

| Option | Idea | Maharashtra | Bihar / Mithila |
|---|---|---|---|
| **A · Mor pair** | Two peacocks face each other and meet at the beak inside one medallion | Paithani silk: rani pink, peacock green, zari gold | Madhubani double line and hatching |
| **B · Lotus & sun** | One lotus, half Paithani and half Madhubani, opens to a Madhubani sun | Lotus = her name; Paithani petals and water | The Chhath sun, Bihar's great festival; Madhubani petals and water |
| **C · Rangoli × Aripan** | The wedding floor seen from above: one circle, half rangoli, half aripan | Colourful rangoli at the door | White rice-paste aripan |

**Recommendation: B as the soul of the site, plus A's rule on every screen.**
- The lotus opening to the sun becomes the pinned scroll moment, in place of "two walls".
- Every motif (peacocks, borders, event icons) is drawn half Paithani, half Madhubani.
- Warli stays as the dancing crowd (for the Sangeet); rangoli × aripan can be the chowk floor.

**Pune and Ranchi touches to add, whichever option wins:**
- Paithani colours and a zari border on her side.
- Ganpati: the Ashtavinayak verse already names Pune's Ganpatis.
- Shaniwar Wada's gate at the "Pune Jn" station; Pahari Mandir at "Hatia".
- Sanai-choughada in the music.
- Optional: a "Things to know" section in the style of a witty Puneri pati signboard, with a Bihari counterpart.

## Assumptions to confirm
- **Groom is named first** throughout, since the wedding is hosted in Ranchi.
- **Venue name** is written as "Haveli Banquet, Ranchi". Confirm the exact name and send the Google Maps pin.
- **Dress-code wording:**
  - Sangeet: "Formals; Indo-western welcome".
  - Shaadi: "Traditional finery: Paithani, Banarasi, lehengas, sherwanis. Jewel tones."
- **Event names:**
  - Hindi: Sangeet is संगीत संध्या; Shaadi is शुभ विवाह.
  - Marathi: हळद and लग्न.
- **Artwork placeholders:** the Madhubani art and the Lagna Chowk are placeholders until the art is commissioned (research §9). The Warli figures are code-drawn by design.

## Placeholders still in the design
- Parents' names for both sides, in all three languages.
- Kuladaivat / kulaswamini.
- The मिती / शके tithi line.
- Inviters (निमंत्रक / दर्शनाभिलाषी).
- The बाल मनुहार child and relation.
- The RSVP deadline.
- The WhatsApp number.

## Timeline
- The wedding is **72 days** from 27 Sep 2026.
- Invites usually go out 4–6 weeks before, so **around 27 Oct – 10 Nov**.
- A commissioned art set takes 4–6 weeks. It has to **start this week**, or fall back to buying existing Madhubani originals with permission to scan (1–2 weeks).

## Next
Phase 3, `/plan`: the build plan. It covers the stack, the data file, the guest-code scheme, the RSVP pipeline, the motion implementation and the launch checklist.
