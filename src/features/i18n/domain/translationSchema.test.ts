import { describe, test, expect } from 'vitest'
import { parseTranslation, validateTranslation } from './translationSchema'
import en from '../infrastructure/locales/en.json'
import ja from '../infrastructure/locales/ja.json'

describe('translationSchema', () => {
  describe('parseTranslation', () => {
    test('有効な翻訳データをパースする', () => {
      const result = parseTranslation({ 'test.key': 'value' })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data['test.key']).toBe('value')
      }
    })

    test('空オブジェクトをパースする', () => {
      const result = parseTranslation({})

      expect(result.success).toBe(true)
    })

    test('文字列以外の値は失敗する', () => {
      const result = parseTranslation({ key: 123 })

      expect(result.success).toBe(false)
    })

    test('ネストしたオブジェクトは失敗する', () => {
      const result = parseTranslation({ key: { nested: 'value' } })

      expect(result.success).toBe(false)
    })

    test('配列値は失敗する', () => {
      const result = parseTranslation({ key: ['value'] })

      expect(result.success).toBe(false)
    })

    test('null値は失敗する', () => {
      const result = parseTranslation({ key: null })

      expect(result.success).toBe(false)
    })

    test('en.jsonを正常にパースする', () => {
      const result = parseTranslation(en)

      expect(result.success).toBe(true)
    })

    test('ja.jsonを正常にパースする', () => {
      const result = parseTranslation(ja)

      expect(result.success).toBe(true)
    })
  })

  describe('validateTranslation', () => {
    test('有効な翻訳データを返す', () => {
      const data = { 'test.key': 'value' }
      const result = validateTranslation(data, 'test')

      expect(result).toEqual(data)
    })

    test('無効な翻訳データでエラーをスローする', () => {
      expect(() => validateTranslation({ key: 123 }, 'test')).toThrow(
        'Invalid translation data for locale "test"'
      )
    })

    test('en.jsonのバリデーションでエラーをスローしない', () => {
      expect(() => validateTranslation(en, 'en')).not.toThrow()
    })

    test('ja.jsonのバリデーションでエラーをスローしない', () => {
      expect(() => validateTranslation(ja, 'ja')).not.toThrow()
    })
  })
})
