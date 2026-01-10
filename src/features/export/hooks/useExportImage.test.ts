import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useExportImage } from './useExportImage'
import type { ExportOptions } from '../types'

describe('useExportImage', () => {
  let mockCanvas: HTMLCanvasElement
  let mockContainer: HTMLDivElement
  let mockFullSizeCanvas: HTMLCanvasElement
  let mockOutputCanvas: HTMLCanvasElement
  let mockFullSizeContext: CanvasRenderingContext2D
  let mockOutputContext: CanvasRenderingContext2D
  let mockLink: HTMLAnchorElement
  let mockBlob: Blob
  let originalCreateElement: typeof document.createElement
  let mockShowBackgroundLayer: () => void
  let mockHideBackgroundLayer: () => void
  let canvasCreateCount: number

  beforeEach(() => {
    canvasCreateCount = 0

    // モックのBlob
    mockBlob = new Blob(['test'], { type: 'image/png' })

    // モックのキャンバス要素（WebGLコンテキストなし - フォールバックパス）
    mockCanvas = {
      width: 800,
      height: 600,
      getContext: vi.fn().mockReturnValue(null), // WebGLなし
    } as unknown as HTMLCanvasElement

    // モックのコンテナ要素
    mockContainer = {
      querySelector: vi.fn().mockReturnValue(mockCanvas),
    } as unknown as HTMLDivElement

    // フルサイズ用コンテキスト
    mockFullSizeContext = {
      fillStyle: '',
      fillRect: vi.fn(),
      drawImage: vi.fn(),
      globalCompositeOperation: 'source-over',
    } as unknown as CanvasRenderingContext2D

    // 出力用コンテキスト
    mockOutputContext = {
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high',
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D

    // フルサイズのオフスクリーンキャンバス
    mockFullSizeCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn().mockReturnValue(mockFullSizeContext),
      toDataURL: vi.fn().mockReturnValue('data:image/jpeg;base64,test'),
      toBlob: vi.fn((callback: BlobCallback) => callback(mockBlob)),
    } as unknown as HTMLCanvasElement

    // 出力用キャンバス
    mockOutputCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn().mockReturnValue(mockOutputContext),
      toDataURL: vi.fn().mockReturnValue('data:image/png;base64,test'),
      toBlob: vi.fn((callback: BlobCallback) => callback(mockBlob)),
    } as unknown as HTMLCanvasElement

    // モックのリンク要素
    mockLink = {
      download: '',
      href: '',
      click: vi.fn(),
    } as unknown as HTMLAnchorElement

    // 背景レイヤー表示/非表示のモック
    mockShowBackgroundLayer = vi.fn()
    mockHideBackgroundLayer = vi.fn()

    // URL.createObjectURLとrevokeObjectURLをモック
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test-url')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

    // document.createElementをモック
    originalCreateElement = document.createElement
    document.createElement = vi.fn((tagName: string) => {
      if (tagName === 'canvas') {
        // 1回目はフルサイズキャンバス、2回目は出力用キャンバス
        canvasCreateCount++
        if (canvasCreateCount === 1) {
          return mockFullSizeCanvas
        }
        return mockOutputCanvas
      }
      if (tagName === 'a') {
        return mockLink
      }
      return originalCreateElement.call(document, tagName)
    })

    // requestAnimationFrameをモック
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0)
      return 0
    })
  })

  afterEach(() => {
    document.createElement = originalCreateElement
    vi.restoreAllMocks()
  })

  test('downloadAsJpgはコンテナが存在しない場合は何もしない', async () => {
    const containerRef = { current: null }
    const { result } = renderHook(() => useExportImage(containerRef))

    await act(async () => {
      await result.current.downloadAsJpg(mockShowBackgroundLayer, mockHideBackgroundLayer)
    })

    expect(mockLink.click).not.toHaveBeenCalled()
  })

  test('downloadAsJpgはキャンバスが存在しない場合は何もしない', async () => {
    const emptyContainer = {
      querySelector: vi.fn().mockReturnValue(null),
    } as unknown as HTMLDivElement
    const containerRef = { current: emptyContainer }
    const { result } = renderHook(() => useExportImage(containerRef))

    await act(async () => {
      await result.current.downloadAsJpg(mockShowBackgroundLayer, mockHideBackgroundLayer)
    })

    expect(mockLink.click).not.toHaveBeenCalled()
    expect(mockHideBackgroundLayer).toHaveBeenCalled()
  })

  test('downloadAsJpgは背景レイヤーを一時的に表示する', async () => {
    const containerRef = { current: mockContainer }
    const { result } = renderHook(() => useExportImage(containerRef))

    await act(async () => {
      await result.current.downloadAsJpg(mockShowBackgroundLayer, mockHideBackgroundLayer)
    })

    expect(mockShowBackgroundLayer).toHaveBeenCalled()
    expect(mockHideBackgroundLayer).toHaveBeenCalled()
  })

  test('downloadAsJpgはオフスクリーンキャンバスを作成する', async () => {
    const containerRef = { current: mockContainer }
    const { result } = renderHook(() => useExportImage(containerRef))

    await act(async () => {
      await result.current.downloadAsJpg(mockShowBackgroundLayer, mockHideBackgroundLayer)
    })

    expect(document.createElement).toHaveBeenCalledWith('canvas')
    // フルサイズキャンバス
    expect(mockFullSizeCanvas.width).toBe(800)
    expect(mockFullSizeCanvas.height).toBe(600)
  })

  test('downloadAsJpgはWebGLがない場合フォールバックでキャンバスを直接描画する', async () => {
    const containerRef = { current: mockContainer }
    const { result } = renderHook(() => useExportImage(containerRef))

    await act(async () => {
      await result.current.downloadAsJpg(mockShowBackgroundLayer, mockHideBackgroundLayer)
    })

    // フルサイズキャンバスに元のキャンバスを描画
    expect(mockFullSizeContext.drawImage).toHaveBeenCalledWith(mockCanvas, 0, 0)
  })

  test('downloadAsJpgはJPEG形式でダウンロードリンクを作成する', async () => {
    const containerRef = { current: mockContainer }
    const { result } = renderHook(() => useExportImage(containerRef))

    await act(async () => {
      await result.current.downloadAsJpg(mockShowBackgroundLayer, mockHideBackgroundLayer)
    })

    // saveImage経由でtoBlobを使用（jpegQuality=92 → 0.92）
    expect(mockOutputCanvas.toBlob).toHaveBeenCalledWith(expect.any(Function), 'image/jpeg', 0.92)
    expect(mockLink.href).toBe('blob:test-url')
    expect(mockLink.download).toMatch(/^paint_\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.jpg$/)
    expect(mockLink.click).toHaveBeenCalled()
  })

  test('downloadAsJpgはフルサイズキャンバスのコンテキストが取得できない場合は何もしない', async () => {
    const mockOffscreenWithoutContext = {
      width: 0,
      height: 0,
      getContext: vi.fn().mockReturnValue(null),
    } as unknown as HTMLCanvasElement

    document.createElement = vi.fn((tagName: string) => {
      if (tagName === 'canvas') {
        return mockOffscreenWithoutContext
      }
      if (tagName === 'a') {
        return mockLink
      }
      return originalCreateElement.call(document, tagName)
    })

    const containerRef = { current: mockContainer }
    const { result } = renderHook(() => useExportImage(containerRef))

    await act(async () => {
      await result.current.downloadAsJpg(mockShowBackgroundLayer, mockHideBackgroundLayer)
    })

    expect(mockLink.click).not.toHaveBeenCalled()
    expect(mockHideBackgroundLayer).toHaveBeenCalled()
  })

  describe('WebGLパス', () => {
    let mockGl: WebGLRenderingContext
    let mockWebGLCanvas: HTMLCanvasElement

    beforeEach(() => {
      // WebGLコンテキストのモック
      mockGl = {
        RGBA: 6408,
        UNSIGNED_BYTE: 5121,
        readPixels: vi.fn(),
      } as unknown as WebGLRenderingContext

      // WebGL対応キャンバス
      mockWebGLCanvas = {
        width: 800,
        height: 600,
        getContext: vi.fn().mockReturnValue(mockGl),
      } as unknown as HTMLCanvasElement
    })

    test('downloadAsJpgはWebGLからピクセルデータを読み取る', async () => {
      const webglContainer = {
        querySelector: vi.fn().mockReturnValue(mockWebGLCanvas),
      } as unknown as HTMLDivElement

      // createImageDataとputImageDataのモック
      const mockImageData = { data: new Uint8ClampedArray(800 * 600 * 4) }
      mockFullSizeContext.createImageData = vi.fn().mockReturnValue(mockImageData)
      mockFullSizeContext.putImageData = vi.fn()

      const containerRef = { current: webglContainer }
      const { result } = renderHook(() => useExportImage(containerRef))

      await act(async () => {
        await result.current.downloadAsJpg(mockShowBackgroundLayer, mockHideBackgroundLayer)
      })

      expect(mockGl.readPixels).toHaveBeenCalledWith(
        0,
        0,
        800,
        600,
        mockGl.RGBA,
        mockGl.UNSIGNED_BYTE,
        expect.any(Uint8Array)
      )
      expect(mockFullSizeContext.putImageData).toHaveBeenCalled()
    })

    test('downloadAsJpgはWebGLでピクセルデータを読み取りダウンロードする', async () => {
      const webglContainer = {
        querySelector: vi.fn().mockReturnValue(mockWebGLCanvas),
      } as unknown as HTMLDivElement

      const mockImageData = { data: new Uint8ClampedArray(800 * 600 * 4) }
      mockFullSizeContext.createImageData = vi.fn().mockReturnValue(mockImageData)
      mockFullSizeContext.putImageData = vi.fn()

      const containerRef = { current: webglContainer }
      const { result } = renderHook(() => useExportImage(containerRef))

      await act(async () => {
        await result.current.downloadAsJpg(mockShowBackgroundLayer, mockHideBackgroundLayer)
      })

      expect(mockFullSizeContext.createImageData).toHaveBeenCalledWith(800, 600)
      expect(mockLink.click).toHaveBeenCalled()
    })
  })

  describe('saveImage', () => {
    const createOptions = (overrides: Partial<ExportOptions> = {}): ExportOptions => ({
      fileName: 'test-image',
      format: 'png',
      scale: '100',
      includeBackground: false,
      jpegQuality: 92,
      ...overrides,
    })

    test('コンテナが存在しない場合は何もしない', async () => {
      const containerRef = { current: null }
      const { result } = renderHook(() => useExportImage(containerRef))

      await act(async () => {
        await result.current.saveImage(
          createOptions(),
          mockShowBackgroundLayer,
          mockHideBackgroundLayer
        )
      })

      expect(mockLink.click).not.toHaveBeenCalled()
    })

    test('PNGでincludeBackground=falseの場合は背景レイヤーを表示しない', async () => {
      const containerRef = { current: mockContainer }
      const { result } = renderHook(() => useExportImage(containerRef))

      await act(async () => {
        await result.current.saveImage(
          createOptions({ format: 'png', includeBackground: false }),
          mockShowBackgroundLayer,
          mockHideBackgroundLayer
        )
      })

      expect(mockShowBackgroundLayer).not.toHaveBeenCalled()
      expect(mockHideBackgroundLayer).not.toHaveBeenCalled()
    })

    test('PNGでincludeBackground=trueの場合は背景レイヤーを表示する', async () => {
      const containerRef = { current: mockContainer }
      const { result } = renderHook(() => useExportImage(containerRef))

      await act(async () => {
        await result.current.saveImage(
          createOptions({ format: 'png', includeBackground: true }),
          mockShowBackgroundLayer,
          mockHideBackgroundLayer
        )
      })

      expect(mockShowBackgroundLayer).toHaveBeenCalled()
      expect(mockHideBackgroundLayer).toHaveBeenCalled()
    })

    test('JPGの場合は常に背景レイヤーを表示する', async () => {
      const containerRef = { current: mockContainer }
      const { result } = renderHook(() => useExportImage(containerRef))

      await act(async () => {
        await result.current.saveImage(
          createOptions({ format: 'jpg', includeBackground: false }),
          mockShowBackgroundLayer,
          mockHideBackgroundLayer
        )
      })

      expect(mockShowBackgroundLayer).toHaveBeenCalled()
      expect(mockHideBackgroundLayer).toHaveBeenCalled()
    })

    test('scale=100の場合はフルサイズで出力する', async () => {
      const containerRef = { current: mockContainer }
      const { result } = renderHook(() => useExportImage(containerRef))

      await act(async () => {
        await result.current.saveImage(
          createOptions({ scale: '100' }),
          mockShowBackgroundLayer,
          mockHideBackgroundLayer
        )
      })

      // 出力キャンバスがフルサイズ（800x600）
      expect(mockOutputCanvas.width).toBe(800)
      expect(mockOutputCanvas.height).toBe(600)
    })

    test('scale=50の場合は50%サイズで出力する', async () => {
      const containerRef = { current: mockContainer }
      const { result } = renderHook(() => useExportImage(containerRef))

      await act(async () => {
        await result.current.saveImage(
          createOptions({ scale: '50' }),
          mockShowBackgroundLayer,
          mockHideBackgroundLayer
        )
      })

      // 出力キャンバスが50%サイズ（400x300）
      expect(mockOutputCanvas.width).toBe(400)
      expect(mockOutputCanvas.height).toBe(300)
    })

    test('scale=25の場合は25%サイズで出力する', async () => {
      const containerRef = { current: mockContainer }
      const { result } = renderHook(() => useExportImage(containerRef))

      await act(async () => {
        await result.current.saveImage(
          createOptions({ scale: '25' }),
          mockShowBackgroundLayer,
          mockHideBackgroundLayer
        )
      })

      // 出力キャンバスが25%サイズ（200x150）
      expect(mockOutputCanvas.width).toBe(200)
      expect(mockOutputCanvas.height).toBe(150)
    })

    test('JPGの場合はjpegQualityを0-1に変換して使用する', async () => {
      const containerRef = { current: mockContainer }
      const { result } = renderHook(() => useExportImage(containerRef))

      await act(async () => {
        await result.current.saveImage(
          createOptions({ format: 'jpg', jpegQuality: 80 }),
          mockShowBackgroundLayer,
          mockHideBackgroundLayer
        )
      })

      expect(mockOutputCanvas.toBlob).toHaveBeenCalledWith(expect.any(Function), 'image/jpeg', 0.8)
    })

    test('PNGの場合はqualityを指定しない', async () => {
      const containerRef = { current: mockContainer }
      const { result } = renderHook(() => useExportImage(containerRef))

      await act(async () => {
        await result.current.saveImage(
          createOptions({ format: 'png' }),
          mockShowBackgroundLayer,
          mockHideBackgroundLayer
        )
      })

      expect(mockOutputCanvas.toBlob).toHaveBeenCalledWith(
        expect.any(Function),
        'image/png',
        undefined
      )
    })

    test('File System Access APIがない場合はダウンロードにフォールバックする', async () => {
      const containerRef = { current: mockContainer }
      const { result } = renderHook(() => useExportImage(containerRef))

      await act(async () => {
        await result.current.saveImage(
          createOptions({ fileName: 'my-artwork', format: 'png' }),
          mockShowBackgroundLayer,
          mockHideBackgroundLayer
        )
      })

      // フォールバック時はダウンロードリンクを使用
      expect(URL.createObjectURL).toHaveBeenCalled()
      expect(mockLink.download).toBe('my-artwork.png')
      expect(mockLink.click).toHaveBeenCalled()
      expect(URL.revokeObjectURL).toHaveBeenCalled()
    })

    test('高品質なリサイズ設定が適用される', async () => {
      const containerRef = { current: mockContainer }
      const { result } = renderHook(() => useExportImage(containerRef))

      await act(async () => {
        await result.current.saveImage(
          createOptions({ scale: '50' }),
          mockShowBackgroundLayer,
          mockHideBackgroundLayer
        )
      })

      expect(mockOutputContext.imageSmoothingEnabled).toBe(true)
      expect(mockOutputContext.imageSmoothingQuality).toBe('high')
    })
  })
})
