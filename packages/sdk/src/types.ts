/**
 * Color theme applied to the embedded board.
 * - `'light'` / `'dark'` — force a theme regardless of the user's OS preference.
 * - `'system'` — follow the user's OS preference (default).
 */
export type Theme = 'light' | 'dark' | 'system'

/**
 * Identity payload for Tier 1 (open) authentication. Pre-creates or matches a
 * workspace user from your already-authenticated host application. The
 * workspace must have `iframe_auth_mode` set to `open` for the embed to accept
 * this identity. HMAC-signed (Tier 2) and partner-token (Tier 3) flows are
 * planned for v0.2 and will use separate config fields.
 */
export interface IdentifyData {
  /** Email address of the end user. Used as the workspace user identifier. */
  email: string
  /** Optional display name shown alongside the user's posts and comments. */
  name?: string
}

/**
 * Configuration passed to {@link createBoard}.
 *
 * @example
 * ```ts
 * createBoard({
 *   workspace: 'acme',
 *   board: 'feature-requests',
 *   target: '#fbk-root',
 *   theme: 'system',
 * })
 * ```
 */
export interface BoardConfig {
  /** Your workspace slug, e.g. `'acme'`. */
  workspace: string
  /** The board slug within the workspace, e.g. `'feature-requests'`. */
  board: string
  /**
   * Where to mount the iframe. Either a CSS selector resolved against the
   * document, or a direct `HTMLElement` reference. The element must exist
   * before `createBoard` is called.
   */
  target: string | HTMLElement
  /** Color theme. Defaults to `'system'`. */
  theme?: Theme
  /** Force a UI locale (e.g. `'en'`, `'fr'`). Defaults to the workspace's setting. */
  locale?: string
  /**
   * Override the Feedbakery host. Defaults to `'https://app.feedbakery.io'`.
   * Useful for staging environments or self-hosted deployments.
   */
  baseUrl?: string
  /**
   * Iframe height behavior. `'auto'` (default) tracks the embed's content
   * height via `postMessage`. A number sets a fixed pixel height and disables
   * auto-resize.
   */
  height?: 'auto' | number
  /** Tier 1 (open) user identification. See {@link IdentifyData}. */
  identify?: IdentifyData
}

/**
 * Map of event names to their payload types. Used by {@link Board.on} and
 * {@link Board.off} for type-safe event handling.
 *
 * - `ready` — fires once when the embedded board has mounted and is ready
 *   to receive messages.
 * - `resize` — fires whenever the embed's content height changes (only
 *   meaningful when `height: 'auto'`).
 */
export interface BoardEventMap {
  ready: void
  resize: { height: number }
}

/** Union of all event names emitted by a {@link Board}. */
export type BoardEventName = keyof BoardEventMap

/** Callback signature for a given event name. */
export type BoardEventCallback<E extends BoardEventName> = (
  payload: BoardEventMap[E],
) => void

/**
 * Handle returned by {@link createBoard}. Controls the iframe lifecycle,
 * runtime identity, and event subscriptions.
 */
export interface Board {
  /** The underlying iframe element. Mounted into the configured target. */
  readonly iframe: HTMLIFrameElement
  /**
   * Subscribe to a board event. Multiple callbacks may be registered for the
   * same event; duplicate registrations of the same function are deduped.
   */
  on<E extends BoardEventName>(event: E, cb: BoardEventCallback<E>): void
  /** Unsubscribe a previously-registered callback. */
  off<E extends BoardEventName>(event: E, cb: BoardEventCallback<E>): void
  /**
   * Update the identified user at runtime without re-mounting the iframe.
   * Safe to call before the embed has fired `ready` — the identity is queued
   * and delivered once the embed is mounted.
   */
  identify(data: IdentifyData): void
  /** Tear down the iframe, detach listeners, and clear subscriptions. */
  destroy(): void
}
