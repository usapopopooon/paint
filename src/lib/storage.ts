/**
 * localStorageから値を取得（許可リストによる検証付き）
 * @param key - ストレージキー
 * @param allowedValues - 許可される値のリスト
 * @returns 保存された値（許可リストに含まれる場合）、またはnull
 */
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

/**
 * localStorageに値を保存
 * @param key - ストレージキー
 * @param value - 保存する値
 */
export const setStorageItem = (key: string, value: string): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, value)
}
