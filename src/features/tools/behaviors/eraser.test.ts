import { describe, it, expect } from 'vitest'
import { eraserBehavior } from './eraser'

describe('eraserBehavior', () => {
  describe('type', () => {
    it('returns eraser', () => {
      expect(eraserBehavior.type).toBe('eraser')
    })
  })

  describe('defaultConfig', () => {
    it('returns default eraser config', () => {
      const config = eraserBehavior.defaultConfig()
      expect(config).toEqual({
        type: 'eraser',
        width: 20,
      })
    })
  })

  describe('createStroke', () => {
    it('creates an eraser stroke drawable with given point and config', () => {
      const point = { x: 15, y: 25 }
      const config = { type: 'eraser' as const, width: 30 }

      const stroke = eraserBehavior.createStroke(point, config)

      expect(stroke.type).toBe('stroke')
      expect(stroke.id).toBeTruthy()
      expect(stroke.createdAt).toBeGreaterThan(0)
      expect(stroke.points).toEqual([{ x: 15, y: 25 }])
      expect(stroke.style.color).toBe('transparent')
      expect(stroke.style.brushTip.size).toBe(30)
      expect(stroke.style.brushTip.type).toBe('solid')
      expect(stroke.style.blendMode).toBe('erase')
    })
  })

  describe('getCursor', () => {
    it('returns cursor config with eraser width and visible colors', () => {
      const config = { type: 'eraser' as const, width: 40 }
      const backgroundColor = '#ffffff'

      const cursor = eraserBehavior.getCursor(config, backgroundColor)

      expect(cursor).toEqual({
        size: 40,
        color: '#888888',
        outline: '#ffffff',
      })
    })
  })
})
