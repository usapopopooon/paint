import { describe, test, expect } from 'vitest'
import { penBehavior } from './penBehavior'

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
        width: 3,
        color: '#000000',
      })
    })
  })

  describe('createStroke', () => {
    test('指定されたポイントとコンフィグでストロークDrawableを作成する', () => {
      const point = { x: 10, y: 20 }
      const config = { type: 'pen' as const, width: 5, color: '#ff0000' }

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
  })

  describe('getCursor', () => {
    test('penコンフィグに対応したカーソルコンフィグを返す', () => {
      const config = { type: 'pen' as const, width: 10, color: '#00ff00' }

      const cursor = penBehavior.getCursor(config)

      expect(cursor).toEqual({
        size: 10,
        color: '#00ff00',
      })
    })
  })
})
