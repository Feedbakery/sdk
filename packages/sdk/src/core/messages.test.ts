import { describe, expect, it } from 'vitest'
import { isWidgetMessage } from './messages'

describe('isWidgetMessage', () => {
  it('accepts feedbakery:ready', () => {
    expect(isWidgetMessage({ type: 'feedbakery:ready' })).toBe(true)
  })

  it('accepts feedbakery:resize with numeric height', () => {
    expect(isWidgetMessage({ type: 'feedbakery:resize', height: 420 })).toBe(true)
  })

  it('rejects feedbakery:resize without height', () => {
    expect(isWidgetMessage({ type: 'feedbakery:resize' })).toBe(false)
    expect(isWidgetMessage({ type: 'feedbakery:resize', height: '420' })).toBe(false)
  })

  it('rejects unknown types', () => {
    expect(isWidgetMessage({ type: 'feedbakery:unknown' })).toBe(false)
    expect(isWidgetMessage({ type: 'other:ready' })).toBe(false)
  })

  it('rejects non-objects', () => {
    expect(isWidgetMessage(null)).toBe(false)
    expect(isWidgetMessage(undefined)).toBe(false)
    expect(isWidgetMessage('feedbakery:ready')).toBe(false)
    expect(isWidgetMessage(42)).toBe(false)
  })
})
