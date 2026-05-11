import type { BoardConfig, IdentifyData } from '../types'

export const DEFAULT_BASE_URL = 'https://app.feedbakery.io'

export const buildIframeUrl = (
  config: BoardConfig,
  identify: IdentifyData | null,
): string => {
  const base = (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, '')
  const url = new URL(
    `${base}/embed/${encodeURIComponent(config.workspace)}/feedback/${encodeURIComponent(config.board)}`,
  )

  if (config.theme && config.theme !== 'system') {
    url.searchParams.set('theme', config.theme)
  }
  if (config.locale) {
    url.searchParams.set('locale', config.locale)
  }
  if (identify?.email) {
    url.searchParams.set('fbk_email', identify.email)
    if (identify.name) url.searchParams.set('fbk_name', identify.name)
  }

  return url.toString()
}

export const getOrigin = (baseUrl: string): string => new URL(baseUrl).origin
