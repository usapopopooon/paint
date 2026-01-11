import { describe, test, expect } from 'vitest'
import { brushBehavior } from './brushBehavior'
import {
  DEFAULT_BRUSH_WIDTH,
  DEFAULT_BRUSH_COLOR,
  DEFAULT_OPACITY,
  DEFAULT_HARDNESS,
} from '../../constants'

describe('brushBehavior', () => {
  describe('type', () => {
    test('brushを返す', () => {
      expect(brushBehavior.type).toBe('brush')
    })
  })

  describe('defaultConfig', () => {
    test('デフォルトのbrushコンフィグを返す', () => {
      const config = brushBehavior.defaultConfig()
      expect(config).toEqual({
        type: 'brush',
        width: DEFAULT_BRUSH_WIDTH,
        color: DEFAULT_BRUSH_COLOR,
        opacity: DEFAULT_OPACITY,
        hardness: DEFAULT_HARDNESS,
        isBlurEnabled: true,
      })
    })
  })

  describe('createStroke', () => {
    test('指定されたポイントとコンフィグでストロークDrawableを作成する', () => {
      const point = { x: 10, y: 20 }
      const config = {
        type: 'brush' as const,
        width: 20,
        color: '#00ff00',
        opacity: 1,
        hardness: 0,
        isBlurEnabled: true,
      }

      const stroke = brushBehavior.createStroke(point, config)

      expect(stroke.type).toBe('stroke')
      expect(stroke.id).toBeTruthy()
      expect(stroke.createdAt).toBeGreaterThan(0)
      expect(stroke.points).toEqual([{ x: 10, y: 20 }])
      expect(stroke.style.color).toBe('#00ff00')
      expect(stroke.style.brushTip.size).toBe(20)
      expect(stroke.style.brushTip.type).toBe('solid')
      expect(stroke.style.blendMode).toBe('normal')
    })

    test('opacityがブラシチップに反映される', () => {
      const point = { x: 10, y: 20 }
      const config = {
        type: 'brush' as const,
        width: 20,
        color: '#00ff00',
        opacity: 0.5,
        hardness: 0,
        isBlurEnabled: true,
      }

      const stroke = brushBehavior.createStroke(point, config)

      expect(stroke.style.brushTip.opacity).toBe(0.5)
    })

    test('hardnessがブラシチップに反映される', () => {
      const point = { x: 10, y: 20 }
      const config = {
        type: 'brush' as const,
        width: 20,
        color: '#00ff00',
        opacity: 1,
        hardness: 0.5,
        isBlurEnabled: true,
      }

      const stroke = brushBehavior.createStroke(point, config)

      expect(stroke.style.brushTip.hardness).toBe(0.5)
    })

    test('isBlurEnabled=falseの場合、hardnessは0になる', () => {
      const point = { x: 10, y: 20 }
      const config = {
        type: 'brush' as const,
        width: 20,
        color: '#00ff00',
        opacity: 1,
        hardness: 0.3,
        isBlurEnabled: false,
      }

      const stroke = brushBehavior.createStroke(point, config)

      expect(stroke.style.brushTip.hardness).toBe(0)
    })

    test('isBlurEnabled=trueの場合、設定されたhardnessが使用される', () => {
      const point = { x: 10, y: 20 }
      const config = {
        type: 'brush' as const,
        width: 20,
        color: '#00ff00',
        opacity: 1,
        hardness: 0.3,
        isBlurEnabled: true,
      }

      const stroke = brushBehavior.createStroke(point, config)

      expect(stroke.style.brushTip.hardness).toBe(0.3)
    })
  })

  describe('getCursor', () => {
    test('brushコンフィグに対応したカーソルコンフィグを返す', () => {
      const config = {
        type: 'brush' as const,
        width: 30,
        color: '#0000ff',
        opacity: 1,
        hardness: 0,
        isBlurEnabled: true,
      }

      const cursor = brushBehavior.getCursor(config)

      expect(cursor).toEqual({
        size: 30,
        color: 'rgba(0,0,0,0.4)',
      })
    })
  })
})
