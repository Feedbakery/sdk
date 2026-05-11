import type {
  Board,
  BoardConfig,
  BoardEventCallback,
  BoardEventMap,
  BoardEventName,
  IdentifyData,
} from '../types'
import { isWidgetMessage, type SdkToWidgetMessage } from './messages'
import { DEFAULT_BASE_URL, buildIframeUrl, getOrigin } from './url'

const IFRAME_TITLE = 'Feedbakery feedback board'

const resolveTarget = (target: BoardConfig['target']): HTMLElement => {
  if (typeof target === 'string') {
    const el = document.querySelector<HTMLElement>(target)
    if (!el) {
      throw new Error(
        `[Feedbakery] Target element not found: ${target}. Mount the SDK after the element exists in the DOM.`,
      )
    }
    return el
  }
  return target
}

class BoardImpl implements Board {
  readonly iframe: HTMLIFrameElement
  private readonly target: HTMLElement
  private readonly origin: string
  private readonly listeners = new Map<BoardEventName, Set<(payload: unknown) => void>>()
  private currentIdentify: IdentifyData | null
  private destroyed = false
  private autoHeight: boolean

  constructor(private readonly config: BoardConfig) {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      throw new Error('[Feedbakery] createBoard must be called in a browser environment.')
    }
    if (!config.workspace || !config.board) {
      throw new Error('[Feedbakery] `workspace` and `board` are required.')
    }

    this.target = resolveTarget(config.target)
    this.currentIdentify = config.identify ?? null
    this.autoHeight = config.height === undefined || config.height === 'auto'
    this.origin = getOrigin(config.baseUrl ?? DEFAULT_BASE_URL)

    this.iframe = this.createIframe()
    this.target.appendChild(this.iframe)

    window.addEventListener('message', this.handleMessage)
  }

  on<E extends BoardEventName>(event: E, cb: BoardEventCallback<E>): void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set())
    this.listeners.get(event)!.add(cb as (payload: unknown) => void)
  }

  off<E extends BoardEventName>(event: E, cb: BoardEventCallback<E>): void {
    this.listeners.get(event)?.delete(cb as (payload: unknown) => void)
  }

  identify(data: IdentifyData): void {
    this.currentIdentify = data
    if (this.iframe.contentWindow) {
      this.post({ type: 'feedbakery:identify', user: data })
    }
  }

  destroy(): void {
    if (this.destroyed) return
    this.destroyed = true
    window.removeEventListener('message', this.handleMessage)
    this.iframe.remove()
    this.listeners.clear()
  }

  private createIframe(): HTMLIFrameElement {
    const iframe = document.createElement('iframe')
    iframe.src = buildIframeUrl(this.config, this.currentIdentify)
    iframe.title = IFRAME_TITLE
    iframe.setAttribute('loading', 'lazy')
    iframe.setAttribute('allowtransparency', 'true')
    iframe.setAttribute(
      'sandbox',
      'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox',
    )

    iframe.style.width = '100%'
    iframe.style.border = '0'
    iframe.style.display = 'block'

    if (this.autoHeight) {
      iframe.style.minHeight = '300px'
    } else {
      iframe.style.height = `${this.config.height as number}px`
    }

    return iframe
  }

  private handleMessage = (event: MessageEvent): void => {
    if (event.source !== this.iframe.contentWindow) return
    if (event.origin !== this.origin) return
    if (!isWidgetMessage(event.data)) return

    switch (event.data.type) {
      case 'feedbakery:ready':
        if (this.currentIdentify) {
          this.post({ type: 'feedbakery:identify', user: this.currentIdentify })
        }
        this.emit('ready', undefined)
        break
      case 'feedbakery:resize':
        if (this.autoHeight && event.data.height > 0) {
          this.iframe.style.height = `${event.data.height}px`
        }
        this.emit('resize', { height: event.data.height })
        break
    }
  }

  private post(message: SdkToWidgetMessage): void {
    this.iframe.contentWindow?.postMessage(message, this.origin)
  }

  private emit<E extends BoardEventName>(event: E, payload: BoardEventMap[E]): void {
    this.listeners.get(event)?.forEach((cb) => cb(payload))
  }
}

/**
 * Mount a Feedbakery feedback board into a DOM element.
 *
 * Creates a sandboxed iframe pointing at the configured Feedbakery host,
 * appends it to `config.target`, and returns a {@link Board} handle for
 * event subscription, identity updates, and lifecycle control.
 *
 * Must be called in a browser environment after the target element exists in
 * the DOM. Throws if `workspace`, `board`, or `target` is missing.
 *
 * @example
 * ```ts
 * import { createBoard } from '@feedbakery/sdk'
 *
 * const board = createBoard({
 *   workspace: 'acme',
 *   board: 'feature-requests',
 *   target: '#fbk-root',
 *   theme: 'system',
 * })
 *
 * board.on('ready', () => console.log('board ready'))
 * // later:
 * board.destroy()
 * ```
 *
 * @param config — see {@link BoardConfig}
 * @returns A {@link Board} handle to control the mounted iframe.
 */
export const createBoard = (config: BoardConfig): Board => new BoardImpl(config)
