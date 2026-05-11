export type Theme = 'light' | 'dark' | 'system'

export interface IdentifyData {
  email: string
  name?: string
}

export interface BoardConfig {
  workspace: string
  board: string
  target: string | HTMLElement
  theme?: Theme
  locale?: string
  baseUrl?: string
  height?: 'auto' | number
  identify?: IdentifyData
}

export interface BoardEventMap {
  ready: void
  resize: { height: number }
}

export type BoardEventName = keyof BoardEventMap

export type BoardEventCallback<E extends BoardEventName> = (
  payload: BoardEventMap[E],
) => void

export interface Board {
  readonly iframe: HTMLIFrameElement
  on<E extends BoardEventName>(event: E, cb: BoardEventCallback<E>): void
  off<E extends BoardEventName>(event: E, cb: BoardEventCallback<E>): void
  identify(data: IdentifyData): void
  destroy(): void
}
