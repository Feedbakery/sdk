# @feedbakery/sdk

Embed a Feedbakery feedback board on any website. The SDK renders an iframe pointing at your hosted Feedbakery board so users can browse, vote, and post — without leaving your site.

```bash
npm install @feedbakery/sdk
```

## Quick start

### Bundlers (Vite, webpack, Next.js, etc.)

```ts
import { createBoard } from '@feedbakery/sdk'

const board = createBoard({
  workspace: 'acme',
  board: 'feature-requests',
  target: '#fbk-root',
  theme: 'system',
})

board.on('ready', () => console.log('board ready'))
```

```html
<div id="fbk-root"></div>
```

### `<script>` tag (no bundler)

```html
<script
  src="https://cdn.jsdelivr.net/npm/@feedbakery/sdk@0.1/dist/feedbakery.iife.js"
  data-workspace="acme"
  data-board="feature-requests"
  data-theme="system"
  async
></script>
```

The script auto-mounts a board right after itself, or into `data-target="#selector"` if provided. After load, `window.Feedbakery.createBoard(...)` is also available for additional boards.

### Web Component

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@feedbakery/sdk@0.1/dist/element.mjs"></script>

<feedbakery-board
  workspace="acme"
  board="feature-requests"
  theme="dark"
  height="auto">
</feedbakery-board>
```

In bundlers, opt in with a side-effecting import:

```ts
import '@feedbakery/sdk/element'
```

Or register manually under a different tag name:

```ts
import { defineBoardElement } from '@feedbakery/sdk'
defineBoardElement('my-feedback-board')
```

## API

### `createBoard(config): Board`

| Option | Type | Required | Default | Description |
|---|---|---|---|---|
| `workspace` | `string` | yes | — | Your workspace slug |
| `board` | `string` | yes | — | Board slug |
| `target` | `string \| HTMLElement` | yes | — | Where to mount the iframe |
| `theme` | `'light' \| 'dark' \| 'system'` | no | `'system'` | Forced theme |
| `locale` | `string` | no | — | Forces a UI locale |
| `baseUrl` | `string` | no | `'https://app.feedbakery.io'` | Override (staging / self-hosted) |
| `height` | `'auto' \| number` | no | `'auto'` | `'auto'` resizes with content; a number sets a fixed pixel height |
| `identify` | `{ email; name? }` | no | — | Pre-fill the user (Tier 1 open mode — workspace must allow it) |

Returns a `Board`:

```ts
interface Board {
  readonly iframe: HTMLIFrameElement
  on(event: 'ready' | 'resize', cb: (payload) => void): void
  off(event, cb): void
  identify(data: { email: string; name?: string }): void
  destroy(): void
}
```

Events available in v0.1.0: `ready`, `resize`. More (`post:created`, `vote:cast`, `close`) are planned for v0.2.

### Identifying users

Anonymous browsing/voting/posting works out of the box (subject to your workspace's anonymous settings).

For Tier 1 ("open") identification — pre-create a workspace user from your logged-in partner account — pass `identify`:

```ts
createBoard({
  workspace: 'acme',
  board: 'feature-requests',
  target: '#fbk-root',
  identify: { email: 'jane@example.com', name: 'Jane' },
})
```

The workspace must have iframe auth mode set to `open` for this to be accepted.

HMAC-signed (Tier 2) and partner-token (Tier 3) flows are coming in v0.2.

## License

MIT © Feedbakery
