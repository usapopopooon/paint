import { describe, it, expect } from 'vitest'
import { parseTranslation, validateTranslation } from './translationSchema'
import en from '../infrastructure/locales/en.json'
import ja from '../infrastructure/locales/ja.json'

describe('translationSchema', () => {
  describe('parseTranslation', () => {
    it('should parse valid translation data', () => {
      const result = parseTranslation({ 'test.key': 'value' })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data['test.key']).toBe('value')
      }
    })

    it('should parse empty object', () => {
      const result = parseTranslation({})

      expect(result.success).toBe(true)
    })

    it('should fail for non-string values', () => {
      const result = parseTranslation({ key: 123 })

      expect(result.success).toBe(false)
    })

    it('should fail for nested objects', () => {
      const result = parseTranslation({ key: { nested: 'value' } })

      expect(result.success).toBe(false)
    })

    it('should fail for array values', () => {
      const result = parseTranslation({ key: ['value'] })

      expect(result.success).toBe(false)
    })

    it('should fail for null values', () => {
      const result = parseTranslation({ key: null })

      expect(result.success).toBe(false)
    })

    it('should parse en.json successfully', () => {
      const result = parseTranslation(en)

      expect(result.success).toBe(true)
    })

    it('should parse ja.json successfully', () => {
      const result = parseTranslation(ja)

      expect(result.success).toBe(true)
    })
  })

  describe('validateTranslation', () => {
    it('should return data for valid translation', () => {
      const data = { 'test.key': 'value' }
      const result = validateTranslation(data, 'test')

      expect(result).toEqual(data)
    })

    it('should throw error for invalid translation', () => {
      expect(() => validateTranslation({ key: 123 }, 'test')).toThrow(
        'Invalid translation data for locale "test"'
      )
    })

    it('should validate en.json without throwing', () => {
      expect(() => validateTranslation(en, 'en')).not.toThrow()
    })

    it('should validate ja.json without throwing', () => {
      expect(() => validateTranslation(ja, 'ja')).not.toThrow()
    })
  })
})
