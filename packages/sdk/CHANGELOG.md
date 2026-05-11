# Changelog

## 0.1.0

Initial public release.

- `createBoard()` mounts a Feedbakery feedback board into any DOM element via iframe.
- `<script>` tag auto-init with `data-*` attributes for no-bundler sites.
- Web component `<feedbakery-board>` (auto-registered when imported via `@feedbakery/sdk/element` or the IIFE bundle, or manually via `defineBoardElement`).
- Anonymous browsing/voting/posting (subject to workspace settings).
- Tier 1 (open) `identify({ email, name })` for partner-side pre-identification.
- Auto-resize via `resize` postMessage; `ready` event when the iframe is mounted.

Not in 0.1.0 (planned for 0.2): `post:created` / `vote:cast` / `close` events, HMAC Tier 2 and partner-token Tier 3 auth, floating launcher position.
