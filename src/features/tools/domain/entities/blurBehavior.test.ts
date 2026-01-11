import { describe, test, expect } from 'vitest'
import { blurBehavior } from './blurBehavior'
import { DEFAULT_BLUR_WIDTH, DEFAULT_BLUR_HARDNESS, DEFAULT_OPACITY } from '../../constants'

describe('blurBehavior', () => {
  describe('type', () => {
    test('blurを返す', () => {
      expect(blurBehavior.type).toBe('blur')
    })
  })

  describe('defaultConfig', () => {
    test('デフォルトのblurコンフィグを返す', () => {
      const config = blurBehavior.defaultConfig()
      expect(config).toEqual({
        type: 'blur',
        width: DEFAULT_BLUR_WIDTH,
        opacity: DEFAULT_OPACITY,
        hardness: DEFAULT_BLUR_HARDNESS,
      })
    })
  })

  describe('createStroke', () => {
    test('指定されたポイントとコンフィグでストロークDrawableを作成する', () => {
      const point = { x: 10, y: 20 }
      const config = {
        type: 'blur' as const,
        width: 30,
        opacity: 1,
        hardness: 0.8,
      }

      const stroke = blurBehavior.createStroke(point, config)

      expect(stroke.type).toBe('stroke')
      expect(stroke.id).toBeTruthy()
      expect(stroke.createdAt).toBeGreaterThan(0)
      expect(stroke.points).toEqual([{ x: 10, y: 20 }])
      expect(stroke.style.color).toBe('transparent')
      expect(stroke.style.brushTip.size).toBe(30)
      expect(stroke.style.brushTip.type).toBe('solid')
      expect(stroke.style.blendMode).toBe('blur')
    })

    test('opacityがブラシチップに反映される', () => {
      const point = { x: 10, y: 20 }
      const config = {
        type: 'blur' as const,
        width: 30,
        opacity: 0.5,
        hardness: 0.8,
      }

      const stroke = blurBehavior.createStroke(point, config)

      expect(stroke.style.brushTip.opacity).toBe(0.5)
    })

    test('hardnessがブラシチップに反映される', () => {
      const point = { x: 10, y: 20 }
      const config = {
        type: 'blur' as const,
        width: 30,
        opacity: 1,
        hardness: 0.6,
      }

      const stroke = blurBehavior.createStroke(point, config)

      expect(stroke.style.brushTip.hardness).toBe(0.6)
    })
  })

  describe('getCursor', () => {
    test('blurコンフィグに対応したカーソルコンフィグを返す', () => {
      const config = {
        type: 'blur' as const,
        width: 40,
        opacity: 1,
        hardness: 0.8,
      }

      const cursor = blurBehavior.getCursor(config)

      expect(cursor).toEqual({
        size: 40,
        color: '#66ccff',
        outline: '#ffffff',
      })
    })
  })
})
