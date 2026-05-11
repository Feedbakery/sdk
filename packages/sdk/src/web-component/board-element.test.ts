import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineBoardElement } from './board-element'

describe('feedbakery-board element', () => {
  beforeEach(() => {
    defineBoardElement()
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('mounts an iframe when workspace and board are set', async () => {
    const el = document.createElement('feedbakery-board')
    el.setAttribute('workspace', 'acme')
    el.setAttribute('board', 'ideas')
    document.body.appendChild(el)

    await new Promise((r) => queueMicrotask(() => r(null)))

    const iframe = el.querySelector('iframe')
    expect(iframe).not.toBeNull()
    expect(iframe?.src).toContain('/embed/acme/feedback/ideas')
  })

  it('rebuilds iframe when attributes change', async () => {
    const el = document.createElement('feedbakery-board')
    el.setAttribute('workspace', 'acme')
    el.setAttribute('board', 'ideas')
    document.body.appendChild(el)
    await new Promise((r) => queueMicrotask(() => r(null)))

    el.setAttribute('theme', 'dark')
    await new Promise((r) => queueMicrotask(() => r(null)))

    const iframe = el.querySelector('iframe')
    expect(iframe?.src).toContain('theme=dark')
  })

  it('does nothing without required attributes', async () => {
    const el = document.createElement('feedbakery-board')
    document.body.appendChild(el)
    await new Promise((r) => queueMicrotask(() => r(null)))
    expect(el.querySelector('iframe')).toBeNull()
  })
})
