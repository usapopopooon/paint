import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getPixelColor } from './getPixelColor'

describe('getPixelColor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Canvas2D context', () => {
    it('should return hex color from 2D canvas', () => {
      const mockImageData = {
        data: new Uint8ClampedArray([255, 128, 64, 255]), // RGBA
      }
      const mockCtx = {
        getImageData: vi.fn().mockReturnValue(mockImageData),
      }
      const mockCanvas = {
        getContext: vi.fn((type: string) => {
          if (type === '2d') return mockCtx
          return null
        }),
        height: 100,
      } as unknown as HTMLCanvasElement

      const result = getPixelColor(mockCanvas, 10, 20)

      expect(result).toBe('#ff8040')
      expect(mockCtx.getImageData).toHaveBeenCalledWith(10, 20, 1, 1)
    })

    it('should floor decimal coordinates', () => {
      const mockImageData = {
        data: new Uint8ClampedArray([0, 0, 0, 255]),
      }
      const mockCtx = {
        getImageData: vi.fn().mockReturnValue(mockImageData),
      }
      const mockCanvas = {
        getContext: vi.fn((type: string) => {
          if (type === '2d') return mockCtx
          return null
        }),
        height: 100,
      } as unknown as HTMLCanvasElement

      getPixelColor(mockCanvas, 10.7, 20.9)

      expect(mockCtx.getImageData).toHaveBeenCalledWith(10, 20, 1, 1)
    })

    it('should return null when no context available', () => {
      const mockCanvas = {
        getContext: vi.fn().mockReturnValue(null),
        height: 100,
      } as unknown as HTMLCanvasElement

      const result = getPixelColor(mockCanvas, 10, 20)

      expect(result).toBeNull()
    })

    it('should pad single digit hex values', () => {
      const mockImageData = {
        data: new Uint8ClampedArray([0, 5, 15, 255]),
      }
      const mockCtx = {
        getImageData: vi.fn().mockReturnValue(mockImageData),
      }
      const mockCanvas = {
        getContext: vi.fn((type: string) => {
          if (type === '2d') return mockCtx
          return null
        }),
        height: 100,
      } as unknown as HTMLCanvasElement

      const result = getPixelColor(mockCanvas, 0, 0)

      expect(result).toBe('#00050f')
    })

    it('透明なピクセル（alpha=0）の場合はnullを返す', () => {
      const mockImageData = {
        data: new Uint8ClampedArray([0, 0, 0, 0]), // 完全に透明
      }
      const mockCtx = {
        getImageData: vi.fn().mockReturnValue(mockImageData),
      }
      const mockCanvas = {
        getContext: vi.fn((type: string) => {
          if (type === '2d') return mockCtx
          return null
        }),
        height: 100,
      } as unknown as HTMLCanvasElement

      const result = getPixelColor(mockCanvas, 10, 20)

      expect(result).toBeNull()
    })

    it('ほぼ透明なピクセル（alpha<10）の場合はnullを返す', () => {
      const mockImageData = {
        data: new Uint8ClampedArray([100, 50, 25, 9]), // alpha=9
      }
      const mockCtx = {
        getImageData: vi.fn().mockReturnValue(mockImageData),
      }
      const mockCanvas = {
        getContext: vi.fn((type: string) => {
          if (type === '2d') return mockCtx
          return null
        }),
        height: 100,
      } as unknown as HTMLCanvasElement

      const result = getPixelColor(mockCanvas, 10, 20)

      expect(result).toBeNull()
    })

    it('alpha=10のピクセルは色を返す（しきい値境界）', () => {
      const mockImageData = {
        data: new Uint8ClampedArray([100, 50, 25, 10]), // alpha=10
      }
      const mockCtx = {
        getImageData: vi.fn().mockReturnValue(mockImageData),
      }
      const mockCanvas = {
        getContext: vi.fn((type: string) => {
          if (type === '2d') return mockCtx
          return null
        }),
        height: 100,
      } as unknown as HTMLCanvasElement

      const result = getPixelColor(mockCanvas, 10, 20)

      expect(result).toBe('#643219')
    })
  })

  describe('WebGL context', () => {
    it('should return hex color from WebGL canvas', () => {
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

    it('should prefer webgl2 over webgl', () => {
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
        height: 100,
      } as unknown as HTMLCanvasElement

      getPixelColor(mockCanvas, 0, 0)

      expect(mockGl2.readPixels).toHaveBeenCalled()
      expect(mockGl.readPixels).not.toHaveBeenCalled()
    })

    it('WebGLで透明なピクセルの場合はnullを返す', () => {
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
        height: 100,
      } as unknown as HTMLCanvasElement

      const result = getPixelColor(mockCanvas, 10, 20)

      expect(result).toBeNull()
    })
  })
})
