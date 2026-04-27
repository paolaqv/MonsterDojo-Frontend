const HTML_OR_SCRIPT_PATTERN =
  /<\s*\/?\s*[a-zA-Z][^>]*>|javascript:|data:text\/html|on[a-z]+\s*=/gi

const SENSITIVE_KEYS = new Set([
  'password',
  'current_password',
  'new_password',
  'token',
  'access_token',
  'authorization',
  'codigo',
])

export const sanitizeTextInput = (value) => {
  if (typeof value !== 'string') return value

  return value
    .replace(HTML_OR_SCRIPT_PATTERN, '')
    .replace(/[<>]/g, '')
    .trim()
}

export const sanitizePayload = (payload, key = '') => {
  if (payload === null || payload === undefined) return payload

  if (typeof payload === 'string') {
    return SENSITIVE_KEYS.has(String(key).toLowerCase())
      ? payload
      : sanitizeTextInput(payload)
  }

  if (Array.isArray(payload)) {
    return payload.map((item) => sanitizePayload(item, key))
  }

  if (typeof payload === 'object') {
    return Object.fromEntries(
      Object.entries(payload).map(([itemKey, itemValue]) => [
        itemKey,
        sanitizePayload(itemValue, itemKey),
      ])
    )
  }

  return payload
}
