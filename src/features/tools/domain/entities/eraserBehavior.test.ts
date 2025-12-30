import { describe, test, expect } from 'vitest'
import { eraserBehavior } from './eraserBehavior'
import { DEFAULT_ERASER_WIDTH } from '../../constants'

describe('eraserBehavior', () => {
  describe('type', () => {
    test('eraserを返す', () => {
      expect(eraserBehavior.type).toBe('eraser')
    })
  })

  describe('defaultConfig', () => {
    test('デフォルトのeraserコンフィグを返す', () => {
      const config = eraserBehavior.defaultConfig()
      expect(config).toEqual({
        type: 'eraser',
        width: DEFAULT_ERASER_WIDTH,
      })
    })
  })

  describe('createStroke', () => {
    test('指定されたポイントとコンフィグで消しゴムストロークDrawableを作成する', () => {
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
    test('eraserの幅と視認可能な色を持つカーソルコンフィグを返す', () => {
      const config = { type: 'eraser' as const, width: 40 }

      const cursor = eraserBehavior.getCursor(config)

      expect(cursor).toEqual({
        size: 40,
        color: '#888888',
        outline: '#ffffff',
      })
    })
  })
})
