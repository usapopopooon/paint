import { describe, test, expect } from 'vitest'
import { eyedropperBehavior } from './eyedropperBehavior'

describe('eyedropperBehavior', () => {
  describe('type', () => {
    test('eyedropperを返す', () => {
      expect(eyedropperBehavior.type).toBe('eyedropper')
    })
  })

  describe('defaultConfig', () => {
    test('デフォルトのeyedropperコンフィグを返す', () => {
      const config = eyedropperBehavior.defaultConfig()
      expect(config).toEqual({
        type: 'eyedropper',
      })
    })
  })

  describe('createStroke', () => {
    test('スポイトツールはストロークを作成しないためエラーを投げる', () => {
      expect(() => eyedropperBehavior.createStroke()).toThrow(
        'Eyedropper tool does not create strokes'
      )
    })
  })

  describe('getCursor', () => {
    test('透明のカーソル設定を返す（カスタムカーソルはCSSで設定）', () => {
      const cursor = eyedropperBehavior.getCursor()

      expect(cursor).toEqual({
        size: 0,
        color: 'transparent',
      })
    })
  })
})
