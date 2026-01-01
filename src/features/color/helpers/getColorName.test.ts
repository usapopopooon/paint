import { describe, test, expect } from 'vitest'
import { getColorNameKey } from './getColorName'

describe('getColorNameKey', () => {
  describe('色相から色名キーを正しく返す', () => {
    test('赤を返す（0度）', () => {
      expect(getColorNameKey(0)).toBe('color.red')
    })

    test('赤を返す（14度 - 境界値）', () => {
      expect(getColorNameKey(14)).toBe('color.red')
    })

    test('赤を返す（350度）', () => {
      expect(getColorNameKey(350)).toBe('color.red')
    })

    test('オレンジを返す（30度）', () => {
      expect(getColorNameKey(30)).toBe('color.orange')
    })

    test('黄色を返す（60度）', () => {
      expect(getColorNameKey(60)).toBe('color.yellow')
    })

    test('緑を返す（120度）', () => {
      expect(getColorNameKey(120)).toBe('color.green')
    })

    test('シアンを返す（180度）', () => {
      expect(getColorNameKey(180)).toBe('color.cyan')
    })

    test('青を返す（240度）', () => {
      expect(getColorNameKey(240)).toBe('color.blue')
    })

    test('紫を返す（270度）', () => {
      expect(getColorNameKey(270)).toBe('color.purple')
    })

    test('マゼンタを返す（300度）', () => {
      expect(getColorNameKey(300)).toBe('color.magenta')
    })
  })

  describe('境界値のテスト', () => {
    test('15度でオレンジを返す（赤との境界）', () => {
      expect(getColorNameKey(15)).toBe('color.orange')
    })

    test('45度で黄色を返す（オレンジとの境界）', () => {
      expect(getColorNameKey(45)).toBe('color.yellow')
    })

    test('75度で緑を返す（黄色との境界）', () => {
      expect(getColorNameKey(75)).toBe('color.green')
    })

    test('165度でシアンを返す（緑との境界）', () => {
      expect(getColorNameKey(165)).toBe('color.cyan')
    })

    test('195度で青を返す（シアンとの境界）', () => {
      expect(getColorNameKey(195)).toBe('color.blue')
    })

    test('255度で紫を返す（青との境界）', () => {
      expect(getColorNameKey(255)).toBe('color.purple')
    })

    test('285度でマゼンタを返す（紫との境界）', () => {
      expect(getColorNameKey(285)).toBe('color.magenta')
    })

    test('345度で赤を返す（マゼンタとの境界）', () => {
      expect(getColorNameKey(345)).toBe('color.red')
    })
  })

  describe('正規化のテスト', () => {
    test('360度は赤を返す（0度と同じ）', () => {
      expect(getColorNameKey(360)).toBe('color.red')
    })

    test('負の値も正しく正規化される（-30度 = 330度 → マゼンタ）', () => {
      expect(getColorNameKey(-30)).toBe('color.magenta')
    })

    test('大きな値も正しく正規化される（480度 = 120度 → 緑）', () => {
      expect(getColorNameKey(480)).toBe('color.green')
    })
  })
})
