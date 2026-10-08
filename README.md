# Rentun

Early-stage local browser prototype. No customers, funding, founder identity, or Claude integration are claimed. Deployment and application submission require owner authorization.

Preview: `python -m http.server 4173 --bind 127.0.0.1`, then open http://127.0.0.1:4173 . Production requires HTTPS. Deploy only index.html, styles.css, app.js.

Before application: confirm the product direction, provide real founder identity and a verified company mailbox, authorize deployment, verify live functionality. Never describe planned Claude integration as available.

Official eligibility checked October 9, 2026: https://claude.com/programs/startups . Current FAQ: founded within five years or funded within two; Claude Console account; company email matching website domain; product description. Bootstrapped companies may apply. Approval remains Anthropic discretion.

## Verification

Browser behavior checks passed October 9, 2026: create, persistence after reload, literal rendering of HTML input, status update and filtering, JSON download contents, canceled/confirmed deletion, blank-input rejection, section links, no horizontal overflow at 320/390/768/1440 pixels, corrupt-storage protection, and failed-write input preservation. No page errors in that run. Desktop screenshot inspected. These are local browser checks, not production or Claude API verification.

Rerun: start the preview server, then execute browser-check.js through Playwright MCP browser_run_code_unsafe with its absolute filename. The file exports an async function expression accepting a Playwright page and uses a separate disposable context. No test framework needed. app.js also passes node --check. Graphify local structural graph generated; no semantic API calls.

Outstanding: owner confirmation of product direction, real founder/business identity, contact mailbox (contact@rentun.pp.ua), deployment authorization, public HTTPS verification, and the owner's truthful application. None of these are replaced by a polished website.
