import { describe, test, expect } from 'vitest'
import { hexColorSchema } from './hexColorSchema'

describe('hexColorSchema', () => {
  describe('有効なHEXカラー', () => {
    test('#付き6桁のHEXを許容する', () => {
      const result = hexColorSchema.safeParse('#FF0000')
      expect(result.success).toBe(true)
    })

    test('#なし6桁のHEXを許容する', () => {
      const result = hexColorSchema.safeParse('FF0000')
      expect(result.success).toBe(true)
    })

    test('#付き3桁のHEXを許容する', () => {
      const result = hexColorSchema.safeParse('#F00')
      expect(result.success).toBe(true)
    })

    test('#なし3桁のHEXを許容する', () => {
      const result = hexColorSchema.safeParse('F00')
      expect(result.success).toBe(true)
    })

    test('小文字のHEXを許容する', () => {
      const result = hexColorSchema.safeParse('#ff0000')
      expect(result.success).toBe(true)
    })

    test('大文字小文字混在のHEXを許容する', () => {
      const result = hexColorSchema.safeParse('#Ff00Aa')
      expect(result.success).toBe(true)
    })
  })

  describe('無効なHEXカラー', () => {
    test('空文字を拒否する', () => {
      const result = hexColorSchema.safeParse('')
      expect(result.success).toBe(false)
    })

    test('4桁のHEXを拒否する', () => {
      const result = hexColorSchema.safeParse('#FF00')
      expect(result.success).toBe(false)
    })

    test('5桁のHEXを拒否する', () => {
      const result = hexColorSchema.safeParse('#FF000')
      expect(result.success).toBe(false)
    })

    test('7桁のHEXを拒否する', () => {
      const result = hexColorSchema.safeParse('#FF00000')
      expect(result.success).toBe(false)
    })

    test('無効な文字を含むHEXを拒否する', () => {
      const result = hexColorSchema.safeParse('#GG0000')
      expect(result.success).toBe(false)
    })

    test('rgb形式を拒否する', () => {
      const result = hexColorSchema.safeParse('rgb(255, 0, 0)')
      expect(result.success).toBe(false)
    })

    test('色名を拒否する', () => {
      const result = hexColorSchema.safeParse('red')
      expect(result.success).toBe(false)
    })
  })
})
