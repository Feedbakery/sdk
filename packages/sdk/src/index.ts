export { createBoard } from './core/board'
export { defineBoardElement, FeedbakeryBoardElement } from './web-component/board-element'

export type {
  Board,
  BoardConfig,
  BoardEventCallback,
  BoardEventMap,
  BoardEventName,
  IdentifyData,
  Theme,
} from './types'

/** Semver of this SDK build. Kept in sync with `package.json` at publish time. */
export const VERSION = '0.1.1'
