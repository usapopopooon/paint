import { describe, test, expect } from 'vitest'
import { JPEG_QUALITY } from './index'

describe('export constants', () => {
  test('JPEG_QUALITYは1.0である（最高品質）', () => {
    expect(JPEG_QUALITY).toBe(1.0)
  })

  test('JPEG_QUALITYは0から1の範囲である', () => {
    expect(JPEG_QUALITY).toBeGreaterThan(0)
    expect(JPEG_QUALITY).toBeLessThanOrEqual(1)
  })
})
