import type { BoardConfig, IdentifyData, Theme } from '../types'
import { createBoard } from './board'

const isTheme = (value: string | undefined): value is Theme =>
  value === 'light' || value === 'dark' || value === 'system'

const parseHeight = (value: string | undefined): BoardConfig['height'] => {
  if (!value || value === 'auto') return 'auto'
  const n = Number(value)
  return Number.isFinite(n) ? n : 'auto'
}

export const autoInitFromScript = (script: HTMLScriptElement): void => {
  const ds = script.dataset
  const workspace = ds.workspace
  const board = ds.board

  if (!workspace || !board) {
    console.warn(
      '[Feedbakery] <script> auto-init requires data-workspace and data-board attributes.',
    )
    return
  }

  const targetSel = ds.target
  const target = targetSel
    ? document.querySelector<HTMLElement>(targetSel)
    : null

  let mount: HTMLElement
  if (target) {
    mount = target
  } else {
    mount = document.createElement('div')
    mount.id = 'feedbakery-board-root'
    script.parentNode?.insertBefore(mount, script.nextSibling)
  }

  const identify: IdentifyData | undefined = ds.email
    ? { email: ds.email, name: ds.name }
    : undefined

  const config: BoardConfig = {
    workspace,
    board,
    target: mount,
    theme: isTheme(ds.theme) ? ds.theme : undefined,
    locale: ds.locale,
    baseUrl: ds.baseUrl,
    height: parseHeight(ds.height),
    identify,
  }

  createBoard(config)
}

export const runAutoInit = (script: HTMLScriptElement | null): void => {
  if (!script) return
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => autoInitFromScript(script), {
      once: true,
    })
  } else {
    autoInitFromScript(script)
  }
}
