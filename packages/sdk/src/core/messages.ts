import type { IdentifyData } from '../types'

export type SdkToWidgetMessage = {
  type: 'feedbakery:identify'
  user: IdentifyData
}

export type WidgetToSdkMessage =
  | { type: 'feedbakery:ready' }
  | { type: 'feedbakery:resize'; height: number }

export const isWidgetMessage = (data: unknown): data is WidgetToSdkMessage => {
  if (!data || typeof data !== 'object') return false
  const type = (data as { type?: unknown }).type
  if (typeof type !== 'string' || !type.startsWith('feedbakery:')) return false
  if (type === 'feedbakery:ready') return true
  if (type === 'feedbakery:resize') {
    return typeof (data as { height?: unknown }).height === 'number'
  }
  return false
}
