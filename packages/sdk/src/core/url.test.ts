import { describe, expect, it } from 'vitest'
import { buildIframeUrl, getOrigin, DEFAULT_BASE_URL } from './url'

describe('buildIframeUrl', () => {
  const base = { workspace: 'acme', board: 'feature-requests', target: '#x' } as const

  it('builds a default URL with no query params when theme is system', () => {
    expect(buildIframeUrl({ ...base, theme: 'system' }, null)).toBe(
      `${DEFAULT_BASE_URL}/embed/acme/feedback/feature-requests`,
    )
  })

  it('forwards theme when set to light/dark', () => {
    expect(buildIframeUrl({ ...base, theme: 'dark' }, null)).toContain('theme=dark')
    expect(buildIframeUrl({ ...base, theme: 'light' }, null)).toContain('theme=light')
  })

  it('forwards locale', () => {
    expect(buildIframeUrl({ ...base, locale: 'fr' }, null)).toContain('locale=fr')
  })

  it('forwards Tier 1 identify params when provided', () => {
    const url = buildIframeUrl(base, { email: 'jane@x.com', name: 'Jane Doe' })
    expect(url).toContain('fbk_email=jane%40x.com')
    expect(url).toContain('fbk_name=Jane+Doe')
  })

  it('omits identify params when not provided', () => {
    const url = buildIframeUrl(base, null)
    expect(url).not.toContain('fbk_email')
    expect(url).not.toContain('fbk_name')
  })

  it('respects baseUrl override and trims trailing slash', () => {
    const url = buildIframeUrl({ ...base, baseUrl: 'https://staging.feedbakery.io/' }, null)
    expect(url).toBe('https://staging.feedbakery.io/embed/acme/feedback/feature-requests')
  })

  it('encodes slugs with special characters', () => {
    const url = buildIframeUrl(
      { workspace: 'a/b', board: 'with space', target: '#x' },
      null,
    )
    expect(url).toContain('/embed/a%2Fb/feedback/with%20space')
  })
})

describe('getOrigin', () => {
  it('returns the origin of the URL', () => {
    expect(getOrigin('https://app.feedbakery.io')).toBe('https://app.feedbakery.io')
    expect(getOrigin('https://app.feedbakery.io/foo/bar?x=1')).toBe('https://app.feedbakery.io')
  })
})
