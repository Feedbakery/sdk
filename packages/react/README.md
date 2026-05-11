# @feedbakery/react

The official React 18/19 component wrapper for the [Feedbakery](https://feedbakery.io) feedback board. Built on [`@feedbakery/sdk`](https://www.npmjs.com/package/@feedbakery/sdk) — install both.

```bash
npm install @feedbakery/react @feedbakery/sdk
```

> **Not using React?** Use [`@feedbakery/sdk`](https://www.npmjs.com/package/@feedbakery/sdk) directly — it ships an `<feedbakery-board>` web component, a CDN-friendly IIFE bundle with auto-init via `<script>` tag, and a plain `createBoard()` function for any framework.

## Quick start

```tsx
import { FeedbakeryBoard } from '@feedbakery/react'

export const FeaturePortal = () => (
  <FeedbakeryBoard
    workspace="acme"
    board="feature-requests"
    theme="system"
    style={{ minHeight: 400 }}
    onReady={() => console.log('board ready')}
  />
)
```

## Props

| Prop | Type | Description |
|---|---|---|
| `workspace` | `string` | Workspace slug (required) |
| `board` | `string` | Board slug (required) |
| `theme` | `'light' \| 'dark' \| 'system'` | Forced theme |
| `locale` | `string` | UI locale |
| `baseUrl` | `string` | Override Feedbakery host |
| `height` | `'auto' \| number` | Auto-resize (default) or fixed pixel height |
| `identify` | `{ email; name? }` | Tier 1 (open) pre-identification |
| `onReady` | `() => void` | Fires when the iframe finishes loading |
| `onResize` | `({ height }) => void` | Fires on iframe content resize |
| `className`, `style` | — | Forwarded to the wrapper `<div>` |

Changing `workspace`, `board`, `theme`, `locale`, `baseUrl`, or `height` re-mounts the iframe. Changing `identify` updates the workspace user without re-mounting.

See the [`@feedbakery/sdk` README](https://www.npmjs.com/package/@feedbakery/sdk) for full SDK details.

## License

MIT © Feedbakery
