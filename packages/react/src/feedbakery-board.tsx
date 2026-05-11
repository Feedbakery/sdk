import { useEffect, useRef } from 'react'
import { createBoard } from '@feedbakery/sdk'
import type { Board, BoardConfig, IdentifyData } from '@feedbakery/sdk'

/**
 * Props accepted by {@link FeedbakeryBoard}. Mirrors {@link BoardConfig} from
 * `@feedbakery/sdk` plus React-shaped event handlers and standard DOM props.
 */
export interface FeedbakeryBoardProps {
  /** Your workspace slug, e.g. `'acme'`. */
  workspace: string
  /** The board slug within the workspace, e.g. `'feature-requests'`. */
  board: string
  /** Color theme: `'light' | 'dark' | 'system'`. Defaults to `'system'`. */
  theme?: BoardConfig['theme']
  /** Force a UI locale. Defaults to the workspace's setting. */
  locale?: string
  /** Override the Feedbakery host. Defaults to `'https://app.feedbakery.io'`. */
  baseUrl?: string
  /** `'auto'` (default) auto-resizes with content; a number sets fixed pixel height. */
  height?: BoardConfig['height']
  /**
   * Tier 1 (open) user identification. Updates without re-mounting the iframe
   * when the value changes. See `@feedbakery/sdk`'s `IdentifyData`.
   */
  identify?: IdentifyData
  /** Fired once when the embed iframe has mounted and is ready to receive messages. */
  onReady?: () => void
  /** Fired whenever the embed's content height changes (only when `height: 'auto'`). */
  onResize?: (payload: { height: number }) => void
  /** Forwarded to the wrapper `<div>`. */
  className?: string
  /** Forwarded to the wrapper `<div>`. */
  style?: React.CSSProperties
}

const stableIdentify = (id: IdentifyData | undefined): string =>
  id ? `${id.email}|${id.name ?? ''}` : ''

/**
 * Renders a Feedbakery feedback board inside any React 18 or 19 application.
 *
 * Internally wraps {@link createBoard} from `@feedbakery/sdk`. Re-mounts the
 * iframe when any iframe-affecting prop changes (`workspace`, `board`, `theme`,
 * `locale`, `baseUrl`, `height`). The `identify` prop is applied imperatively
 * to the existing iframe, so updating it does not cause a re-mount.
 *
 * @example
 * ```tsx
 * import { FeedbakeryBoard } from '@feedbakery/react'
 *
 * export const FeaturePortal = () => (
 *   <FeedbakeryBoard
 *     workspace="acme"
 *     board="feature-requests"
 *     theme="system"
 *     onReady={() => console.log('board ready')}
 *   />
 * )
 * ```
 */
export const FeedbakeryBoard = ({
  workspace,
  board,
  theme,
  locale,
  baseUrl,
  height,
  identify,
  onReady,
  onResize,
  className,
  style,
}: FeedbakeryBoardProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const boardRef = useRef<Board | null>(null)
  const onReadyRef = useRef(onReady)
  const onResizeRef = useRef(onResize)

  useEffect(() => {
    onReadyRef.current = onReady
  }, [onReady])

  useEffect(() => {
    onResizeRef.current = onResize
  }, [onResize])

  useEffect(() => {
    if (!containerRef.current) return

    const instance = createBoard({
      workspace,
      board,
      target: containerRef.current,
      theme,
      locale,
      baseUrl,
      height,
      identify,
    })
    boardRef.current = instance

    const ready = () => onReadyRef.current?.()
    const resize = (p: { height: number }) => onResizeRef.current?.(p)
    instance.on('ready', ready)
    instance.on('resize', resize)

    return () => {
      instance.off('ready', ready)
      instance.off('resize', resize)
      instance.destroy()
      boardRef.current = null
    }
    // Re-mount when iframe-affecting config changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspace, board, theme, locale, baseUrl, height])

  // Update identify without remounting the iframe.
  const identifyKey = stableIdentify(identify)
  useEffect(() => {
    if (!identify || !boardRef.current) return
    boardRef.current.identify(identify)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identifyKey])

  return <div ref={containerRef} className={className} style={style} />
}
