import { describe, test, expect } from 'vitest'
import { SCALE_VALUES, DEFAULT_JPEG_QUALITY, MIN_JPEG_QUALITY, MAX_JPEG_QUALITY } from './index'

describe('export types', () => {
  describe('SCALE_VALUES', () => {
    test('100%のスケール値が正しい', () => {
      expect(SCALE_VALUES['100']).toBe(1.0)
    })

    test('50%のスケール値が正しい', () => {
      expect(SCALE_VALUES['50']).toBe(0.5)
    })

    test('25%のスケール値が正しい', () => {
      expect(SCALE_VALUES['25']).toBe(0.25)
    })
  })

  describe('JPEG_QUALITY constants', () => {
    test('DEFAULT_JPEG_QUALITYは92', () => {
      expect(DEFAULT_JPEG_QUALITY).toBe(92)
    })

    test('MIN_JPEG_QUALITYは1', () => {
      expect(MIN_JPEG_QUALITY).toBe(1)
    })

    test('MAX_JPEG_QUALITYは100', () => {
      expect(MAX_JPEG_QUALITY).toBe(100)
    })

    test('MIN < DEFAULT < MAX の関係が正しい', () => {
      expect(MIN_JPEG_QUALITY).toBeLessThan(DEFAULT_JPEG_QUALITY)
      expect(DEFAULT_JPEG_QUALITY).toBeLessThan(MAX_JPEG_QUALITY)
    })
  })
})
