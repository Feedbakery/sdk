import { useEffect, useRef } from 'react'
import { createBoard } from '@feedbakery/sdk'
import type { Board, BoardConfig, IdentifyData } from '@feedbakery/sdk'

export interface FeedbakeryBoardProps {
  workspace: string
  board: string
  theme?: BoardConfig['theme']
  locale?: string
  baseUrl?: string
  height?: BoardConfig['height']
  identify?: IdentifyData
  onReady?: () => void
  onResize?: (payload: { height: number }) => void
  className?: string
  style?: React.CSSProperties
}

const stableIdentify = (id: IdentifyData | undefined): string =>
  id ? `${id.email}|${id.name ?? ''}` : ''

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
