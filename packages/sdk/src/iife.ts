import { createBoard } from './core/board'
import { defineBoardElement } from './web-component/board-element'
import { runAutoInit } from './core/auto-init'
import { VERSION } from './index'

const Feedbakery = {
  createBoard,
  defineBoardElement,
  version: VERSION,
}

;(globalThis as Record<string, unknown>).Feedbakery = Feedbakery

defineBoardElement()

const currentScript =
  (document.currentScript as HTMLScriptElement | null) ??
  document.querySelector<HTMLScriptElement>('script[data-workspace][data-board]')

if (currentScript?.dataset.workspace) {
  runAutoInit(currentScript)
}

export default Feedbakery
