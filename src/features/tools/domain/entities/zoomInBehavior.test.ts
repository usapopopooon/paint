import { describe, test, expect } from 'vitest'
import { zoomInBehavior } from './zoomInBehavior'

describe('zoomInBehavior', () => {
  describe('type', () => {
    test('zoom-inを返す', () => {
      expect(zoomInBehavior.type).toBe('zoom-in')
    })
  })

  describe('defaultConfig', () => {
    test('デフォルトのzoom-inコンフィグを返す', () => {
      const config = zoomInBehavior.defaultConfig()
      expect(config).toEqual({
        type: 'zoom-in',
      })
    })
  })

  describe('createStroke', () => {
    test('ズームインツールはストロークを作成しないためエラーを投げる', () => {
      expect(() => zoomInBehavior.createStroke()).toThrow('Zoom-in tool does not create strokes')
    })
  })

  describe('getCursor', () => {
    test('透明のカーソル設定を返す（zoom-inはCSSで設定）', () => {
      const cursor = zoomInBehavior.getCursor()

      expect(cursor).toEqual({
        size: 0,
        color: 'transparent',
      })
    })
  })
})
