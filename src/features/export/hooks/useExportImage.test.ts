import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useExportImage } from './useExportImage'

describe('useExportImage', () => {
  let mockCanvas: HTMLCanvasElement
  let mockContainer: HTMLDivElement
  let mockFullSizeCanvas: HTMLCanvasElement
  let mockFullSizeContext: CanvasRenderingContext2D
  let mockLink: HTMLAnchorElement
  let originalCreateElement: typeof document.createElement
  let mockShowBackgroundLayer: () => void
  let mockHideBackgroundLayer: () => void

  beforeEach(() => {
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

    // フルサイズのオフスクリーンキャンバス
    mockFullSizeCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn().mockReturnValue(mockFullSizeContext),
      toDataURL: vi.fn().mockReturnValue('data:image/jpeg;base64,test'),
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

    // document.createElementをモック
    originalCreateElement = document.createElement
    document.createElement = vi.fn((tagName: string) => {
      if (tagName === 'canvas') {
        return mockFullSizeCanvas
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

    expect(mockFullSizeCanvas.toDataURL).toHaveBeenCalledWith('image/jpeg', 1.0)
    expect(mockLink.href).toBe('data:image/jpeg;base64,test')
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
})
