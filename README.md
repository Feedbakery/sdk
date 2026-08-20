# Feedbakery SDK

[![npm @feedbakery/sdk](https://img.shields.io/npm/v/@feedbakery/sdk?label=%40feedbakery%2Fsdk)](https://www.npmjs.com/package/@feedbakery/sdk)
[![npm @feedbakery/react](https://img.shields.io/npm/v/@feedbakery/react?label=%40feedbakery%2Freact)](https://www.npmjs.com/package/@feedbakery/react)
[![CI](https://github.com/feedbakery/sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/feedbakery/sdk/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

Embed a [Feedbakery](https://feedbakery.io) feedback board on any website. Two packages, one shared core.

| Package | What it is | Size (gzip) |
|---|---|---|
| [`@feedbakery/sdk`](./packages/sdk) | Framework-agnostic core. Works with any bundler, as a `<script>` tag from a CDN, or as a `<feedbakery-board>` web component. | ~2 kB |
| [`@feedbakery/react`](./packages/react) | Thin React 18/19 component wrapper around `@feedbakery/sdk`. | <1 kB |

```bash
# Vanilla / any framework
npm install @feedbakery/sdk

# React
npm install @feedbakery/react @feedbakery/sdk
```

## 30-second example

```ts
import { createBoard } from '@feedbakery/sdk'

createBoard({
  workspace: 'acme',
  board: 'feature-requests',
  target: '#fbk-root',
  theme: 'system',
})
```

```html
<div id="fbk-root"></div>
```

Or as a single `<script>` tag with no bundler:

```html
<script
  src="https://cdn.jsdelivr.net/npm/@feedbakery/sdk@0.1/dist/feedbakery.iife.js"
  data-workspace="acme"
  data-board="feature-requests"
  async></script>
```

Or in React:

```tsx
import { FeedbakeryBoard } from '@feedbakery/react'

export const FeaturePortal = () => (
  <FeedbakeryBoard workspace="acme" board="feature-requests" theme="system" />
)
```

See each package's README for the full API: [`@feedbakery/sdk`](./packages/sdk/README.md), [`@feedbakery/react`](./packages/react/README.md).

## How it works

The SDK is a thin loader. It mounts a sandboxed iframe pointing at your Feedbakery board on `app.feedbakery.io` and exchanges a small set of `postMessage` events (`feedbakery:ready`, `feedbakery:resize`, `feedbakery:identify`) with the iframe. All authentication, data fetching, voting, comments, real-time updates, etc. happen inside the iframe — the SDK never touches the Feedbakery API directly. This keeps the SDK tiny and means you upgrade your hosted board independently of your customers' websites.

### Security model

- The iframe is sandboxed (`allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox`).
- Inbound `postMessage` events are validated by **origin** and **source window** — a hostile iframe on the host page cannot forge events.
- Outbound `postMessage` always targets the resolved origin explicitly, never `*` — identify payloads cannot leak to a swapped iframe.
- The SDK has **zero runtime dependencies** and no XSS surface (no `eval`, no `innerHTML`, all DOM via `createElement`/`setAttribute`).

## Repository layout

```
.
├── packages/
│   ├── sdk/       # @feedbakery/sdk — framework-agnostic core
│   └── react/     # @feedbakery/react — React wrapper
├── scripts/
│   └── check-sdk-publish.mjs   # Pre-publish quality gate
└── .github/
    └── workflows/
        ├── ci.yml       # Runs on every PR
        └── publish.yml  # Publishes on sdk-v* / react-v* tags
```

## Development

```bash
pnpm install
pnpm typecheck   # type-check both packages
pnpm test        # run all tests
pnpm build       # build both packages
pnpm check       # run the publish-readiness gate
pnpm verify      # all of the above
```

## Contributing

Issues and PRs welcome — see [CONTRIBUTING.md](./CONTRIBUTING.md).

- **Bugs:** [open an issue](https://github.com/feedbakery/sdk/issues/new?template=bug_report.yml)
- **Feature requests:** [open an issue](https://github.com/feedbakery/sdk/issues/new?template=feature_request.yml)
- **Security:** please email `security@feedbakery.io` rather than opening a public issue

## About Feedbakery

[Feedbakery](https://feedbakery.io) is a feedback board platform for B2B SaaS — feature requests, voting, public roadmaps, and a changelog, all in one workspace. Flat pricing: free up to 100 posts, Pro at $20/mo per workspace.

- 🌐 **[feedbakery.io](https://feedbakery.io)** — product overview, features, customer stories
- 🚀 **[Sign up free](https://feedbakery.io/auth/register)** — no credit card required
- 💰 **[Pricing](https://feedbakery.io/pricing)** — flat $20/mo per workspace, no per-user fees
- 📰 **[Blog](https://feedbakery.io/blog)** — feedback-management how-tos and product updates

## License

MIT © [Feedbakery](https://feedbakery.io)
