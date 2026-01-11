import { describe, test, expect } from 'vitest'
import { rectangleSelectionBehavior } from './rectangleSelectionBehavior'
import { DEFAULT_FEATHER, DEFAULT_ANTI_ALIAS } from '../../constants'

describe('rectangleSelectionBehavior', () => {
  describe('type', () => {
    test('select-rectangleを返す', () => {
      expect(rectangleSelectionBehavior.type).toBe('select-rectangle')
    })
  })

  describe('defaultConfig', () => {
    test('デフォルトの設定を返す', () => {
      const config = rectangleSelectionBehavior.defaultConfig()

      expect(config).toEqual({
        type: 'select-rectangle',
        feather: DEFAULT_FEATHER,
        antiAlias: DEFAULT_ANTI_ALIAS,
      })
    })
  })

  describe('createShape', () => {
    test('開始点と終了点から選択領域を作成する', () => {
      const startPoint = { x: 10, y: 20 }
      const endPoint = { x: 100, y: 80 }

      const shape = rectangleSelectionBehavior.createShape(startPoint, endPoint)

      expect(shape.type).toBe('rectangle')
      if (shape.type === 'rectangle') {
        expect(shape.bounds).toEqual({
          x: 10,
          y: 20,
          width: 90,
          height: 60,
        })
      }
    })

    test('終了点が開始点より左上の場合も正しく計算する', () => {
      const startPoint = { x: 100, y: 80 }
      const endPoint = { x: 10, y: 20 }

      const shape = rectangleSelectionBehavior.createShape(startPoint, endPoint)

      expect(shape.type).toBe('rectangle')
      if (shape.type === 'rectangle') {
        expect(shape.bounds).toEqual({
          x: 10,
          y: 20,
          width: 90,
          height: 60,
        })
      }
    })

    test('終了点がX方向のみ左の場合も正しく計算する', () => {
      const startPoint = { x: 100, y: 20 }
      const endPoint = { x: 10, y: 80 }

      const shape = rectangleSelectionBehavior.createShape(startPoint, endPoint)

      expect(shape.type).toBe('rectangle')
      if (shape.type === 'rectangle') {
        expect(shape.bounds).toEqual({
          x: 10,
          y: 20,
          width: 90,
          height: 60,
        })
      }
    })
  })

  describe('getCursor', () => {
    test('透明のカーソル設定を返す（crosshairはCSSで設定）', () => {
      const cursor = rectangleSelectionBehavior.getCursor()

      expect(cursor).toEqual({
        size: 0,
        color: 'transparent',
      })
    })
  })
})
