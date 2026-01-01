import { describe, test, expect, vi } from 'vitest'
import { translations, getTranslation, type TranslationKey } from './getTranslation'
import en from './en.json'
import ja from './ja.json'

// platformモジュールをモック
vi.mock('@/lib/platform', () => ({
  getModifierKey: vi.fn(() => '⌘'),
}))

describe('i18n/locales', () => {
  describe('translations', () => {
    test('英語と日本語の翻訳が存在する', () => {
      expect(translations.en).toBeDefined()
      expect(translations.ja).toBeDefined()
    })

    test('英語と日本語で同じキーが定義されている', () => {
      const enKeys = Object.keys(en).sort()
      const jaKeys = Object.keys(ja).sort()
      expect(enKeys).toEqual(jaKeys)
    })

    test('すべてのキーが空文字列でない', () => {
      for (const key of Object.keys(en) as TranslationKey[]) {
        expect(en[key]).not.toBe('')
        expect(ja[key]).not.toBe('')
      }
    })
  })

  describe('getTranslation', () => {
    test('英語の翻訳を取得できる', () => {
      expect(getTranslation('en', 'tools.pen')).toBe('Pen')
      expect(getTranslation('en', 'actions.undo')).toBe('Undo')
    })

    test('日本語の翻訳を取得できる', () => {
      expect(getTranslation('ja', 'tools.pen')).toBe('ペン')
      expect(getTranslation('ja', 'actions.undo')).toBe('元に戻す')
    })

    test('すべてのキーで翻訳を取得できる', () => {
      const keys = Object.keys(en) as TranslationKey[]
      for (const key of keys) {
        expect(typeof getTranslation('en', key)).toBe('string')
        expect(typeof getTranslation('ja', key)).toBe('string')
      }
    })
  })

  describe('翻訳キーの形式', () => {
    test('すべてのキーがドット記法のフラット形式である', () => {
      const keys = Object.keys(en)
      for (const key of keys) {
        // ドット記法: "category.name" または "category.subcategory.name" 形式
        expect(key).toMatch(/^[a-zA-Z]+(\.[a-zA-Z]+)+$/)
      }
    })

    test('期待されるカテゴリが含まれている', () => {
      const keys = Object.keys(en)
      const categories = new Set(keys.map((k) => k.split('.')[0]))
      expect(categories).toContain('tools')
      expect(categories).toContain('actions')
      expect(categories).toContain('theme')
      expect(categories).toContain('locale')
      expect(categories).toContain('shortcuts')
      expect(categories).toContain('messages')
      expect(categories).toContain('color')
      expect(categories).toContain('blendMode')
    })
  })

  describe('modifier placeholder replacement', () => {
    test('ショートカットの{modifier}がOS別の修飾キーに置換される', async () => {
      // モックは⌘を返すように設定済み
      const { getModifierKey } = await import('@/lib/platform')
      vi.mocked(getModifierKey).mockReturnValue('⌘')

      expect(getTranslation('en', 'shortcuts.undo')).toBe('⌘+Z')
      expect(getTranslation('en', 'shortcuts.redo')).toBe('⌘+Shift+Z')
      expect(getTranslation('en', 'shortcuts.clearLayer')).toBe('⌘+Delete')
    })

    test('Windows環境ではCtrlに置換される', async () => {
      const { getModifierKey } = await import('@/lib/platform')
      vi.mocked(getModifierKey).mockReturnValue('Ctrl')

      expect(getTranslation('en', 'shortcuts.undo')).toBe('Ctrl+Z')
      expect(getTranslation('ja', 'shortcuts.undo')).toBe('Ctrl+Z')
    })

    test('プレースホルダーを含まないキーは影響を受けない', async () => {
      const { getModifierKey } = await import('@/lib/platform')
      vi.mocked(getModifierKey).mockReturnValue('⌘')

      expect(getTranslation('en', 'tools.pen')).toBe('Pen')
      expect(getTranslation('ja', 'tools.pen')).toBe('ペン')
    })
  })
})
