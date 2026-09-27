# Shreyansh & Mrunalini · 8 & 9 December 2026

The wedding invitation: one page, personal for each family, in English, मराठी and हिंदी. Paithani meets Madhubani.

- `src/data/wedding.ts`: every word on the page. `src/art`: the peacocks and event art, drawn in code.
- `src/components`, `src/styles`, `src/scripts` (essentials) and `src/scripts/motion` (animation, loaded after).
- `functions` + `server`: Cloudflare Pages Functions for personal links and RSVPs. `apps-script`: the family's Google Sheet.
- `tests`: unit and end-to-end tests (`npm test`), and the golden checks against the approved prototype in `design/prototype`.

Docs: [research](docs/01-research.md) · [design](docs/02-design.md) · [build plan](docs/03-build-plan.md) · [runbook](docs/04-runbook.md).

```sh
npm install
npm run build     # static site in dist/, with a size and privacy check
npm test          # everything, against local Cloudflare Pages and a mock Sheet
```
