/**
 * オプションのプレフィックス付きでユニークIDを生成
 * フォーマット: [prefix-]timestamp-random
 */
export const generateId = (prefix?: string): string => {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  return prefix ? `${prefix}-${id}` : id
}
