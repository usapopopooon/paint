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
    it('creates an eraser stroke with given point and config', () => {
      const point = { x: 15, y: 25 }
      const config = { type: 'eraser' as const, width: 30 }

      const stroke = eraserBehavior.createStroke(point, config)

      expect(stroke).toEqual({
        points: [{ x: 15, y: 25 }],
        width: 30,
        color: 'transparent',
        isEraser: true,
      })
    })
  })

  describe('getCursor', () => {
    it('returns cursor config with eraser width and background color', () => {
      const config = { type: 'eraser' as const, width: 40 }
      const backgroundColor = '#ffffff'

      const cursor = eraserBehavior.getCursor(config, backgroundColor)

      expect(cursor).toEqual({
        size: 40,
        color: '#ffffff',
      })
    })
  })
})
