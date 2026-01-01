import { describe, test, expect } from 'vitest'
import { i18nEn, i18nJa } from '@/test/i18n'
import en from './en.json'
import ja from './ja.json'

/**
 * オブジェクトからすべてのキーパスを取得
 * 例: { a: { b: 'c' } } -> ['a.b']
 */
const getKeyPaths = (obj: Record<string, unknown>, prefix = ''): string[] => {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return getKeyPaths(value as Record<string, unknown>, path)
    }
    return [path]
  })
}

describe('i18n', () => {
  test('英語の翻訳を取得できる', () => {
    expect(i18nEn.t('tools.pen')).toBe('Pen')
    expect(i18nEn.t('actions.undo')).toBe('Undo')
  })

  test('日本語の翻訳を取得できる', () => {
    expect(i18nJa.t('tools.pen')).toBe('ペン')
    expect(i18nJa.t('actions.undo')).toBe('元に戻す')
  })

  test('プレースホルダーが置換される', () => {
    expect(i18nEn.t('shortcuts.undo', { modifier: '⌘' })).toBe('⌘+Z')
    expect(i18nJa.t('shortcuts.undo', { modifier: 'Ctrl' })).toBe('Ctrl+Z')
  })

  test('英語と日本語の翻訳キーが一致する', () => {
    const enKeys = getKeyPaths(en).sort()
    const jaKeys = getKeyPaths(ja).sort()

    expect(enKeys).toEqual(jaKeys)
  })
})
