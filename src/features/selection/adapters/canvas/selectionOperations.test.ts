import { describe, test, expect } from 'vitest'
import { getSelectionBounds } from './selectionOperations'
import type { SelectionShape } from '../../types'

/**
 * selectionOperations のテスト
 *
 * 注: getImageDataFromSelection, clearSelectionRegion, fillSelectionRegion,
 * getMaskedImageDataFromSelection, imageDataToDataURL, renderLayerToOffscreenCanvas
 * などのCanvas API依存関数はJSDOM環境ではテストできないため、
 * E2Eテストまたはブラウザ環境でのテストで検証する。
 */
describe('selectionOperations', () => {
  describe('getSelectionBounds', () => {
    test('矩形選択のバウンズを返す', () => {
      const shape: SelectionShape = {
        type: 'rectangle',
        bounds: { x: 10, y: 20, width: 100, height: 50 },
      }

      const bounds = getSelectionBounds(shape)

      expect(bounds).toEqual({
        x: 10,
        y: 20,
        width: 100,
        height: 50,
      })
    })

    test('矩形選択のバウンズにオフセットを適用', () => {
      const shape: SelectionShape = {
        type: 'rectangle',
        bounds: { x: 10, y: 20, width: 100, height: 50 },
      }

      const bounds = getSelectionBounds(shape, { x: 5, y: 10 })

      expect(bounds).toEqual({
        x: 15,
        y: 30,
        width: 100,
        height: 50,
      })
    })

    test('小数点を含む矩形選択のバウンズを整数に変換', () => {
      const shape: SelectionShape = {
        type: 'rectangle',
        bounds: { x: 10.3, y: 20.7, width: 100.2, height: 50.8 },
      }

      const bounds = getSelectionBounds(shape)

      expect(bounds.x).toBe(Math.floor(10.3))
      expect(bounds.y).toBe(Math.floor(20.7))
      expect(bounds.width).toBe(Math.ceil(100.2))
      expect(bounds.height).toBe(Math.ceil(50.8))
    })

    test('Lasso選択のバウンズを計算', () => {
      const shape: SelectionShape = {
        type: 'lasso',
        points: [
          { x: 10, y: 20 },
          { x: 110, y: 20 },
          { x: 110, y: 70 },
          { x: 10, y: 70 },
        ],
      }

      const bounds = getSelectionBounds(shape)

      expect(bounds).toEqual({
        x: 10,
        y: 20,
        width: 100,
        height: 50,
      })
    })

    test('Lasso選択のバウンズにオフセットを適用', () => {
      const shape: SelectionShape = {
        type: 'lasso',
        points: [
          { x: 10, y: 20 },
          { x: 110, y: 20 },
          { x: 110, y: 70 },
          { x: 10, y: 70 },
        ],
      }

      const bounds = getSelectionBounds(shape, { x: 5, y: 10 })

      expect(bounds).toEqual({
        x: 15,
        y: 30,
        width: 100,
        height: 50,
      })
    })

    test('空のLasso選択はゼロのバウンズを返す', () => {
      const shape: SelectionShape = {
        type: 'lasso',
        points: [],
      }

      const bounds = getSelectionBounds(shape)

      expect(bounds).toEqual({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      })
    })

    test('不規則な形状のLasso選択のバウンズを計算', () => {
      const shape: SelectionShape = {
        type: 'lasso',
        points: [
          { x: 50, y: 10 },
          { x: 100, y: 50 },
          { x: 80, y: 100 },
          { x: 20, y: 80 },
          { x: 10, y: 30 },
        ],
      }

      const bounds = getSelectionBounds(shape)

      expect(bounds).toEqual({
        x: 10,
        y: 10,
        width: 90,
        height: 90,
      })
    })

    test('負の座標を含むLasso選択のバウンズを計算', () => {
      const shape: SelectionShape = {
        type: 'lasso',
        points: [
          { x: -50, y: -30 },
          { x: 50, y: -30 },
          { x: 50, y: 30 },
          { x: -50, y: 30 },
        ],
      }

      const bounds = getSelectionBounds(shape)

      expect(bounds).toEqual({
        x: -50,
        y: -30,
        width: 100,
        height: 60,
      })
    })

    test('負のオフセットを適用', () => {
      const shape: SelectionShape = {
        type: 'rectangle',
        bounds: { x: 100, y: 100, width: 50, height: 50 },
      }

      const bounds = getSelectionBounds(shape, { x: -30, y: -20 })

      expect(bounds).toEqual({
        x: 70,
        y: 80,
        width: 50,
        height: 50,
      })
    })

    test('小数点を含むオフセットを整数に変換', () => {
      const shape: SelectionShape = {
        type: 'rectangle',
        bounds: { x: 10, y: 20, width: 100, height: 50 },
      }

      const bounds = getSelectionBounds(shape, { x: 5.7, y: 10.3 })

      // x, yはfloor、width, heightはceil
      expect(Number.isInteger(bounds.x)).toBe(true)
      expect(Number.isInteger(bounds.y)).toBe(true)
      expect(Number.isInteger(bounds.width)).toBe(true)
      expect(Number.isInteger(bounds.height)).toBe(true)
    })

    test('小数点を含むLasso選択のバウンズを整数に変換', () => {
      const shape: SelectionShape = {
        type: 'lasso',
        points: [
          { x: 10.3, y: 20.7 },
          { x: 110.5, y: 20.2 },
          { x: 110.8, y: 70.9 },
          { x: 10.1, y: 70.4 },
        ],
      }

      const bounds = getSelectionBounds(shape)

      expect(Number.isInteger(bounds.x)).toBe(true)
      expect(Number.isInteger(bounds.y)).toBe(true)
      expect(Number.isInteger(bounds.width)).toBe(true)
      expect(Number.isInteger(bounds.height)).toBe(true)
    })

    test('すべての戻り値が整数であることを保証', () => {
      // 様々なケースで整数であることを確認
      const testCases: Array<{ shape: SelectionShape; offset?: { x: number; y: number } }> = [
        {
          shape: { type: 'rectangle', bounds: { x: 0.1, y: 0.9, width: 99.5, height: 49.5 } },
        },
        {
          shape: { type: 'rectangle', bounds: { x: 10, y: 20, width: 100, height: 50 } },
          offset: { x: 0.5, y: 0.5 },
        },
        {
          shape: {
            type: 'lasso',
            points: [
              { x: 0.1, y: 0.1 },
              { x: 99.9, y: 0.1 },
              { x: 99.9, y: 99.9 },
            ],
          },
          offset: { x: 0.3, y: 0.7 },
        },
      ]

      for (const { shape, offset } of testCases) {
        const bounds = getSelectionBounds(shape, offset)
        expect(Number.isInteger(bounds.x)).toBe(true)
        expect(Number.isInteger(bounds.y)).toBe(true)
        expect(Number.isInteger(bounds.width)).toBe(true)
        expect(Number.isInteger(bounds.height)).toBe(true)
      }
    })
  })
})
