# Shreyansh & Mrunalini · 8 & 9 December 2026

The wedding invitation: one page, personal for each family, in English, मराठी and हिंदी. Paithani meets Madhubani.

- `src/data/wedding.ts`: every word on the page. `src/data/art.json`: the museum paintings and textiles (all public domain), cut by `npm run art` into `public/art`.
- `src/components`, `src/styles`, `src/scripts` (essentials) and `src/scripts/motion` (animation, loaded after).
- `worker` + `server`: the Cloudflare Worker in front of the static site, for personal links and RSVPs. `apps-script`: the family's Google Sheet.
- Live at https://ranchiwedspune.in, deployed by Cloudflare Workers Builds on every push to `main`.
- `tests`: unit and end-to-end tests (`npm test`), and the golden checks against the approved prototype in `design/prototype`.

Docs: [research](docs/01-research.md) · [design](docs/02-design.md) · [build plan](docs/03-build-plan.md) · [runbook](docs/04-runbook.md) · [art sources](docs/05-art-sources.md).

```sh
npm install
npm run build     # static site in dist/, with a size and privacy check
npm test          # everything, against the Worker locally and a mock Sheet
```
