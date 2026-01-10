import { describe, test, expect } from 'vitest'
import { noneBehavior } from './noneBehavior'

describe('noneBehavior', () => {
  describe('type', () => {
    test('noneを返す', () => {
      expect(noneBehavior.type).toBe('none')
    })
  })

  describe('defaultConfig', () => {
    test('デフォルトのnoneコンフィグを返す', () => {
      const config = noneBehavior.defaultConfig()
      expect(config).toEqual({
        type: 'none',
      })
    })
  })

  describe('createStroke', () => {
    test('未選択状態はストロークを作成できずエラーをスローする', () => {
      expect(() => noneBehavior.createStroke()).toThrow('None tool does not create strokes')
    })
  })

  describe('getCursor', () => {
    test('透明なカーソルコンフィグを返す（デフォルトカーソルを使用するため）', () => {
      const cursor = noneBehavior.getCursor()

      expect(cursor).toEqual({
        size: 0,
        color: 'transparent',
      })
    })
  })
})
