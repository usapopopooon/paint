import { describe, test, expect, vi, beforeEach } from 'vitest'
import { getPixelColor, invalidatePixelColorCache } from './getPixelColor'
import { TRANSPARENT_THRESHOLD } from '../constants'

describe('getPixelColor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  /**
   * Canvas2Dテスト用のモックキャンバスを作成
   * ImageDataは全体を取得するため、widthとheightが必要
   */
  const createMockCanvas2D = (
    imageData: Uint8ClampedArray,
    width: number,
    height: number
  ): HTMLCanvasElement => {
    const mockCtx = {
      getImageData: vi.fn().mockReturnValue({ data: imageData }),
    }
    const mockCanvas = {
      getContext: vi.fn((type: string) => {
        if (type === '2d') return mockCtx
        return null
      }),
      width,
      height,
    } as unknown as HTMLCanvasElement

    // 新しいキャンバスなのでキャッシュをクリア
    invalidatePixelColorCache(mockCanvas)

    return mockCanvas
  }

  describe('Canvas2D context', () => {
    test('2Dキャンバスからhex色を返す', () => {
      // 2x2キャンバス、(1,1)のピクセルを取得
      const imageData = new Uint8ClampedArray([
        0,
        0,
        0,
        255, // (0,0) 黒
        0,
        0,
        0,
        255, // (1,0) 黒
        0,
        0,
        0,
        255, // (0,1) 黒
        255,
        128,
        64,
        255, // (1,1) 対象
      ])
      const mockCanvas = createMockCanvas2D(imageData, 2, 2)

      const result = getPixelColor(mockCanvas, 1, 1)

      expect(result).toBe('#ff8040')
    })

    test('小数座標を切り捨てる', () => {
      // 2x2キャンバス、(0,0)のピクセルを取得
      const imageData = new Uint8ClampedArray([
        100,
        50,
        25,
        255, // (0,0) 対象
        0,
        0,
        0,
        255, // (1,0)
        0,
        0,
        0,
        255, // (0,1)
        0,
        0,
        0,
        255, // (1,1)
      ])
      const mockCanvas = createMockCanvas2D(imageData, 2, 2)

      const result = getPixelColor(mockCanvas, 0.7, 0.9)

      expect(result).toBe('#643219')
    })

    test('コンテキストが取得できない場合はnullを返す', () => {
      const mockCanvas = {
        getContext: vi.fn().mockReturnValue(null),
        width: 100,
        height: 100,
      } as unknown as HTMLCanvasElement

      const result = getPixelColor(mockCanvas, 10, 20)

      expect(result).toBeNull()
    })

    test('1桁のhex値をゼロパディングする', () => {
      const imageData = new Uint8ClampedArray([0, 5, 15, 255])
      const mockCanvas = createMockCanvas2D(imageData, 1, 1)

      const result = getPixelColor(mockCanvas, 0, 0)

      expect(result).toBe('#00050f')
    })

    test('透明なピクセル（alpha=0）の場合はnullを返す', () => {
      const imageData = new Uint8ClampedArray([0, 0, 0, 0]) // 完全に透明
      const mockCanvas = createMockCanvas2D(imageData, 1, 1)

      const result = getPixelColor(mockCanvas, 0, 0)

      expect(result).toBeNull()
    })

    test('ほぼ透明なピクセル（alpha<TRANSPARENT_THRESHOLD）の場合はnullを返す', () => {
      const imageData = new Uint8ClampedArray([100, 50, 25, TRANSPARENT_THRESHOLD - 1])
      const mockCanvas = createMockCanvas2D(imageData, 1, 1)

      const result = getPixelColor(mockCanvas, 0, 0)

      expect(result).toBeNull()
    })

    test('alpha=TRANSPARENT_THRESHOLDのピクセルは色を返す（しきい値境界）', () => {
      const imageData = new Uint8ClampedArray([100, 50, 25, TRANSPARENT_THRESHOLD])
      const mockCanvas = createMockCanvas2D(imageData, 1, 1)

      const result = getPixelColor(mockCanvas, 0, 0)

      expect(result).toBe('#643219')
    })

    test('範囲外の座標はnullを返す', () => {
      const imageData = new Uint8ClampedArray([255, 0, 0, 255])
      const mockCanvas = createMockCanvas2D(imageData, 1, 1)

      expect(getPixelColor(mockCanvas, -1, 0)).toBeNull()
      expect(getPixelColor(mockCanvas, 0, -1)).toBeNull()
      expect(getPixelColor(mockCanvas, 1, 0)).toBeNull()
      expect(getPixelColor(mockCanvas, 0, 1)).toBeNull()
    })
  })

  describe('ImageDataキャッシュ', () => {
    test('同じキャンバスへの連続アクセスでgetImageDataは1回だけ呼ばれる', () => {
      const imageData = new Uint8ClampedArray([
        255,
        0,
        0,
        255, // (0,0) 赤
        0,
        255,
        0,
        255, // (1,0) 緑
        0,
        0,
        255,
        255, // (0,1) 青
        255,
        255,
        0,
        255, // (1,1) 黄
      ])
      const mockCtx = {
        getImageData: vi.fn().mockReturnValue({ data: imageData }),
      }
      const mockCanvas = {
        getContext: vi.fn((type: string) => {
          if (type === '2d') return mockCtx
          return null
        }),
        width: 2,
        height: 2,
      } as unknown as HTMLCanvasElement

      // キャッシュをクリア
      invalidatePixelColorCache(mockCanvas)

      // 複数回呼び出し
      expect(getPixelColor(mockCanvas, 0, 0)).toBe('#ff0000')
      expect(getPixelColor(mockCanvas, 1, 0)).toBe('#00ff00')
      expect(getPixelColor(mockCanvas, 0, 1)).toBe('#0000ff')
      expect(getPixelColor(mockCanvas, 1, 1)).toBe('#ffff00')

      // getImageDataは1回だけ呼ばれる
      expect(mockCtx.getImageData).toHaveBeenCalledTimes(1)
      expect(mockCtx.getImageData).toHaveBeenCalledWith(0, 0, 2, 2)
    })

    test('invalidatePixelColorCacheを呼ぶとキャッシュがクリアされる', () => {
      const imageData = new Uint8ClampedArray([255, 0, 0, 255])
      const mockCtx = {
        getImageData: vi.fn().mockReturnValue({ data: imageData }),
      }
      const mockCanvas = {
        getContext: vi.fn((type: string) => {
          if (type === '2d') return mockCtx
          return null
        }),
        width: 1,
        height: 1,
      } as unknown as HTMLCanvasElement

      // 初回
      invalidatePixelColorCache(mockCanvas)
      getPixelColor(mockCanvas, 0, 0)
      expect(mockCtx.getImageData).toHaveBeenCalledTimes(1)

      // キャッシュクリア後
      invalidatePixelColorCache(mockCanvas)
      getPixelColor(mockCanvas, 0, 0)
      expect(mockCtx.getImageData).toHaveBeenCalledTimes(2)
    })

    test('キャンバスサイズが変わるとキャッシュが更新される', () => {
      const imageData1 = new Uint8ClampedArray([255, 0, 0, 255])
      const imageData2 = new Uint8ClampedArray([
        0, 255, 0, 255, 0, 0, 255, 255, 255, 255, 0, 255, 255, 0, 255, 255,
      ])
      const mockCtx = {
        getImageData: vi
          .fn()
          .mockReturnValueOnce({ data: imageData1 })
          .mockReturnValueOnce({ data: imageData2 }),
      }
      const mockCanvas = {
        getContext: vi.fn((type: string) => {
          if (type === '2d') return mockCtx
          return null
        }),
        width: 1,
        height: 1,
      } as unknown as HTMLCanvasElement

      invalidatePixelColorCache(mockCanvas)
      getPixelColor(mockCanvas, 0, 0)
      expect(mockCtx.getImageData).toHaveBeenCalledTimes(1)

      // サイズ変更
      ;(mockCanvas as { width: number }).width = 2
      ;(mockCanvas as { height: number }).height = 2

      getPixelColor(mockCanvas, 0, 0)
      expect(mockCtx.getImageData).toHaveBeenCalledTimes(2)
    })
  })

  describe('WebGL context', () => {
    test('WebGLキャンバスからhex色を返す', () => {
      const mockGl = {
        readPixels: vi.fn(
          (
            _x: number,
            _y: number,
            _w: number,
            _h: number,
            _format: number,
            _type: number,
            pixels: Uint8Array
          ) => {
            pixels[0] = 100
            pixels[1] = 150
            pixels[2] = 200
            pixels[3] = 255
          }
        ),
        RGBA: 6408,
        UNSIGNED_BYTE: 5121,
      }
      const mockCanvas = {
        getContext: vi.fn((type: string) => {
          if (type === 'webgl2' || type === 'webgl') return mockGl
          return null
        }),
        width: 100,
        height: 100,
      } as unknown as HTMLCanvasElement

      const result = getPixelColor(mockCanvas, 10, 20)

      expect(result).toBe('#6496c8')
      // Y座標は反転される: 100 - 20 - 1 = 79
      expect(mockGl.readPixels).toHaveBeenCalledWith(
        10,
        79,
        1,
        1,
        mockGl.RGBA,
        mockGl.UNSIGNED_BYTE,
        expect.any(Uint8Array)
      )
    })

    test('webgl2をwebglより優先する', () => {
      const mockGl2 = {
        readPixels: vi.fn(),
        RGBA: 6408,
        UNSIGNED_BYTE: 5121,
      }
      const mockGl = {
        readPixels: vi.fn(),
        RGBA: 6408,
        UNSIGNED_BYTE: 5121,
      }
      const mockCanvas = {
        getContext: vi.fn((type: string) => {
          if (type === 'webgl2') return mockGl2
          if (type === 'webgl') return mockGl
          return null
        }),
        width: 100,
        height: 100,
      } as unknown as HTMLCanvasElement

      getPixelColor(mockCanvas, 0, 0)

      expect(mockGl2.readPixels).toHaveBeenCalled()
      expect(mockGl.readPixels).not.toHaveBeenCalled()
    })

    test('WebGLで透明なピクセルの場合はnullを返す', () => {
      const mockGl = {
        readPixels: vi.fn(
          (
            _x: number,
            _y: number,
            _w: number,
            _h: number,
            _format: number,
            _type: number,
            pixels: Uint8Array
          ) => {
            pixels[0] = 0
            pixels[1] = 0
            pixels[2] = 0
            pixels[3] = 0 // 透明
          }
        ),
        RGBA: 6408,
        UNSIGNED_BYTE: 5121,
      }
      const mockCanvas = {
        getContext: vi.fn((type: string) => {
          if (type === 'webgl2') return mockGl
          return null
        }),
        width: 100,
        height: 100,
      } as unknown as HTMLCanvasElement

      const result = getPixelColor(mockCanvas, 10, 20)

      expect(result).toBeNull()
    })

    test('WebGLでも範囲外の座標はnullを返す', () => {
      const mockGl = {
        readPixels: vi.fn(),
        RGBA: 6408,
        UNSIGNED_BYTE: 5121,
      }
      const mockCanvas = {
        getContext: vi.fn((type: string) => {
          if (type === 'webgl2') return mockGl
          return null
        }),
        width: 100,
        height: 100,
      } as unknown as HTMLCanvasElement

      expect(getPixelColor(mockCanvas, -1, 0)).toBeNull()
      expect(getPixelColor(mockCanvas, 100, 0)).toBeNull()
      expect(mockGl.readPixels).not.toHaveBeenCalled()
    })
  })
})
