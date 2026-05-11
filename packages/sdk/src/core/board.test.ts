import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createBoard } from './board'
import type { Board } from '../types'

const flush = () => new Promise((r) => setTimeout(r, 0))

const fireMessage = (board: Board, data: unknown) => {
  const event = new MessageEvent('message', {
    data,
    origin: 'https://app.feedbakery.io',
    source: board.iframe.contentWindow,
  })
  window.dispatchEvent(event)
}

describe('createBoard', () => {
  let host: HTMLDivElement

  beforeEach(() => {
    host = document.createElement('div')
    host.id = 'host'
    document.body.appendChild(host)
  })

  afterEach(() => {
    host.remove()
  })

  it('throws when target selector does not match', () => {
    expect(() =>
      createBoard({ workspace: 'a', board: 'b', target: '#nope' }),
    ).toThrow(/Target element not found/)
  })

  it('throws when workspace or board missing', () => {
    expect(() =>
      createBoard({ workspace: '', board: 'b', target: host }),
    ).toThrow(/required/)
  })

  it('mounts an iframe inside the target', () => {
    const board = createBoard({ workspace: 'acme', board: 'ideas', target: host })
    expect(host.querySelector('iframe')).toBe(board.iframe)
    expect(board.iframe.src).toContain('/embed/acme/feedback/ideas')
    board.destroy()
  })

  it('emits ready when iframe posts feedbakery:ready', async () => {
    const board = createBoard({ workspace: 'acme', board: 'ideas', target: host })
    const ready = vi.fn()
    board.on('ready', ready)
    fireMessage(board, { type: 'feedbakery:ready' })
    await flush()
    expect(ready).toHaveBeenCalledTimes(1)
    board.destroy()
  })

  it('auto-resizes iframe height on resize message', async () => {
    const board = createBoard({ workspace: 'acme', board: 'ideas', target: host })
    fireMessage(board, { type: 'feedbakery:resize', height: 720 })
    await flush()
    expect(board.iframe.style.height).toBe('720px')
    board.destroy()
  })

  it('does not auto-resize when height is fixed', async () => {
    const board = createBoard({
      workspace: 'acme',
      board: 'ideas',
      target: host,
      height: 500,
    })
    expect(board.iframe.style.height).toBe('500px')
    fireMessage(board, { type: 'feedbakery:resize', height: 720 })
    await flush()
    expect(board.iframe.style.height).toBe('500px')
    board.destroy()
  })

  it('ignores messages from other origins', async () => {
    const board = createBoard({ workspace: 'acme', board: 'ideas', target: host })
    const ready = vi.fn()
    board.on('ready', ready)
    const evt = new MessageEvent('message', {
      data: { type: 'feedbakery:ready' },
      origin: 'https://evil.example',
      source: board.iframe.contentWindow,
    })
    window.dispatchEvent(evt)
    await flush()
    expect(ready).not.toHaveBeenCalled()
    board.destroy()
  })

  it('unsubscribes via off()', async () => {
    const board = createBoard({ workspace: 'acme', board: 'ideas', target: host })
    const ready = vi.fn()
    board.on('ready', ready)
    board.off('ready', ready)
    fireMessage(board, { type: 'feedbakery:ready' })
    await flush()
    expect(ready).not.toHaveBeenCalled()
    board.destroy()
  })

  it('queues identify until iframe is ready', async () => {
    const board = createBoard({
      workspace: 'acme',
      board: 'ideas',
      target: host,
      identify: { email: 'jane@x.com', name: 'Jane' },
    })
    expect(board.iframe.src).toContain('fbk_email=jane%40x.com')
    const post = vi.fn()
    const mockWindow = { postMessage: post }
    Object.defineProperty(board.iframe, 'contentWindow', {
      configurable: true,
      get: () => mockWindow,
    })
    const event = new MessageEvent('message', {
      data: { type: 'feedbakery:ready' },
      origin: 'https://app.feedbakery.io',
      source: mockWindow as unknown as MessageEventSource,
    })
    window.dispatchEvent(event)
    await flush()
    expect(post).toHaveBeenCalledWith(
      { type: 'feedbakery:identify', user: { email: 'jane@x.com', name: 'Jane' } },
      'https://app.feedbakery.io',
    )
    board.destroy()
  })

  it('destroy() removes the iframe and detaches listeners', async () => {
    const board = createBoard({ workspace: 'acme', board: 'ideas', target: host })
    const ready = vi.fn()
    board.on('ready', ready)
    board.destroy()
    expect(host.querySelector('iframe')).toBeNull()
    fireMessage(board, { type: 'feedbakery:ready' })
    await flush()
    expect(ready).not.toHaveBeenCalled()
  })
})
