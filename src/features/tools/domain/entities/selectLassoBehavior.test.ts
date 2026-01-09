import { describe, test, expect } from 'vitest'
import { selectLassoBehavior } from './selectLassoBehavior'
import { DEFAULT_FEATHER, DEFAULT_ANTI_ALIAS } from '@/features/selection'

describe('selectLassoBehavior', () => {
  describe('type', () => {
    test('select-lassoを返す', () => {
      expect(selectLassoBehavior.type).toBe('select-lasso')
    })
  })

  describe('defaultConfig', () => {
    test('デフォルトの設定を返す', () => {
      const config = selectLassoBehavior.defaultConfig()

      expect(config).toEqual({
        type: 'select-lasso',
        feather: DEFAULT_FEATHER,
        antiAlias: DEFAULT_ANTI_ALIAS,
      })
    })
  })

  describe('createStroke', () => {
    test('選択ツールはストロークを作成しないためエラーを投げる', () => {
      expect(() => selectLassoBehavior.createStroke()).toThrow(
        'Selection tool does not create strokes'
      )
    })
  })

  describe('getCursor', () => {
    test('透明のカーソル設定を返す（crosshairはCSSで設定）', () => {
      const cursor = selectLassoBehavior.getCursor()

      expect(cursor).toEqual({
        size: 0,
        color: 'transparent',
      })
    })
  })
})
