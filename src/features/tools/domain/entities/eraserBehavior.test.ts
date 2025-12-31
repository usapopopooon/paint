import { describe, test, expect } from 'vitest'
import { eraserBehavior } from './eraserBehavior'
import { DEFAULT_ERASER_WIDTH, DEFAULT_OPACITY, DEFAULT_HARDNESS } from '../../constants'

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
        opacity: DEFAULT_OPACITY,
        hardness: DEFAULT_HARDNESS,
        isBlurEnabled: true,
      })
    })
  })

  describe('createStroke', () => {
    test('指定されたポイントとコンフィグで消しゴムストロークDrawableを作成する', () => {
      const point = { x: 15, y: 25 }
      const config = {
        type: 'eraser' as const,
        width: 30,
        opacity: 1,
        hardness: 0,
        isBlurEnabled: true,
      }

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

    test('opacityがブラシチップに反映される', () => {
      const point = { x: 15, y: 25 }
      const config = {
        type: 'eraser' as const,
        width: 30,
        opacity: 0.7,
        hardness: 0,
        isBlurEnabled: true,
      }

      const stroke = eraserBehavior.createStroke(point, config)

      expect(stroke.style.brushTip.opacity).toBe(0.7)
    })

    test('hardnessがブラシチップに反映される', () => {
      const point = { x: 15, y: 25 }
      const config = {
        type: 'eraser' as const,
        width: 30,
        opacity: 1,
        hardness: 0.5,
        isBlurEnabled: true,
      }

      const stroke = eraserBehavior.createStroke(point, config)

      expect(stroke.style.brushTip.hardness).toBe(0.5)
    })

    test('isBlurEnabled=falseの場合、hardnessは0になる', () => {
      const point = { x: 15, y: 25 }
      const config = {
        type: 'eraser' as const,
        width: 30,
        opacity: 1,
        hardness: 0.3,
        isBlurEnabled: false,
      }

      const stroke = eraserBehavior.createStroke(point, config)

      expect(stroke.style.brushTip.hardness).toBe(0)
    })

    test('isBlurEnabled=trueの場合、設定されたhardnessが使用される', () => {
      const point = { x: 15, y: 25 }
      const config = {
        type: 'eraser' as const,
        width: 30,
        opacity: 1,
        hardness: 0.3,
        isBlurEnabled: true,
      }

      const stroke = eraserBehavior.createStroke(point, config)

      expect(stroke.style.brushTip.hardness).toBe(0.3)
    })
  })

  describe('getCursor', () => {
    test('eraserの幅と視認可能な色を持つカーソルコンフィグを返す', () => {
      const config = {
        type: 'eraser' as const,
        width: 40,
        opacity: 1,
        hardness: 0,
        isBlurEnabled: true,
      }

      const cursor = eraserBehavior.getCursor(config)

      expect(cursor).toEqual({
        size: 40,
        color: '#888888',
        outline: '#ffffff',
      })
    })
  })
})
