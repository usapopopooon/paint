import { describe, it, expect } from 'vitest'
import { hsvToHex, hexToHsv, isValidHex, normalizeHex } from './color'

describe('hsvToHex', () => {
  it('converts black (h=0, s=0, v=0)', () => {
    expect(hsvToHex(0, 0, 0)).toBe('#000000')
  })

  it('converts white (h=0, s=0, v=100)', () => {
    expect(hsvToHex(0, 0, 100)).toBe('#ffffff')
  })

  it('converts red (h=0, s=100, v=100)', () => {
    expect(hsvToHex(0, 100, 100)).toBe('#ff0000')
  })

  it('converts green (h=120, s=100, v=100)', () => {
    expect(hsvToHex(120, 100, 100)).toBe('#00ff00')
  })

  it('converts blue (h=240, s=100, v=100)', () => {
    expect(hsvToHex(240, 100, 100)).toBe('#0000ff')
  })

  it('converts yellow (h=60, s=100, v=100)', () => {
    expect(hsvToHex(60, 100, 100)).toBe('#ffff00')
  })

  it('converts cyan (h=180, s=100, v=100)', () => {
    expect(hsvToHex(180, 100, 100)).toBe('#00ffff')
  })

  it('converts magenta (h=300, s=100, v=100)', () => {
    expect(hsvToHex(300, 100, 100)).toBe('#ff00ff')
  })

  it('converts gray (h=0, s=0, v=50)', () => {
    expect(hsvToHex(0, 0, 50)).toBe('#808080')
  })
})

describe('hexToHsv', () => {
  it('converts black', () => {
    expect(hexToHsv('#000000')).toEqual({ h: 0, s: 0, v: 0 })
  })

  it('converts white', () => {
    expect(hexToHsv('#ffffff')).toEqual({ h: 0, s: 0, v: 100 })
  })

  it('converts red', () => {
    expect(hexToHsv('#ff0000')).toEqual({ h: 0, s: 100, v: 100 })
  })

  it('converts green', () => {
    expect(hexToHsv('#00ff00')).toEqual({ h: 120, s: 100, v: 100 })
  })

  it('converts blue', () => {
    expect(hexToHsv('#0000ff')).toEqual({ h: 240, s: 100, v: 100 })
  })

  it('handles hex without #', () => {
    expect(hexToHsv('ff0000')).toEqual({ h: 0, s: 100, v: 100 })
  })

  it('handles uppercase hex', () => {
    expect(hexToHsv('#FF0000')).toEqual({ h: 0, s: 100, v: 100 })
  })

  it('returns default for invalid hex', () => {
    expect(hexToHsv('invalid')).toEqual({ h: 0, s: 0, v: 100 })
  })
})

describe('isValidHex', () => {
  it('validates 6-digit hex with #', () => {
    expect(isValidHex('#ff0000')).toBe(true)
  })

  it('validates 6-digit hex without #', () => {
    expect(isValidHex('ff0000')).toBe(true)
  })

  it('validates 3-digit hex with #', () => {
    expect(isValidHex('#f00')).toBe(true)
  })

  it('validates 3-digit hex without #', () => {
    expect(isValidHex('f00')).toBe(true)
  })

  it('validates uppercase hex', () => {
    expect(isValidHex('#FF0000')).toBe(true)
  })

  it('rejects invalid characters', () => {
    expect(isValidHex('#gggggg')).toBe(false)
  })

  it('rejects wrong length', () => {
    expect(isValidHex('#ff00')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(isValidHex('')).toBe(false)
  })
})

describe('normalizeHex', () => {
  it('adds # if missing', () => {
    expect(normalizeHex('ff0000')).toBe('#ff0000')
  })

  it('keeps # if present', () => {
    expect(normalizeHex('#ff0000')).toBe('#ff0000')
  })

  it('expands 3-digit hex to 6-digit', () => {
    expect(normalizeHex('#f00')).toBe('#ff0000')
  })

  it('expands 3-digit hex without # to 6-digit', () => {
    expect(normalizeHex('f00')).toBe('#ff0000')
  })

  it('converts to lowercase', () => {
    expect(normalizeHex('#FF0000')).toBe('#ff0000')
  })
})
