import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import { FeedbakeryBoard } from './feedbakery-board'

afterEach(cleanup)

describe('<FeedbakeryBoard />', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('renders an iframe with the right src', () => {
    const { container } = render(
      <FeedbakeryBoard workspace="acme" board="ideas" theme="dark" />,
    )
    const iframe = container.querySelector('iframe')
    expect(iframe).not.toBeNull()
    expect(iframe?.src).toContain('/embed/acme/feedback/ideas')
    expect(iframe?.src).toContain('theme=dark')
  })

  it('re-mounts when board prop changes', () => {
    const { container, rerender } = render(
      <FeedbakeryBoard workspace="acme" board="ideas" />,
    )
    const first = container.querySelector('iframe')
    rerender(<FeedbakeryBoard workspace="acme" board="bugs" />)
    const second = container.querySelector('iframe')
    expect(second).not.toBe(first)
    expect(second?.src).toContain('/feedback/bugs')
  })

  it('calls onReady when iframe posts feedbakery:ready', async () => {
    const onReady = vi.fn()
    const { container } = render(
      <FeedbakeryBoard workspace="acme" board="ideas" onReady={onReady} />,
    )
    const iframe = container.querySelector('iframe')!
    window.dispatchEvent(
      new MessageEvent('message', {
        data: { type: 'feedbakery:ready' },
        origin: 'https://app.feedbakery.io',
        source: iframe.contentWindow,
      }),
    )
    await new Promise((r) => setTimeout(r, 0))
    expect(onReady).toHaveBeenCalledTimes(1)
  })

  it('cleans up on unmount', () => {
    const { container, unmount } = render(
      <FeedbakeryBoard workspace="acme" board="ideas" />,
    )
    expect(container.querySelector('iframe')).not.toBeNull()
    unmount()
    expect(container.querySelector('iframe')).toBeNull()
  })
})
