import { describe, it, expect } from 'vitest'
import { TRANSPARENT_THRESHOLD, EYEDROPPER_CURSOR } from './index'

describe('eyedropper constants', () => {
  describe('TRANSPARENT_THRESHOLD', () => {
    it('透明しきい値が正の整数である', () => {
      expect(TRANSPARENT_THRESHOLD).toBeGreaterThan(0)
      expect(Number.isInteger(TRANSPARENT_THRESHOLD)).toBe(true)
    })

    it('透明しきい値が255以下である', () => {
      expect(TRANSPARENT_THRESHOLD).toBeLessThanOrEqual(255)
    })
  })

  describe('EYEDROPPER_CURSOR', () => {
    it('SVG data URLである', () => {
      expect(EYEDROPPER_CURSOR).toContain('url("data:image/svg+xml')
    })

    it('crosshairフォールバックを含む', () => {
      expect(EYEDROPPER_CURSOR).toContain('crosshair')
    })

    it('ホットスポット位置を含む', () => {
      // "0 24" はカーソルのホットスポット位置
      expect(EYEDROPPER_CURSOR).toContain('0 24')
    })
  })
})
