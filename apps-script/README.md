# The family's Google Sheet

`Code.gs` goes into the Sheet's Apps Script (Extensions → Apps Script). It:
- receives each RSVP from the site (`doPost`), checks the shared secret, logs it, and keeps one up-to-date row per family;
- adds a **Wedding** menu: set up the tabs, generate codes, publish the guest list to Cloudflare, clear test replies.

Setup, script properties and deployment are in [docs/04-runbook.md](../docs/04-runbook.md#2-the-google-sheet).
`guests-template.csv` shows the Guests columns with two made-up test rows; import it into the Guests tab if you like.
