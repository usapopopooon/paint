import { describe, test, expect } from 'vitest'
import { selectRectangleBehavior } from './selectRectangleBehavior'
import { DEFAULT_FEATHER, DEFAULT_ANTI_ALIAS } from '@/features/selection'

describe('selectRectangleBehavior', () => {
  describe('type', () => {
    test('select-rectangleを返す', () => {
      expect(selectRectangleBehavior.type).toBe('select-rectangle')
    })
  })

  describe('defaultConfig', () => {
    test('デフォルトの設定を返す', () => {
      const config = selectRectangleBehavior.defaultConfig()

      expect(config).toEqual({
        type: 'select-rectangle',
        feather: DEFAULT_FEATHER,
        antiAlias: DEFAULT_ANTI_ALIAS,
      })
    })
  })

  describe('createStroke', () => {
    test('選択ツールはストロークを作成しないためエラーを投げる', () => {
      expect(() => selectRectangleBehavior.createStroke()).toThrow(
        'Selection tool does not create strokes'
      )
    })
  })

  describe('getCursor', () => {
    test('透明のカーソル設定を返す（crosshairはCSSで設定）', () => {
      const cursor = selectRectangleBehavior.getCursor()

      expect(cursor).toEqual({
        size: 0,
        color: 'transparent',
      })
    })
  })
})
