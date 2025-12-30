import { describe, it, expect, vi } from 'vitest'
import { getPixelColor } from './getPixelColor'

describe('getPixelColor', () => {
  const createMockCanvas = (width = 100, height = 100) => {
    return {
      width,
      height,
      getContext: vi.fn(),
    } as unknown as HTMLCanvasElement
  }

  describe('Canvas2D context', () => {
    it('不透明なピクセルの色をHEX形式で返す', () => {
      const canvas = createMockCanvas()
      const mockCtx = {
        getImageData: vi.fn().mockReturnValue({
          data: new Uint8ClampedArray([255, 128, 64, 255]), // 不透明
        }),
      }
      ;(canvas.getContext as ReturnType<typeof vi.fn>).mockImplementation((type: string) => {
        if (type === '2d') return mockCtx
        return null
      })

      const result = getPixelColor(canvas, 10, 20)

      expect(result).toBe('#ff8040')
      expect(mockCtx.getImageData).toHaveBeenCalledWith(10, 20, 1, 1)
    })

    it('透明なピクセル（alpha=0）の場合はnullを返す', () => {
      const canvas = createMockCanvas()
      const mockCtx = {
        getImageData: vi.fn().mockReturnValue({
          data: new Uint8ClampedArray([0, 0, 0, 0]), // 完全に透明
        }),
      }
      ;(canvas.getContext as ReturnType<typeof vi.fn>).mockImplementation((type: string) => {
        if (type === '2d') return mockCtx
        return null
      })

      const result = getPixelColor(canvas, 10, 20)

      expect(result).toBeNull()
    })

    it('ほぼ透明なピクセル（alpha<10）の場合はnullを返す', () => {
      const canvas = createMockCanvas()
      const mockCtx = {
        getImageData: vi.fn().mockReturnValue({
          data: new Uint8ClampedArray([100, 50, 25, 9]), // alpha=9
        }),
      }
      ;(canvas.getContext as ReturnType<typeof vi.fn>).mockImplementation((type: string) => {
        if (type === '2d') return mockCtx
        return null
      })

      const result = getPixelColor(canvas, 10, 20)

      expect(result).toBeNull()
    })

    it('alpha=10のピクセルは色を返す（しきい値境界）', () => {
      const canvas = createMockCanvas()
      const mockCtx = {
        getImageData: vi.fn().mockReturnValue({
          data: new Uint8ClampedArray([100, 50, 25, 10]), // alpha=10
        }),
      }
      ;(canvas.getContext as ReturnType<typeof vi.fn>).mockImplementation((type: string) => {
        if (type === '2d') return mockCtx
        return null
      })

      const result = getPixelColor(canvas, 10, 20)

      expect(result).toBe('#643219')
    })

    it('小数点座標は切り捨てられる', () => {
      const canvas = createMockCanvas()
      const mockCtx = {
        getImageData: vi.fn().mockReturnValue({
          data: new Uint8ClampedArray([255, 255, 255, 255]),
        }),
      }
      ;(canvas.getContext as ReturnType<typeof vi.fn>).mockImplementation((type: string) => {
        if (type === '2d') return mockCtx
        return null
      })

      getPixelColor(canvas, 10.7, 20.9)

      expect(mockCtx.getImageData).toHaveBeenCalledWith(10, 20, 1, 1)
    })

    it('コンテキストが取得できない場合はnullを返す', () => {
      const canvas = createMockCanvas()
      ;(canvas.getContext as ReturnType<typeof vi.fn>).mockReturnValue(null)

      const result = getPixelColor(canvas, 10, 20)

      expect(result).toBeNull()
    })
  })

  describe('WebGL context', () => {
    it('WebGL2コンテキストで不透明なピクセルの色を返す', () => {
      const canvas = createMockCanvas()
      const mockGl = {
        RGBA: 6408,
        UNSIGNED_BYTE: 5121,
        readPixels: vi.fn((_x, _y, _w, _h, _format, _type, pixels: Uint8Array) => {
          pixels[0] = 255
          pixels[1] = 0
          pixels[2] = 128
          pixels[3] = 255 // 不透明
        }),
      }
      ;(canvas.getContext as ReturnType<typeof vi.fn>).mockImplementation((type: string) => {
        if (type === 'webgl2') return mockGl
        return null
      })

      const result = getPixelColor(canvas, 10, 20)

      expect(result).toBe('#ff0080')
      // WebGLはY軸が反転しているので canvas.height - y - 1
      expect(mockGl.readPixels).toHaveBeenCalledWith(
        10,
        79,
        1,
        1,
        6408,
        5121,
        expect.any(Uint8Array)
      )
    })

    it('WebGLで透明なピクセルの場合はnullを返す', () => {
      const canvas = createMockCanvas()
      const mockGl = {
        RGBA: 6408,
        UNSIGNED_BYTE: 5121,
        readPixels: vi.fn((_x, _y, _w, _h, _format, _type, pixels: Uint8Array) => {
          pixels[0] = 0
          pixels[1] = 0
          pixels[2] = 0
          pixels[3] = 0 // 透明
        }),
      }
      ;(canvas.getContext as ReturnType<typeof vi.fn>).mockImplementation((type: string) => {
        if (type === 'webgl2') return mockGl
        return null
      })

      const result = getPixelColor(canvas, 10, 20)

      expect(result).toBeNull()
    })

    it('WebGL1にフォールバックする', () => {
      const canvas = createMockCanvas()
      const mockGl = {
        RGBA: 6408,
        UNSIGNED_BYTE: 5121,
        readPixels: vi.fn((_x, _y, _w, _h, _format, _type, pixels: Uint8Array) => {
          pixels[0] = 128
          pixels[1] = 64
          pixels[2] = 32
          pixels[3] = 255
        }),
      }
      ;(canvas.getContext as ReturnType<typeof vi.fn>).mockImplementation((type: string) => {
        if (type === 'webgl2') return null
        if (type === 'webgl') return mockGl
        return null
      })

      const result = getPixelColor(canvas, 10, 20)

      expect(result).toBe('#804020')
    })
  })
})
