import { describe, test, expect } from 'vitest'
import { handBehavior } from './handBehavior'

describe('handBehavior', () => {
  describe('type', () => {
    test('handを返す', () => {
      expect(handBehavior.type).toBe('hand')
    })
  })

  describe('defaultConfig', () => {
    test('デフォルトのhandコンフィグを返す', () => {
      const config = handBehavior.defaultConfig()
      expect(config).toEqual({
        type: 'hand',
      })
    })
  })

  describe('createStroke', () => {
    test('ハンドツールはストロークを作成できずエラーをスローする', () => {
      const point = { x: 10, y: 20 }
      const config = { type: 'hand' as const }

      expect(() => handBehavior.createStroke(point, config)).toThrow(
        'Hand tool does not create strokes'
      )
    })
  })

  describe('getCursor', () => {
    test('透明なカーソルコンフィグを返す（CSSカーソルを使用するため）', () => {
      const config = { type: 'hand' as const }

      const cursor = handBehavior.getCursor(config)

      expect(cursor).toEqual({
        size: 0,
        color: 'transparent',
      })
    })
  })
})
