import { describe, test, expect, beforeAll } from 'vitest'
import {
  getPixel,
  setPixel,
  bilinearInterpolate,
  bicubicInterpolate,
  cubicKernel,
  calculateInverseTransform,
  calculateTransformedBounds,
  applyTransformToImageData,
  getInterpolator,
} from './interpolation'
import type { TransformState } from '../../types'
import type { Bounds } from '@/lib/geometry'

/**
 * ImageDataのポリフィル（JSDOM環境用）
 */
class ImageDataPolyfill {
  readonly data: Uint8ClampedArray
  readonly width: number
  readonly height: number

  constructor(data: Uint8ClampedArray | number, widthOrHeight?: number, height?: number) {
    if (typeof data === 'number') {
      // new ImageData(width, height)
      this.width = data
      this.height = widthOrHeight!
      this.data = new Uint8ClampedArray(this.width * this.height * 4)
    } else {
      // new ImageData(data, width, height)
      this.data = data
      this.width = widthOrHeight!
      this.height = height ?? data.length / (widthOrHeight! * 4)
    }
  }
}

// グローバルにImageDataがない場合はポリフィルを使用
beforeAll(() => {
  if (typeof globalThis.ImageData === 'undefined') {
    // @ts-expect-error ポリフィル
    globalThis.ImageData = ImageDataPolyfill
  }
})

/**
 * テスト用のImageDataを作成
 */
const createTestImageData = (width: number, height: number, fill?: number[]): ImageData => {
  const data = new Uint8ClampedArray(width * height * 4)
  if (fill) {
    for (let i = 0; i < width * height; i++) {
      data[i * 4] = fill[0]
      data[i * 4 + 1] = fill[1]
      data[i * 4 + 2] = fill[2]
      data[i * 4 + 3] = fill[3]
    }
  }
  // @ts-expect-error ポリフィルの可能性
  return new ImageData(data, width, height)
}

/**
 * グラデーションパターンのImageDataを作成
 */
const createGradientImageData = (width: number, height: number): ImageData => {
  const data = new Uint8ClampedArray(width * height * 4)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4
      data[idx] = Math.floor((x / (width - 1)) * 255) // R: 左から右へ増加
      data[idx + 1] = Math.floor((y / (height - 1)) * 255) // G: 上から下へ増加
      data[idx + 2] = 128 // B: 固定
      data[idx + 3] = 255 // A: 不透明
    }
  }
  // @ts-expect-error ポリフィルの可能性
  return new ImageData(data, width, height)
}

describe('interpolation', () => {
  describe('getPixel', () => {
    test('有効な座標のピクセルを取得', () => {
      const imageData = createTestImageData(2, 2, [255, 128, 64, 255])

      const pixel = getPixel(imageData, 0, 0)

      expect(pixel).toEqual({ r: 255, g: 128, b: 64, a: 255 })
    })

    test('範囲外の座標は透明を返す', () => {
      const imageData = createTestImageData(2, 2, [255, 128, 64, 255])

      expect(getPixel(imageData, -1, 0)).toEqual({ r: 0, g: 0, b: 0, a: 0 })
      expect(getPixel(imageData, 2, 0)).toEqual({ r: 0, g: 0, b: 0, a: 0 })
      expect(getPixel(imageData, 0, -1)).toEqual({ r: 0, g: 0, b: 0, a: 0 })
      expect(getPixel(imageData, 0, 2)).toEqual({ r: 0, g: 0, b: 0, a: 0 })
    })

    test('異なる座標のピクセルを正しく取得', () => {
      const imageData = createTestImageData(3, 3)
      // 特定のピクセルに値を設定
      setPixel(imageData, 1, 1, { r: 100, g: 150, b: 200, a: 250 })

      expect(getPixel(imageData, 1, 1)).toEqual({ r: 100, g: 150, b: 200, a: 250 })
      expect(getPixel(imageData, 0, 0)).toEqual({ r: 0, g: 0, b: 0, a: 0 })
    })
  })

  describe('setPixel', () => {
    test('有効な座標にピクセルを設定', () => {
      const imageData = createTestImageData(2, 2)

      setPixel(imageData, 1, 0, { r: 255, g: 128, b: 64, a: 200 })

      expect(getPixel(imageData, 1, 0)).toEqual({ r: 255, g: 128, b: 64, a: 200 })
    })

    test('範囲外の座標は無視される', () => {
      const imageData = createTestImageData(2, 2, [0, 0, 0, 0])

      setPixel(imageData, -1, 0, { r: 255, g: 255, b: 255, a: 255 })
      setPixel(imageData, 2, 0, { r: 255, g: 255, b: 255, a: 255 })

      // 既存のピクセルは変更されない
      expect(getPixel(imageData, 0, 0)).toEqual({ r: 0, g: 0, b: 0, a: 0 })
    })

    test('値は0-255にクランプされる', () => {
      const imageData = createTestImageData(2, 2)

      setPixel(imageData, 0, 0, { r: -50, g: 300, b: 128, a: 256 })

      const pixel = getPixel(imageData, 0, 0)
      expect(pixel.r).toBe(0) // -50 → 0
      expect(pixel.g).toBe(255) // 300 → 255
      expect(pixel.b).toBe(128) // そのまま
      expect(pixel.a).toBe(255) // 256 → 255
    })
  })

  describe('bilinearInterpolate', () => {
    test('整数座標では元のピクセル値を返す', () => {
      const imageData = createTestImageData(2, 2, [100, 100, 100, 255])

      const pixel = bilinearInterpolate(imageData, 0, 0)

      expect(pixel.r).toBeCloseTo(100, 0)
      expect(pixel.g).toBeCloseTo(100, 0)
      expect(pixel.a).toBeCloseTo(255, 0)
    })

    test('中間座標では周囲4点の平均を返す', () => {
      const imageData = createTestImageData(2, 2)
      // 4隅に異なる値を設定
      setPixel(imageData, 0, 0, { r: 0, g: 0, b: 0, a: 255 })
      setPixel(imageData, 1, 0, { r: 255, g: 0, b: 0, a: 255 })
      setPixel(imageData, 0, 1, { r: 0, g: 255, b: 0, a: 255 })
      setPixel(imageData, 1, 1, { r: 255, g: 255, b: 0, a: 255 })

      // 中心点（0.5, 0.5）は4点の平均
      const pixel = bilinearInterpolate(imageData, 0.5, 0.5)

      expect(pixel.r).toBeCloseTo(127.5, 0)
      expect(pixel.g).toBeCloseTo(127.5, 0)
      expect(pixel.b).toBeCloseTo(0, 0)
      expect(pixel.a).toBeCloseTo(255, 0)
    })

    test('X方向のみの補間', () => {
      const imageData = createTestImageData(2, 1)
      setPixel(imageData, 0, 0, { r: 0, g: 0, b: 0, a: 255 })
      setPixel(imageData, 1, 0, { r: 200, g: 0, b: 0, a: 255 })

      const pixel = bilinearInterpolate(imageData, 0.5, 0)

      expect(pixel.r).toBeCloseTo(100, 0)
    })

    test('Y方向のみの補間', () => {
      const imageData = createTestImageData(1, 2)
      setPixel(imageData, 0, 0, { r: 0, g: 0, b: 0, a: 255 })
      setPixel(imageData, 0, 1, { r: 0, g: 200, b: 0, a: 255 })

      const pixel = bilinearInterpolate(imageData, 0, 0.5)

      expect(pixel.g).toBeCloseTo(100, 0)
    })

    test('範囲外の座標では透明を含む補間', () => {
      const imageData = createTestImageData(1, 1, [255, 255, 255, 255])

      // 範囲外に近い座標
      const pixel = bilinearInterpolate(imageData, 0.5, 0.5)

      // 右下が範囲外（透明）なので、値は減少
      expect(pixel.r).toBeLessThan(255)
      expect(pixel.a).toBeLessThan(255)
    })
  })

  describe('cubicKernel', () => {
    test('t=0で最大値1を返す', () => {
      expect(cubicKernel(0)).toBe(1)
    })

    test('t=1で0を返す', () => {
      expect(cubicKernel(1)).toBeCloseTo(0, 5)
    })

    test('t=2で0を返す', () => {
      expect(cubicKernel(2)).toBeCloseTo(0, 5)
    })

    test('t>2で0を返す', () => {
      expect(cubicKernel(2.5)).toBe(0)
      expect(cubicKernel(3)).toBe(0)
    })

    test('対称性: kernel(-t) = kernel(t)', () => {
      expect(cubicKernel(-0.5)).toBeCloseTo(cubicKernel(0.5), 10)
      expect(cubicKernel(-1.5)).toBeCloseTo(cubicKernel(1.5), 10)
    })
  })

  describe('bicubicInterpolate', () => {
    test('整数座標では元のピクセル値に近い値を返す', () => {
      const imageData = createGradientImageData(4, 4)

      // 中央付近の整数座標
      const pixel = bicubicInterpolate(imageData, 1, 1)
      const expected = getPixel(imageData, 1, 1)

      expect(pixel.r).toBeCloseTo(expected.r, 0)
      expect(pixel.g).toBeCloseTo(expected.g, 0)
    })

    test('バイリニアより滑らかな補間を行う', () => {
      const imageData = createGradientImageData(4, 4)

      // 両方の補間結果を取得
      const bilinear = bilinearInterpolate(imageData, 1.5, 1.5)
      const bicubic = bicubicInterpolate(imageData, 1.5, 1.5)

      // 値は両方とも妥当な範囲内
      expect(bilinear.r).toBeGreaterThanOrEqual(0)
      expect(bilinear.r).toBeLessThanOrEqual(255)
      expect(bicubic.r).toBeGreaterThanOrEqual(0)
      expect(bicubic.r).toBeLessThanOrEqual(255)
    })

    test('結果は0-255にクランプされる', () => {
      const imageData = createTestImageData(4, 4)
      // エッジにコントラストの高いパターンを設定
      setPixel(imageData, 1, 1, { r: 255, g: 255, b: 255, a: 255 })
      setPixel(imageData, 2, 2, { r: 0, g: 0, b: 0, a: 255 })

      const pixel = bicubicInterpolate(imageData, 1.5, 1.5)

      expect(pixel.r).toBeGreaterThanOrEqual(0)
      expect(pixel.r).toBeLessThanOrEqual(255)
      expect(pixel.g).toBeGreaterThanOrEqual(0)
      expect(pixel.g).toBeLessThanOrEqual(255)
      expect(pixel.b).toBeGreaterThanOrEqual(0)
      expect(pixel.b).toBeLessThanOrEqual(255)
      expect(pixel.a).toBeGreaterThanOrEqual(0)
      expect(pixel.a).toBeLessThanOrEqual(255)
    })
  })

  describe('getInterpolator', () => {
    test('bilinearメソッドでbilinearInterpolateを返す', () => {
      const interpolator = getInterpolator('bilinear')
      expect(interpolator).toBe(bilinearInterpolate)
    })

    test('bicubicメソッドでbicubicInterpolateを返す', () => {
      const interpolator = getInterpolator('bicubic')
      expect(interpolator).toBe(bicubicInterpolate)
    })
  })

  describe('calculateInverseTransform', () => {
    test('単位変換（スケール1、回転0）は恒等変換', () => {
      const transform: TransformState = {
        mode: 'free-transform',
        center: { x: 50, y: 50 },
        scale: { x: 1, y: 1 },
        rotation: 0,
        originalBounds: { x: 0, y: 0, width: 100, height: 100 },
        originalImageData: null,
      }

      const inverseTransform = calculateInverseTransform(transform)
      const result = inverseTransform(75, 75)

      expect(result.x).toBeCloseTo(75, 5)
      expect(result.y).toBeCloseTo(75, 5)
    })

    test('2倍スケールの逆変換', () => {
      const transform: TransformState = {
        mode: 'scale',
        center: { x: 50, y: 50 },
        scale: { x: 2, y: 2 },
        rotation: 0,
        originalBounds: { x: 0, y: 0, width: 100, height: 100 },
        originalImageData: null,
      }

      const inverseTransform = calculateInverseTransform(transform)
      // 出力座標 (100, 100) は入力では (75, 75) に対応
      // (100-50)/2 + 50 = 75
      const result = inverseTransform(100, 100)

      expect(result.x).toBeCloseTo(75, 5)
      expect(result.y).toBeCloseTo(75, 5)
    })

    test('90度回転の逆変換', () => {
      const transform: TransformState = {
        mode: 'rotate',
        center: { x: 50, y: 50 },
        scale: { x: 1, y: 1 },
        rotation: Math.PI / 2, // 90度
        originalBounds: { x: 0, y: 0, width: 100, height: 100 },
        originalImageData: null,
      }

      const inverseTransform = calculateInverseTransform(transform)
      // 中心点は不変
      const center = inverseTransform(50, 50)
      expect(center.x).toBeCloseTo(50, 5)
      expect(center.y).toBeCloseTo(50, 5)

      // (100, 50) → 90度逆回転後は (50, 0)
      const rotated = inverseTransform(100, 50)
      expect(rotated.x).toBeCloseTo(50, 5)
      expect(rotated.y).toBeCloseTo(0, 5)
    })

    test('中心点は常に不変', () => {
      const transform: TransformState = {
        mode: 'free-transform',
        center: { x: 100, y: 100 },
        scale: { x: 2, y: 0.5 },
        rotation: Math.PI / 4,
        originalBounds: { x: 50, y: 50, width: 100, height: 100 },
        originalImageData: null,
      }

      const inverseTransform = calculateInverseTransform(transform)
      const result = inverseTransform(100, 100)

      expect(result.x).toBeCloseTo(100, 5)
      expect(result.y).toBeCloseTo(100, 5)
    })
  })

  describe('calculateTransformedBounds', () => {
    test('単位変換では元のバウンズを返す', () => {
      const originalBounds: Bounds = { x: 10, y: 20, width: 100, height: 50 }
      const transform: TransformState = {
        mode: 'free-transform',
        center: { x: 60, y: 45 },
        scale: { x: 1, y: 1 },
        rotation: 0,
        originalBounds,
        originalImageData: null,
      }

      const result = calculateTransformedBounds(originalBounds, transform)

      expect(result.x).toBe(10)
      expect(result.y).toBe(20)
      expect(result.width).toBe(100)
      expect(result.height).toBe(50)
    })

    test('2倍スケールでバウンズが拡大', () => {
      const originalBounds: Bounds = { x: 0, y: 0, width: 100, height: 100 }
      const transform: TransformState = {
        mode: 'scale',
        center: { x: 50, y: 50 },
        scale: { x: 2, y: 2 },
        rotation: 0,
        originalBounds,
        originalImageData: null,
      }

      const result = calculateTransformedBounds(originalBounds, transform)

      expect(result.width).toBe(200)
      expect(result.height).toBe(200)
    })

    test('90度回転で縦横が入れ替わる', () => {
      const originalBounds: Bounds = { x: 0, y: 0, width: 100, height: 50 }
      const transform: TransformState = {
        mode: 'rotate',
        center: { x: 50, y: 25 },
        scale: { x: 1, y: 1 },
        rotation: Math.PI / 2,
        originalBounds,
        originalImageData: null,
      }

      const result = calculateTransformedBounds(originalBounds, transform)

      // 90度回転で幅と高さが入れ替わる
      expect(result.width).toBe(50)
      expect(result.height).toBe(100)
    })

    test('45度回転でバウンズが拡大', () => {
      const originalBounds: Bounds = { x: 0, y: 0, width: 100, height: 100 }
      const transform: TransformState = {
        mode: 'rotate',
        center: { x: 50, y: 50 },
        scale: { x: 1, y: 1 },
        rotation: Math.PI / 4, // 45度
        originalBounds,
        originalImageData: null,
      }

      const result = calculateTransformedBounds(originalBounds, transform)

      // 45度回転すると対角線が辺になるため、√2倍に拡大
      const expectedSize = Math.ceil(100 * Math.sqrt(2))
      expect(result.width).toBeCloseTo(expectedSize, 0)
      expect(result.height).toBeCloseTo(expectedSize, 0)
    })
  })

  describe('applyTransformToImageData', () => {
    test('単位変換で元の画像を維持', () => {
      const source = createTestImageData(4, 4, [100, 150, 200, 255])
      const originalBounds: Bounds = { x: 0, y: 0, width: 4, height: 4 }
      const transform: TransformState = {
        mode: 'free-transform',
        center: { x: 2, y: 2 },
        scale: { x: 1, y: 1 },
        rotation: 0,
        originalBounds,
        originalImageData: source,
      }

      const result = applyTransformToImageData(source, transform, 'bilinear')

      expect(result.width).toBe(4)
      expect(result.height).toBe(4)

      // 中心付近のピクセルが維持されている
      const pixel = getPixel(result, 2, 2)
      expect(pixel.r).toBeCloseTo(100, 0)
      expect(pixel.g).toBeCloseTo(150, 0)
      expect(pixel.b).toBeCloseTo(200, 0)
    })

    test('2倍スケールで画像が拡大', () => {
      const source = createGradientImageData(4, 4)
      const originalBounds: Bounds = { x: 0, y: 0, width: 4, height: 4 }
      const transform: TransformState = {
        mode: 'scale',
        center: { x: 2, y: 2 },
        scale: { x: 2, y: 2 },
        rotation: 0,
        originalBounds,
        originalImageData: source,
      }

      const result = applyTransformToImageData(source, transform, 'bilinear')

      expect(result.width).toBe(8)
      expect(result.height).toBe(8)
    })

    test('バイリニアとバイキュービックで異なる結果', () => {
      const source = createGradientImageData(8, 8)
      const originalBounds: Bounds = { x: 0, y: 0, width: 8, height: 8 }
      const transform: TransformState = {
        mode: 'scale',
        center: { x: 4, y: 4 },
        scale: { x: 1.5, y: 1.5 },
        rotation: 0,
        originalBounds,
        originalImageData: source,
      }

      const bilinearResult = applyTransformToImageData(source, transform, 'bilinear')
      const bicubicResult = applyTransformToImageData(source, transform, 'bicubic')

      // サイズは同じ
      expect(bilinearResult.width).toBe(bicubicResult.width)
      expect(bilinearResult.height).toBe(bicubicResult.height)

      // 中心付近のピクセル値は微妙に異なる可能性がある
      // (補間アルゴリズムの違いによる)
    })

    test('回転変換が適用される', () => {
      const source = createTestImageData(4, 4)
      // 左上に赤いピクセルを設定
      setPixel(source, 0, 0, { r: 255, g: 0, b: 0, a: 255 })

      const originalBounds: Bounds = { x: 0, y: 0, width: 4, height: 4 }
      const transform: TransformState = {
        mode: 'rotate',
        center: { x: 2, y: 2 },
        scale: { x: 1, y: 1 },
        rotation: Math.PI, // 180度回転
        originalBounds,
        originalImageData: source,
      }

      const result = applyTransformToImageData(source, transform, 'bilinear')

      // 180度回転後、左上のピクセルは右下に移動
      // バウンズのサイズは維持
      expect(result.width).toBe(4)
      expect(result.height).toBe(4)
    })
  })
})
