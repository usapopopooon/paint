import { describe, test, expect } from 'vitest'
import { zoomOutBehavior } from './zoomOutBehavior'

describe('zoomOutBehavior', () => {
  describe('type', () => {
    test('zoom-outを返す', () => {
      expect(zoomOutBehavior.type).toBe('zoom-out')
    })
  })

  describe('defaultConfig', () => {
    test('デフォルトのzoom-outコンフィグを返す', () => {
      const config = zoomOutBehavior.defaultConfig()
      expect(config).toEqual({
        type: 'zoom-out',
      })
    })
  })

  describe('createStroke', () => {
    test('ズームアウトツールはストロークを作成しないためエラーを投げる', () => {
      expect(() => zoomOutBehavior.createStroke()).toThrow('Zoom-out tool does not create strokes')
    })
  })

  describe('getCursor', () => {
    test('透明のカーソル設定を返す（zoom-outはCSSで設定）', () => {
      const cursor = zoomOutBehavior.getCursor()

      expect(cursor).toEqual({
        size: 0,
        color: 'transparent',
      })
    })
  })
})
