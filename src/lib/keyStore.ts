// Lightweight, SDK-free helpers so the heavy Anthropic SDK stays out of the
// main bundle. The SDK-using code lives in ./anthropic and is dynamically
// imported only when the user actually generates.

const KEY_STORAGE = 'asbp:anthropic-key'

export type ModelId = 'claude-opus-4-8' | 'claude-haiku-4-5'

export const MODELS: { id: ModelId; label: string; note: string }[] = [
  { id: 'claude-opus-4-8', label: 'Claude Opus 4.8', note: 'most capable' },
  { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5', note: 'faster / cheaper' },
]

export function getApiKey(): string {
  try {
    return localStorage.getItem(KEY_STORAGE) ?? ''
  } catch {
    return ''
  }
}

export function setApiKey(key: string): void {
  try {
    if (key) localStorage.setItem(KEY_STORAGE, key)
    else localStorage.removeItem(KEY_STORAGE)
  } catch {
    /* storage disabled */
  }
}

export function clearApiKey(): void {
  setApiKey('')
}
