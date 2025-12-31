import { describe, test, expect } from 'vitest'
import { JPEG_QUALITY, EXPORT_SCALE } from './index'

describe('export constants', () => {
  test('JPEG_QUALITYは1.0である（最高品質）', () => {
    expect(JPEG_QUALITY).toBe(1.0)
  })

  test('JPEG_QUALITYは0から1の範囲である', () => {
    expect(JPEG_QUALITY).toBeGreaterThan(0)
    expect(JPEG_QUALITY).toBeLessThanOrEqual(1)
  })

  test('EXPORT_SCALEは0.5である（50%縮小）', () => {
    expect(EXPORT_SCALE).toBe(0.5)
  })

  test('EXPORT_SCALEは0より大きく1以下の範囲である', () => {
    expect(EXPORT_SCALE).toBeGreaterThan(0)
    expect(EXPORT_SCALE).toBeLessThanOrEqual(1)
  })
})
