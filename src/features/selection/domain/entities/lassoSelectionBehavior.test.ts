import { describe, test, expect } from 'vitest'
import { lassoSelectionBehavior } from './lassoSelectionBehavior'
import { DEFAULT_FEATHER, DEFAULT_ANTI_ALIAS } from '../../constants'

describe('lassoSelectionBehavior', () => {
  describe('type', () => {
    test('select-lassoを返す', () => {
      expect(lassoSelectionBehavior.type).toBe('select-lasso')
    })
  })

  describe('defaultConfig', () => {
    test('デフォルトの設定を返す', () => {
      const config = lassoSelectionBehavior.defaultConfig()

      expect(config).toEqual({
        type: 'select-lasso',
        feather: DEFAULT_FEATHER,
        antiAlias: DEFAULT_ANTI_ALIAS,
      })
    })
  })

  describe('createShape', () => {
    test('3点以上のポイントから選択領域を作成する', () => {
      const points = [
        { x: 10, y: 10 },
        { x: 100, y: 10 },
        { x: 100, y: 100 },
        { x: 10, y: 100 },
      ]

      const shape = lassoSelectionBehavior.createShape(points)

      expect(shape.type).toBe('lasso')
      if (shape.type === 'lasso') {
        expect(shape.points).toEqual(points)
      }
    })

    test('ポイントが3点未満の場合は空のポイント配列を返す', () => {
      const points = [
        { x: 10, y: 10 },
        { x: 100, y: 10 },
      ]

      const shape = lassoSelectionBehavior.createShape(points)

      expect(shape.type).toBe('lasso')
      if (shape.type === 'lasso') {
        expect(shape.points).toEqual([])
      }
    })

    test('ポイントが空の場合は空のポイント配列を返す', () => {
      const shape = lassoSelectionBehavior.createShape([])

      expect(shape.type).toBe('lasso')
      if (shape.type === 'lasso') {
        expect(shape.points).toEqual([])
      }
    })

    test('ちょうど3点のポイントで選択領域を作成できる', () => {
      const points = [
        { x: 0, y: 0 },
        { x: 50, y: 100 },
        { x: 100, y: 0 },
      ]

      const shape = lassoSelectionBehavior.createShape(points)

      expect(shape.type).toBe('lasso')
      if (shape.type === 'lasso') {
        expect(shape.points).toEqual(points)
      }
    })
  })

  describe('getCursor', () => {
    test('透明のカーソル設定を返す（crosshairはCSSで設定）', () => {
      const cursor = lassoSelectionBehavior.getCursor()

      expect(cursor).toEqual({
        size: 0,
        color: 'transparent',
      })
    })
  })
})
