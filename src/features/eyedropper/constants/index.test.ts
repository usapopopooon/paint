import { describe, test, expect } from 'vitest'
import { TRANSPARENT_THRESHOLD, EYEDROPPER_CURSOR } from './index'

describe('eyedropper constants', () => {
  describe('TRANSPARENT_THRESHOLD', () => {
    test('透明しきい値が正の整数である', () => {
      expect(TRANSPARENT_THRESHOLD).toBeGreaterThan(0)
      expect(Number.isInteger(TRANSPARENT_THRESHOLD)).toBe(true)
    })

    test('透明しきい値が255以下である', () => {
      expect(TRANSPARENT_THRESHOLD).toBeLessThanOrEqual(255)
    })
  })

  describe('EYEDROPPER_CURSOR', () => {
    test('SVG data URLである', () => {
      expect(EYEDROPPER_CURSOR).toContain('url("data:image/svg+xml')
    })

    test('crosshairフォールバックを含む', () => {
      expect(EYEDROPPER_CURSOR).toContain('crosshair')
    })

    test('ホットスポット位置を含む', () => {
      // "0 24" はカーソルのホットスポット位置
      expect(EYEDROPPER_CURSOR).toContain('0 24')
    })
  })
})
