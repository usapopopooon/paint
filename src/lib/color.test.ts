import { describe, test, expect } from 'vitest'
import { hsvToHex, hexToHsv, isValidHex, normalizeHex } from './color'

describe('hsvToHex', () => {
  test('黒を変換する (h=0, s=0, v=0)', () => {
    expect(hsvToHex(0, 0, 0)).toBe('#000000')
  })

  test('白を変換する (h=0, s=0, v=100)', () => {
    expect(hsvToHex(0, 0, 100)).toBe('#ffffff')
  })

  test('赤を変換する (h=0, s=100, v=100)', () => {
    expect(hsvToHex(0, 100, 100)).toBe('#ff0000')
  })

  test('緑を変換する (h=120, s=100, v=100)', () => {
    expect(hsvToHex(120, 100, 100)).toBe('#00ff00')
  })

  test('青を変換する (h=240, s=100, v=100)', () => {
    expect(hsvToHex(240, 100, 100)).toBe('#0000ff')
  })

  test('黄色を変換する (h=60, s=100, v=100)', () => {
    expect(hsvToHex(60, 100, 100)).toBe('#ffff00')
  })

  test('シアンを変換する (h=180, s=100, v=100)', () => {
    expect(hsvToHex(180, 100, 100)).toBe('#00ffff')
  })

  test('マゼンタを変換する (h=300, s=100, v=100)', () => {
    expect(hsvToHex(300, 100, 100)).toBe('#ff00ff')
  })

  test('グレーを変換する (h=0, s=0, v=50)', () => {
    expect(hsvToHex(0, 0, 50)).toBe('#808080')
  })
})

describe('hexToHsv', () => {
  test('黒を変換する', () => {
    expect(hexToHsv('#000000')).toEqual({ h: 0, s: 0, v: 0 })
  })

  test('白を変換する', () => {
    expect(hexToHsv('#ffffff')).toEqual({ h: 0, s: 0, v: 100 })
  })

  test('赤を変換する', () => {
    expect(hexToHsv('#ff0000')).toEqual({ h: 0, s: 100, v: 100 })
  })

  test('緑を変換する', () => {
    expect(hexToHsv('#00ff00')).toEqual({ h: 120, s: 100, v: 100 })
  })

  test('青を変換する', () => {
    expect(hexToHsv('#0000ff')).toEqual({ h: 240, s: 100, v: 100 })
  })

  test('黄色を変換する (max=r, g>b)', () => {
    expect(hexToHsv('#ffff00')).toEqual({ h: 60, s: 100, v: 100 })
  })

  test('マゼンタを変換する (max=r, g<b)', () => {
    // #ff00ff - r=255, g=0, b=255 → max=r, g<b なので h = (g-b)/d + 6
    expect(hexToHsv('#ff00ff')).toEqual({ h: 300, s: 100, v: 100 })
  })

  test('シアンを変換する (max=g)', () => {
    expect(hexToHsv('#00ffff')).toEqual({ h: 180, s: 100, v: 100 })
  })

  test('オレンジを変換する (max=r, g>b)', () => {
    // #ff8000 - r=255, g=128, b=0
    const result = hexToHsv('#ff8000')
    expect(result.h).toBe(30)
    expect(result.s).toBe(100)
    expect(result.v).toBe(100)
  })

  test('ピンクを変換する (max=r, g<b)', () => {
    // #ff0080 - r=255, g=0, b=128 → max=r, g<b
    const result = hexToHsv('#ff0080')
    expect(result.h).toBe(330)
    expect(result.s).toBe(100)
    expect(result.v).toBe(100)
  })

  test('#なしのHEXを処理する', () => {
    expect(hexToHsv('ff0000')).toEqual({ h: 0, s: 100, v: 100 })
  })

  test('大文字のHEXを処理する', () => {
    expect(hexToHsv('#FF0000')).toEqual({ h: 0, s: 100, v: 100 })
  })

  test('無効なHEXにはデフォルト値を返す', () => {
    expect(hexToHsv('invalid')).toEqual({ h: 0, s: 0, v: 100 })
  })
})

describe('isValidHex', () => {
  test('#付き6桁HEXを検証する', () => {
    expect(isValidHex('#ff0000')).toBe(true)
  })

  test('#なし6桁HEXを検証する', () => {
    expect(isValidHex('ff0000')).toBe(true)
  })

  test('#付き3桁HEXを検証する', () => {
    expect(isValidHex('#f00')).toBe(true)
  })

  test('#なし3桁HEXを検証する', () => {
    expect(isValidHex('f00')).toBe(true)
  })

  test('大文字HEXを検証する', () => {
    expect(isValidHex('#FF0000')).toBe(true)
  })

  test('無効な文字を拒否する', () => {
    expect(isValidHex('#gggggg')).toBe(false)
  })

  test('不正な長さを拒否する', () => {
    expect(isValidHex('#ff00')).toBe(false)
  })

  test('空文字列を拒否する', () => {
    expect(isValidHex('')).toBe(false)
  })
})

describe('normalizeHex', () => {
  test('#がない場合は追加する', () => {
    expect(normalizeHex('ff0000')).toBe('#ff0000')
  })

  test('#がある場合はそのまま保持する', () => {
    expect(normalizeHex('#ff0000')).toBe('#ff0000')
  })

  test('3桁HEXを6桁に展開する', () => {
    expect(normalizeHex('#f00')).toBe('#ff0000')
  })

  test('#なし3桁HEXを6桁に展開する', () => {
    expect(normalizeHex('f00')).toBe('#ff0000')
  })

  test('小文字に変換する', () => {
    expect(normalizeHex('#FF0000')).toBe('#ff0000')
  })
})
