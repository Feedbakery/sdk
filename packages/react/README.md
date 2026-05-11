# @feedbakery/react

React wrapper around [`@feedbakery/sdk`](https://www.npmjs.com/package/@feedbakery/sdk). Drop a Feedbakery feedback board into any React 18+ or 19 application.

```bash
npm install @feedbakery/react @feedbakery/sdk
```

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
