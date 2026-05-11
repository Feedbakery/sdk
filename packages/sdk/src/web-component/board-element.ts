import { createBoard } from '../core/board'
import type { Board, BoardConfig, IdentifyData, Theme } from '../types'

const TAG_NAME = 'feedbakery-board'

const OBSERVED_ATTRS = [
  'workspace',
  'board',
  'theme',
  'locale',
  'base-url',
  'height',
  'email',
  'name',
] as const

const isTheme = (value: string | null): value is Theme =>
  value === 'light' || value === 'dark' || value === 'system'

const parseHeight = (value: string | null): BoardConfig['height'] => {
  if (!value || value === 'auto') return 'auto'
  const n = Number(value)
  return Number.isFinite(n) ? n : 'auto'
}

class FeedbakeryBoardElement extends HTMLElement {
  static get observedAttributes(): readonly string[] {
    return OBSERVED_ATTRS
  }

  private board: Board | null = null
  private mount: HTMLDivElement | null = null
  private rebuildPending = false

  connectedCallback(): void {
    if (!this.mount) {
      this.mount = document.createElement('div')
      this.mount.style.width = '100%'
      this.appendChild(this.mount)
    }
    this.style.display ||= 'block'
    this.rebuild()
  }

  disconnectedCallback(): void {
    this.board?.destroy()
    this.board = null
  }

  attributeChangedCallback(): void {
    if (!this.isConnected || !this.mount) return
    if (this.rebuildPending) return
    this.rebuildPending = true
    queueMicrotask(() => {
      this.rebuildPending = false
      this.rebuild()
    })
  }

  identify(data: IdentifyData): void {
    this.board?.identify(data)
  }

  on: Board['on'] = (event, cb) => this.board?.on(event, cb)
  off: Board['off'] = (event, cb) => this.board?.off(event, cb)

  private rebuild(): void {
    if (!this.mount) return

    const workspace = this.getAttribute('workspace')
    const board = this.getAttribute('board')
    if (!workspace || !board) return

    this.board?.destroy()

    const email = this.getAttribute('email')
    const identify: IdentifyData | undefined = email
      ? { email, name: this.getAttribute('name') ?? undefined }
      : undefined

    const themeAttr = this.getAttribute('theme')
    const baseUrl = this.getAttribute('base-url') ?? undefined
    const locale = this.getAttribute('locale') ?? undefined

    this.board = createBoard({
      workspace,
      board,
      target: this.mount,
      theme: isTheme(themeAttr) ? themeAttr : undefined,
      locale,
      baseUrl,
      height: parseHeight(this.getAttribute('height')),
      identify,
    })
  }
}

export const defineBoardElement = (
  name: string = TAG_NAME,
): typeof FeedbakeryBoardElement => {
  if (typeof window === 'undefined' || !window.customElements) {
    return FeedbakeryBoardElement
  }
  if (!window.customElements.get(name)) {
    window.customElements.define(name, FeedbakeryBoardElement)
  }
  return FeedbakeryBoardElement
}

export { FeedbakeryBoardElement }
