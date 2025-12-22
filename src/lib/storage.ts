export const getStorageItem = <T extends string>(
  key: string,
  allowedValues: readonly T[]
): T | null => {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem(key)
  if (stored && allowedValues.includes(stored as T)) {
    return stored as T
  }
  return null
}

export const setStorageItem = (key: string, value: string): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, value)
}
