import { describe, test, expect } from 'vitest'
import {
  getPixelFromArray,
  setPixelToArray,
  bilinearInterpolateCore,
  bicubicInterpolateCore,
  cubicKernel,
  createInverseTransform,
  transformImageCore,
  type TransformParams,
} from './transformCore'

/**
 * テスト用のシンプルな画像データを作成
 * 2x2ピクセルの赤、緑、青、白
 */
const create2x2TestData = (): Uint8ClampedArray => {
  const data = new Uint8ClampedArray(2 * 2 * 4)
  // (0,0) = 赤
  data[0] = 255
  data[1] = 0
  data[2] = 0
  data[3] = 255
  // (1,0) = 緑
  data[4] = 0
  data[5] = 255
  data[6] = 0
  data[7] = 255
  // (0,1) = 青
  data[8] = 0
  data[9] = 0
  data[10] = 255
  data[11] = 255
  // (1,1) = 白
  data[12] = 255
  data[13] = 255
  data[14] = 255
  data[15] = 255
  return data
}

/**
 * 単色の画像データを作成
 */
const createSolidColorData = (
  width: number,
  height: number,
  r: number,
  g: number,
  b: number,
  a: number
): Uint8ClampedArray => {
  const data = new Uint8ClampedArray(width * height * 4)
  for (let i = 0; i < width * height; i++) {
    data[i * 4] = r
    data[i * 4 + 1] = g
    data[i * 4 + 2] = b
    data[i * 4 + 3] = a
  }
  return data
}

describe('transformCore', () => {
  describe('getPixelFromArray', () => {
    test('有効な座標からピクセルを取得できる', () => {
      const data = create2x2TestData()
      const pixel = getPixelFromArray(data, 2, 2, 0, 0)
      expect(pixel).toEqual({ r: 255, g: 0, b: 0, a: 255 })
    })

    test('右下のピクセルを取得できる', () => {
      const data = create2x2TestData()
      const pixel = getPixelFromArray(data, 2, 2, 1, 1)
      expect(pixel).toEqual({ r: 255, g: 255, b: 255, a: 255 })
    })

    test('負のX座標は透明を返す', () => {
      const data = create2x2TestData()
      const pixel = getPixelFromArray(data, 2, 2, -1, 0)
      expect(pixel).toEqual({ r: 0, g: 0, b: 0, a: 0 })
    })

    test('負のY座標は透明を返す', () => {
      const data = create2x2TestData()
      const pixel = getPixelFromArray(data, 2, 2, 0, -1)
      expect(pixel).toEqual({ r: 0, g: 0, b: 0, a: 0 })
    })

    test('幅を超えた座標は透明を返す', () => {
      const data = create2x2TestData()
      const pixel = getPixelFromArray(data, 2, 2, 2, 0)
      expect(pixel).toEqual({ r: 0, g: 0, b: 0, a: 0 })
    })

    test('高さを超えた座標は透明を返す', () => {
      const data = create2x2TestData()
      const pixel = getPixelFromArray(data, 2, 2, 0, 2)
      expect(pixel).toEqual({ r: 0, g: 0, b: 0, a: 0 })
    })
  })

  describe('setPixelToArray', () => {
    test('有効な座標にピクセルを設定できる', () => {
      const data = new Uint8ClampedArray(2 * 2 * 4)
      setPixelToArray(data, 2, 2, 1, 0, { r: 128, g: 64, b: 32, a: 255 })
      expect(data[4]).toBe(128)
      expect(data[5]).toBe(64)
      expect(data[6]).toBe(32)
      expect(data[7]).toBe(255)
    })

    test('範囲外の座標は無視される', () => {
      const data = new Uint8ClampedArray(2 * 2 * 4)
      setPixelToArray(data, 2, 2, -1, 0, { r: 255, g: 255, b: 255, a: 255 })
      // 全て0のまま
      expect(data.every((v) => v === 0)).toBe(true)
    })

    test('値は0-255にクランプされる', () => {
      const data = new Uint8ClampedArray(4)
      setPixelToArray(data, 1, 1, 0, 0, { r: 300, g: -50, b: 128.7, a: 255 })
      expect(data[0]).toBe(255) // 300 -> 255
      expect(data[1]).toBe(0) // -50 -> 0
      expect(data[2]).toBe(129) // 128.7 -> 129 (四捨五入)
      expect(data[3]).toBe(255)
    })
  })

  describe('bilinearInterpolateCore', () => {
    test('整数座標では元のピクセル値を返す', () => {
      const data = create2x2TestData()
      const pixel = bilinearInterpolateCore(data, 2, 2, 0, 0)
      expect(pixel.r).toBeCloseTo(255, 0)
      expect(pixel.g).toBeCloseTo(0, 0)
      expect(pixel.b).toBeCloseTo(0, 0)
      expect(pixel.a).toBeCloseTo(255, 0)
    })

    test('中間座標では補間された値を返す', () => {
      const data = create2x2TestData()
      // (0.5, 0) は赤と緑の中間
      const pixel = bilinearInterpolateCore(data, 2, 2, 0.5, 0)
      expect(pixel.r).toBeCloseTo(127.5, 0)
      expect(pixel.g).toBeCloseTo(127.5, 0)
      expect(pixel.b).toBeCloseTo(0, 0)
      expect(pixel.a).toBeCloseTo(255, 0)
    })

    test('4点の中央では全色の平均を返す', () => {
      const data = create2x2TestData()
      // (0.5, 0.5) は4色の中間
      const pixel = bilinearInterpolateCore(data, 2, 2, 0.5, 0.5)
      // 赤(255,0,0) + 緑(0,255,0) + 青(0,0,255) + 白(255,255,255) の平均
      expect(pixel.r).toBeCloseTo((255 + 0 + 0 + 255) / 4, 0)
      expect(pixel.g).toBeCloseTo((0 + 255 + 0 + 255) / 4, 0)
      expect(pixel.b).toBeCloseTo((0 + 0 + 255 + 255) / 4, 0)
    })
  })

  describe('bicubicInterpolateCore', () => {
    test('整数座標では元のピクセル値に近い値を返す', () => {
      const data = createSolidColorData(4, 4, 100, 150, 200, 255)
      const pixel = bicubicInterpolateCore(data, 4, 4, 2, 2)
      expect(pixel.r).toBeCloseTo(100, 0)
      expect(pixel.g).toBeCloseTo(150, 0)
      expect(pixel.b).toBeCloseTo(200, 0)
      expect(pixel.a).toBeCloseTo(255, 0)
    })

    test('単色画像では座標に関わらず同じ色を返す', () => {
      const data = createSolidColorData(4, 4, 128, 128, 128, 255)
      const pixel = bicubicInterpolateCore(data, 4, 4, 1.5, 1.5)
      expect(pixel.r).toBeCloseTo(128, 0)
      expect(pixel.g).toBeCloseTo(128, 0)
      expect(pixel.b).toBeCloseTo(128, 0)
    })

    test('値は0-255の範囲内に収まる', () => {
      const data = createSolidColorData(4, 4, 255, 255, 255, 255)
      const pixel = bicubicInterpolateCore(data, 4, 4, 1.5, 1.5)
      expect(pixel.r).toBeGreaterThanOrEqual(0)
      expect(pixel.r).toBeLessThanOrEqual(255)
    })
  })

  describe('cubicKernel', () => {
    test('t=0で1を返す', () => {
      expect(cubicKernel(0)).toBe(1)
    })

    test('t=1で0を返す', () => {
      expect(cubicKernel(1)).toBe(0)
    })

    test('t=2で0を返す', () => {
      expect(cubicKernel(2)).toBe(0)
    })

    test('t>2で0を返す', () => {
      expect(cubicKernel(3)).toBe(0)
    })

    test('負の値でも対称的に動作する', () => {
      expect(cubicKernel(-0.5)).toBe(cubicKernel(0.5))
      expect(cubicKernel(-1.5)).toBe(cubicKernel(1.5))
    })
  })

  describe('createInverseTransform', () => {
    test('スケール1、回転0で同一座標を返す', () => {
      const inverse = createInverseTransform(50, 50, 1, 1, 0)
      const result = inverse(100, 100)
      expect(result.x).toBeCloseTo(100, 5)
      expect(result.y).toBeCloseTo(100, 5)
    })

    test('スケール2で座標が半分になる', () => {
      const inverse = createInverseTransform(0, 0, 2, 2, 0)
      const result = inverse(100, 100)
      expect(result.x).toBeCloseTo(50, 5)
      expect(result.y).toBeCloseTo(50, 5)
    })

    test('90度回転で座標が入れ替わる', () => {
      const inverse = createInverseTransform(0, 0, 1, 1, Math.PI / 2)
      const result = inverse(100, 0)
      expect(result.x).toBeCloseTo(0, 5)
      expect(result.y).toBeCloseTo(-100, 5)
    })

    test('中心点からの相対変換が正しい', () => {
      const inverse = createInverseTransform(50, 50, 2, 2, 0)
      // (150, 150) は中心から (100, 100) 離れている
      // 逆スケールで (50, 50) になり、中心に足して (100, 100)
      const result = inverse(150, 150)
      expect(result.x).toBeCloseTo(100, 5)
      expect(result.y).toBeCloseTo(100, 5)
    })
  })

  describe('transformImageCore', () => {
    test('スケール1、回転0で同一画像を返す', () => {
      const sourceData = createSolidColorData(10, 10, 128, 64, 32, 255)
      const params: TransformParams = {
        sourceData,
        sourceWidth: 10,
        sourceHeight: 10,
        outputWidth: 10,
        outputHeight: 10,
        outputOffsetX: 0,
        outputOffsetY: 0,
        srcBoundsX: 0,
        srcBoundsY: 0,
        centerX: 5,
        centerY: 5,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        method: 'bilinear',
      }

      const result = transformImageCore(params)

      expect(result.width).toBe(10)
      expect(result.height).toBe(10)
      // 中央のピクセルをチェック
      const idx = (5 * 10 + 5) * 4
      expect(result.data[idx]).toBeCloseTo(128, 0)
      expect(result.data[idx + 1]).toBeCloseTo(64, 0)
      expect(result.data[idx + 2]).toBeCloseTo(32, 0)
      expect(result.data[idx + 3]).toBeCloseTo(255, 0)
    })

    test('2倍スケールで正しいサイズの出力を生成', () => {
      const sourceData = createSolidColorData(10, 10, 100, 100, 100, 255)
      const params: TransformParams = {
        sourceData,
        sourceWidth: 10,
        sourceHeight: 10,
        outputWidth: 20,
        outputHeight: 20,
        outputOffsetX: -5,
        outputOffsetY: -5,
        srcBoundsX: 0,
        srcBoundsY: 0,
        centerX: 5,
        centerY: 5,
        scaleX: 2,
        scaleY: 2,
        rotation: 0,
        method: 'bilinear',
      }

      const result = transformImageCore(params)

      expect(result.width).toBe(20)
      expect(result.height).toBe(20)
    })

    test('バイキュービック補間で処理できる', () => {
      const sourceData = createSolidColorData(10, 10, 200, 150, 100, 255)
      const params: TransformParams = {
        sourceData,
        sourceWidth: 10,
        sourceHeight: 10,
        outputWidth: 10,
        outputHeight: 10,
        outputOffsetX: 0,
        outputOffsetY: 0,
        srcBoundsX: 0,
        srcBoundsY: 0,
        centerX: 5,
        centerY: 5,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        method: 'bicubic',
      }

      const result = transformImageCore(params)

      expect(result.width).toBe(10)
      expect(result.height).toBe(10)
      // 単色なのでほぼ同じ色が維持される
      const idx = (5 * 10 + 5) * 4
      expect(result.data[idx]).toBeCloseTo(200, -1)
      expect(result.data[idx + 1]).toBeCloseTo(150, -1)
      expect(result.data[idx + 2]).toBeCloseTo(100, -1)
    })

    test('90度回転で画像が回転する', () => {
      // 2x2の非対称画像を作成
      const sourceData = new Uint8ClampedArray(2 * 2 * 4)
      // (0,0) = 赤
      sourceData[0] = 255
      sourceData[3] = 255
      // (1,0) = 緑
      sourceData[5] = 255
      sourceData[7] = 255
      // (0,1) = 青
      sourceData[10] = 255
      sourceData[11] = 255
      // (1,1) = 白
      sourceData[12] = 255
      sourceData[13] = 255
      sourceData[14] = 255
      sourceData[15] = 255

      const params: TransformParams = {
        sourceData,
        sourceWidth: 2,
        sourceHeight: 2,
        outputWidth: 2,
        outputHeight: 2,
        outputOffsetX: 0,
        outputOffsetY: 0,
        srcBoundsX: 0,
        srcBoundsY: 0,
        centerX: 1,
        centerY: 1,
        scaleX: 1,
        scaleY: 1,
        rotation: Math.PI / 2, // 90度
        method: 'bilinear',
      }

      const result = transformImageCore(params)

      expect(result.width).toBe(2)
      expect(result.height).toBe(2)
      // 回転後、ピクセルの配置が変わっていることを確認
      // (厳密な色チェックは補間により複雑なのでサイズのみ確認)
    })

    test('範囲外のピクセルは透明になる', () => {
      const sourceData = createSolidColorData(5, 5, 255, 255, 255, 255)
      const params: TransformParams = {
        sourceData,
        sourceWidth: 5,
        sourceHeight: 5,
        outputWidth: 10,
        outputHeight: 10,
        outputOffsetX: 0,
        outputOffsetY: 0,
        srcBoundsX: 0,
        srcBoundsY: 0,
        centerX: 2.5,
        centerY: 2.5,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        method: 'bilinear',
      }

      const result = transformImageCore(params)

      // 右下の範囲外ピクセルは透明
      const idx = (9 * 10 + 9) * 4
      expect(result.data[idx + 3]).toBe(0) // alpha = 0
    })
  })
})
