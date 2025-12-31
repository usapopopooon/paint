import { describe, test, expect } from 'vitest'
import { penBehavior } from './penBehavior'
import {
  DEFAULT_PEN_WIDTH,
  DEFAULT_PEN_COLOR,
  DEFAULT_OPACITY,
  DEFAULT_HARDNESS,
} from '../../constants'

describe('penBehavior', () => {
  describe('type', () => {
    test('penを返す', () => {
      expect(penBehavior.type).toBe('pen')
    })
  })

  describe('defaultConfig', () => {
    test('デフォルトのpenコンフィグを返す', () => {
      const config = penBehavior.defaultConfig()
      expect(config).toEqual({
        type: 'pen',
        width: DEFAULT_PEN_WIDTH,
        color: DEFAULT_PEN_COLOR,
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
        type: 'pen' as const,
        width: 5,
        color: '#ff0000',
        opacity: 1,
        hardness: 0,
        isBlurEnabled: true,
      }

      const stroke = penBehavior.createStroke(point, config)

      expect(stroke.type).toBe('stroke')
      expect(stroke.id).toBeTruthy()
      expect(stroke.createdAt).toBeGreaterThan(0)
      expect(stroke.points).toEqual([{ x: 10, y: 20 }])
      expect(stroke.style.color).toBe('#ff0000')
      expect(stroke.style.brushTip.size).toBe(5)
      expect(stroke.style.brushTip.type).toBe('solid')
      expect(stroke.style.blendMode).toBe('normal')
    })

    test('opacityがブラシチップに反映される', () => {
      const point = { x: 10, y: 20 }
      const config = {
        type: 'pen' as const,
        width: 5,
        color: '#ff0000',
        opacity: 0.5,
        hardness: 0,
        isBlurEnabled: true,
      }

      const stroke = penBehavior.createStroke(point, config)

      expect(stroke.style.brushTip.opacity).toBe(0.5)
    })

    test('hardnessがブラシチップに反映される', () => {
      const point = { x: 10, y: 20 }
      const config = {
        type: 'pen' as const,
        width: 5,
        color: '#ff0000',
        opacity: 1,
        hardness: 0.5,
        isBlurEnabled: true,
      }

      const stroke = penBehavior.createStroke(point, config)

      expect(stroke.style.brushTip.hardness).toBe(0.5)
    })

    test('isBlurEnabled=falseの場合、hardnessは1.0になる', () => {
      const point = { x: 10, y: 20 }
      const config = {
        type: 'pen' as const,
        width: 5,
        color: '#ff0000',
        opacity: 1,
        hardness: 0.3,
        isBlurEnabled: false,
      }

      const stroke = penBehavior.createStroke(point, config)

      expect(stroke.style.brushTip.hardness).toBe(1.0)
    })

    test('isBlurEnabled=trueの場合、設定されたhardnessが使用される', () => {
      const point = { x: 10, y: 20 }
      const config = {
        type: 'pen' as const,
        width: 5,
        color: '#ff0000',
        opacity: 1,
        hardness: 0.3,
        isBlurEnabled: true,
      }

      const stroke = penBehavior.createStroke(point, config)

      expect(stroke.style.brushTip.hardness).toBe(0.3)
    })
  })

  describe('getCursor', () => {
    test('penコンフィグに対応したカーソルコンフィグを返す', () => {
      const config = {
        type: 'pen' as const,
        width: 10,
        color: '#00ff00',
        opacity: 1,
        hardness: 0,
        isBlurEnabled: true,
      }

      const cursor = penBehavior.getCursor(config)

      expect(cursor).toEqual({
        size: 10,
        color: '#00ff00',
      })
    })
  })
})
