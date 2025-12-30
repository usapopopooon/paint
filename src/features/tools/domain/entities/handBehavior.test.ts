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
      expect(() => handBehavior.createStroke()).toThrow('Hand tool does not create strokes')
    })
  })

  describe('getCursor', () => {
    test('透明なカーソルコンフィグを返す（CSSカーソルを使用するため）', () => {
      const cursor = handBehavior.getCursor()

      expect(cursor).toEqual({
        size: 0,
        color: 'transparent',
      })
    })
  })
})
