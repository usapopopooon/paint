import { describe, test, expect } from 'vitest'
import {
  isPointInPolygonCore,
  applyLassoMaskCore,
  pointsToFloat64Array,
  calculatePolygonBoundsCore,
  type PointData,
  type MaskParams,
} from './selectionCore'

describe('selectionCore', () => {
  describe('isPointInPolygonCore', () => {
    // 正方形ポリゴン: (0,0), (10,0), (10,10), (0,10)
    const squarePolygon = new Float64Array([0, 0, 10, 0, 10, 10, 0, 10])

    test('ポリゴン内部の点はtrueを返す', () => {
      expect(isPointInPolygonCore(5, 5, squarePolygon)).toBe(true)
    })

    test('ポリゴン内部の点（左上寄り）はtrueを返す', () => {
      expect(isPointInPolygonCore(1, 1, squarePolygon)).toBe(true)
    })

    test('ポリゴン内部の点（右下寄り）はtrueを返す', () => {
      expect(isPointInPolygonCore(9, 9, squarePolygon)).toBe(true)
    })

    test('ポリゴン外部の点（左）はfalseを返す', () => {
      expect(isPointInPolygonCore(-1, 5, squarePolygon)).toBe(false)
    })

    test('ポリゴン外部の点（右）はfalseを返す', () => {
      expect(isPointInPolygonCore(11, 5, squarePolygon)).toBe(false)
    })

    test('ポリゴン外部の点（上）はfalseを返す', () => {
      expect(isPointInPolygonCore(5, -1, squarePolygon)).toBe(false)
    })

    test('ポリゴン外部の点（下）はfalseを返す', () => {
      expect(isPointInPolygonCore(5, 11, squarePolygon)).toBe(false)
    })

    test('ポリゴン外部の点（左上）はfalseを返す', () => {
      expect(isPointInPolygonCore(-1, -1, squarePolygon)).toBe(false)
    })

    // 三角形ポリゴン: (5,0), (10,10), (0,10)
    const trianglePolygon = new Float64Array([5, 0, 10, 10, 0, 10])

    test('三角形内部の点はtrueを返す', () => {
      expect(isPointInPolygonCore(5, 5, trianglePolygon)).toBe(true)
    })

    test('三角形内部の点（下寄り）はtrueを返す', () => {
      expect(isPointInPolygonCore(5, 8, trianglePolygon)).toBe(true)
    })

    test('三角形外部の点（左上）はfalseを返す', () => {
      expect(isPointInPolygonCore(2, 2, trianglePolygon)).toBe(false)
    })

    test('三角形外部の点（右上）はfalseを返す', () => {
      expect(isPointInPolygonCore(8, 2, trianglePolygon)).toBe(false)
    })

    test('ポリゴンが3点未満の場合はfalseを返す', () => {
      const twoPoints = new Float64Array([0, 0, 10, 10])
      expect(isPointInPolygonCore(5, 5, twoPoints)).toBe(false)
    })

    test('空のポリゴンはfalseを返す', () => {
      const empty = new Float64Array([])
      expect(isPointInPolygonCore(0, 0, empty)).toBe(false)
    })

    // L字型ポリゴン
    const lShapePolygon = new Float64Array([0, 0, 5, 0, 5, 5, 10, 5, 10, 10, 0, 10])

    test('L字型ポリゴン内部（左下）はtrueを返す', () => {
      expect(isPointInPolygonCore(2, 8, lShapePolygon)).toBe(true)
    })

    test('L字型ポリゴン内部（右下）はtrueを返す', () => {
      expect(isPointInPolygonCore(8, 8, lShapePolygon)).toBe(true)
    })

    test('L字型ポリゴン外部（凹部分）はfalseを返す', () => {
      expect(isPointInPolygonCore(8, 2, lShapePolygon)).toBe(false)
    })
  })

  describe('pointsToFloat64Array', () => {
    test('Point配列をFloat64Arrayに変換する', () => {
      const points: PointData[] = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ]
      const result = pointsToFloat64Array(points)

      expect(result).toBeInstanceOf(Float64Array)
      expect(result.length).toBe(6)
      expect(result[0]).toBe(0)
      expect(result[1]).toBe(0)
      expect(result[2]).toBe(10)
      expect(result[3]).toBe(0)
      expect(result[4]).toBe(10)
      expect(result[5]).toBe(10)
    })

    test('空の配列は空のFloat64Arrayを返す', () => {
      const result = pointsToFloat64Array([])
      expect(result.length).toBe(0)
    })

    test('小数点を含む座標も正確に変換する', () => {
      const points: PointData[] = [
        { x: 1.5, y: 2.7 },
        { x: 3.14159, y: 0 },
      ]
      const result = pointsToFloat64Array(points)

      expect(result[0]).toBe(1.5)
      expect(result[1]).toBe(2.7)
      expect(result[2]).toBeCloseTo(3.14159)
      expect(result[3]).toBe(0)
    })
  })

  describe('calculatePolygonBoundsCore', () => {
    test('正方形ポリゴンのバウンズを計算する', () => {
      const polygon = new Float64Array([0, 0, 10, 0, 10, 10, 0, 10])
      const bounds = calculatePolygonBoundsCore(polygon)

      expect(bounds.x).toBe(0)
      expect(bounds.y).toBe(0)
      expect(bounds.width).toBe(10)
      expect(bounds.height).toBe(10)
    })

    test('オフセット付きでバウンズを計算する', () => {
      const polygon = new Float64Array([0, 0, 10, 0, 10, 10, 0, 10])
      const bounds = calculatePolygonBoundsCore(polygon, 5, 3)

      expect(bounds.x).toBe(5)
      expect(bounds.y).toBe(3)
      expect(bounds.width).toBe(10)
      expect(bounds.height).toBe(10)
    })

    test('負のオフセットを正しく処理する', () => {
      const polygon = new Float64Array([10, 10, 20, 10, 20, 20, 10, 20])
      const bounds = calculatePolygonBoundsCore(polygon, -5, -3)

      expect(bounds.x).toBe(5)
      expect(bounds.y).toBe(7)
      expect(bounds.width).toBe(10)
      expect(bounds.height).toBe(10)
    })

    test('三角形ポリゴンのバウンズを計算する', () => {
      const polygon = new Float64Array([5, 0, 10, 10, 0, 10])
      const bounds = calculatePolygonBoundsCore(polygon)

      expect(bounds.x).toBe(0)
      expect(bounds.y).toBe(0)
      expect(bounds.width).toBe(10)
      expect(bounds.height).toBe(10)
    })

    test('空のポリゴンは0サイズのバウンズを返す', () => {
      const empty = new Float64Array([])
      const bounds = calculatePolygonBoundsCore(empty)

      expect(bounds.x).toBe(0)
      expect(bounds.y).toBe(0)
      expect(bounds.width).toBe(0)
      expect(bounds.height).toBe(0)
    })

    test('小数点座標を正しく丸める', () => {
      const polygon = new Float64Array([0.3, 0.7, 9.2, 0.1, 9.8, 9.9, 0.1, 9.4])
      const bounds = calculatePolygonBoundsCore(polygon)

      expect(bounds.x).toBe(0)
      expect(bounds.y).toBe(0)
      expect(bounds.width).toBe(10) // ceil(9.8 - 0.1)
      expect(bounds.height).toBe(10) // ceil(9.9 - 0.1)
    })
  })

  describe('applyLassoMaskCore', () => {
    /**
     * テスト用のソースデータを作成
     * 全ピクセルが不透明な赤色
     */
    const createTestSourceData = (width: number, height: number): Uint8ClampedArray => {
      const data = new Uint8ClampedArray(width * height * 4)
      for (let i = 0; i < width * height; i++) {
        data[i * 4] = 255 // R
        data[i * 4 + 1] = 0 // G
        data[i * 4 + 2] = 0 // B
        data[i * 4 + 3] = 255 // A
      }
      return data
    }

    test('ポリゴン外のピクセルが透明になる', () => {
      // 10x10の画像、中央に5x5の正方形ポリゴン
      const sourceData = createTestSourceData(10, 10)
      const polygon = new Float64Array([2, 2, 7, 2, 7, 7, 2, 7])

      const params: MaskParams = {
        sourceData,
        width: 10,
        height: 10,
        boundsX: 0,
        boundsY: 0,
        offsetX: 0,
        offsetY: 0,
        polygonPoints: polygon,
      }

      const result = applyLassoMaskCore(params)

      // ポリゴン外（左上）のピクセルは透明
      const topLeftIdx = (0 * 10 + 0) * 4
      expect(result.data[topLeftIdx + 3]).toBe(0)

      // ポリゴン内（中央）のピクセルは不透明
      const centerIdx = (5 * 10 + 5) * 4
      expect(result.data[centerIdx + 3]).toBe(255)
      expect(result.data[centerIdx]).toBe(255) // Rは保持

      // ポリゴン外（右下）のピクセルは透明
      const bottomRightIdx = (9 * 10 + 9) * 4
      expect(result.data[bottomRightIdx + 3]).toBe(0)
    })

    test('バウンズオフセットを正しく考慮する', () => {
      // 5x5の画像、座標(10,10)から始まる
      const sourceData = createTestSourceData(5, 5)
      // ポリゴンはキャンバス座標系で(11,11)-(14,14)の正方形
      const polygon = new Float64Array([11, 11, 14, 11, 14, 14, 11, 14])

      const params: MaskParams = {
        sourceData,
        width: 5,
        height: 5,
        boundsX: 10,
        boundsY: 10,
        offsetX: 0,
        offsetY: 0,
        polygonPoints: polygon,
      }

      const result = applyLassoMaskCore(params)

      // 画像座標(0,0) = キャンバス座標(10,10) -> ポリゴン外
      const topLeftIdx = (0 * 5 + 0) * 4
      expect(result.data[topLeftIdx + 3]).toBe(0)

      // 画像座標(2,2) = キャンバス座標(12,12) -> ポリゴン内
      const insideIdx = (2 * 5 + 2) * 4
      expect(result.data[insideIdx + 3]).toBe(255)
    })

    test('選択オフセットを正しく考慮する', () => {
      const sourceData = createTestSourceData(5, 5)
      // ポリゴンは元々(0,0)-(3,3)だが、offset=(10,10)で移動している
      const polygon = new Float64Array([0, 0, 3, 0, 3, 3, 0, 3])

      const params: MaskParams = {
        sourceData,
        width: 5,
        height: 5,
        boundsX: 10, // バウンズはオフセット後の位置
        boundsY: 10,
        offsetX: 10, // 選択領域のオフセット
        offsetY: 10,
        polygonPoints: polygon,
      }

      const result = applyLassoMaskCore(params)

      // 画像座標(1,1) = キャンバス座標(11,11) - offset(10,10) = ポリゴン座標(1,1) -> ポリゴン内
      const insideIdx = (1 * 5 + 1) * 4
      expect(result.data[insideIdx + 3]).toBe(255)

      // 画像座標(4,4) = キャンバス座標(14,14) - offset(10,10) = ポリゴン座標(4,4) -> ポリゴン外
      const outsideIdx = (4 * 5 + 4) * 4
      expect(result.data[outsideIdx + 3]).toBe(0)
    })

    test('ポリゴンが無効な場合はソースをそのまま返す', () => {
      const sourceData = createTestSourceData(5, 5)
      const invalidPolygon = new Float64Array([0, 0, 5, 5]) // 2点のみ

      const params: MaskParams = {
        sourceData,
        width: 5,
        height: 5,
        boundsX: 0,
        boundsY: 0,
        offsetX: 0,
        offsetY: 0,
        polygonPoints: invalidPolygon,
      }

      const result = applyLassoMaskCore(params)

      // 全ピクセルが元のまま
      for (let i = 0; i < 5 * 5; i++) {
        expect(result.data[i * 4 + 3]).toBe(255)
      }
    })

    test('空のポリゴンはソースをそのまま返す', () => {
      const sourceData = createTestSourceData(3, 3)
      const emptyPolygon = new Float64Array([])

      const params: MaskParams = {
        sourceData,
        width: 3,
        height: 3,
        boundsX: 0,
        boundsY: 0,
        offsetX: 0,
        offsetY: 0,
        polygonPoints: emptyPolygon,
      }

      const result = applyLassoMaskCore(params)

      // 全ピクセルが元のまま
      for (let i = 0; i < 3 * 3; i++) {
        expect(result.data[i * 4 + 3]).toBe(255)
      }
    })

    test('RGBチャンネルは変更されない', () => {
      // 異なる色のピクセルを持つデータ
      const sourceData = new Uint8ClampedArray(4 * 4) // 1x1
      sourceData[0] = 100 // R
      sourceData[1] = 150 // G
      sourceData[2] = 200 // B
      sourceData[3] = 255 // A

      // ポリゴン外に設定
      const polygon = new Float64Array([10, 10, 20, 10, 20, 20, 10, 20])

      const params: MaskParams = {
        sourceData,
        width: 1,
        height: 1,
        boundsX: 0,
        boundsY: 0,
        offsetX: 0,
        offsetY: 0,
        polygonPoints: polygon,
      }

      const result = applyLassoMaskCore(params)

      // RGBは保持、Aのみ0
      expect(result.data[0]).toBe(100)
      expect(result.data[1]).toBe(150)
      expect(result.data[2]).toBe(200)
      expect(result.data[3]).toBe(0)
    })

    test('結果のサイズが正しい', () => {
      const sourceData = createTestSourceData(15, 20)
      const polygon = new Float64Array([0, 0, 10, 0, 10, 10, 0, 10])

      const params: MaskParams = {
        sourceData,
        width: 15,
        height: 20,
        boundsX: 0,
        boundsY: 0,
        offsetX: 0,
        offsetY: 0,
        polygonPoints: polygon,
      }

      const result = applyLassoMaskCore(params)

      expect(result.width).toBe(15)
      expect(result.height).toBe(20)
      expect(result.data.length).toBe(15 * 20 * 4)
    })
  })
})
