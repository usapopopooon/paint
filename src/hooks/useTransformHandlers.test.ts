import { describe, test, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTransformHandlers } from './useTransformHandlers'
import type { UseSelectionReturn, UseTransformReturn } from '@/features/selection'

// ImageDataのモック（jsdom環境では定義されていない場合がある）
const createMockImageData = (width: number, height: number) => ({
  width,
  height,
  data: new Uint8ClampedArray(width * height * 4),
})

// モック
vi.mock('@/features/selection', () => ({
  renderLayerToOffscreenCanvas: vi.fn().mockResolvedValue({
    getContext: () => ({
      getImageData: vi.fn().mockReturnValue({
        width: 100,
        height: 100,
        data: new Uint8ClampedArray(100 * 100 * 4),
      }),
    }),
  }),
  clearSelectionRegion: vi.fn(),
  getMaskedImageDataFromSelection: vi.fn().mockReturnValue({
    width: 100,
    height: 100,
    data: new Uint8ClampedArray(100 * 100 * 4),
  }),
  canvasToDataURL: vi.fn().mockReturnValue('data:image/png;base64,test'),
  getSelectionBounds: vi.fn().mockReturnValue({ x: 0, y: 0, width: 100, height: 100 }),
  drawImageDataToContext: vi.fn(),
}))

vi.mock('./useSelectionHandlers', () => ({
  createFullCanvasImageDrawable: vi.fn().mockReturnValue({
    id: 'test-id',
    type: 'image',
    src: 'data:image/png;base64,test',
    x: 0,
    y: 0,
    width: 800,
    height: 600,
    scaleX: 1,
    scaleY: 1,
    createdAt: Date.now(),
  }),
}))

// 書き換え可能なモック型
type MutableSelectionReturn = {
  -readonly [K in keyof UseSelectionReturn]: UseSelectionReturn[K]
}

type MutableTransformReturn = {
  -readonly [K in keyof UseTransformReturn]: UseTransformReturn[K]
}

describe('useTransformHandlers', () => {
  const createMockSelection = (): MutableSelectionReturn => ({
    state: {
      phase: 'idle',
      region: null,
      clipboard: null,
      toolConfig: { type: 'select-rectangle', feather: 0, antiAlias: true },
    },
    selectionPoints: [],
    setToolType: vi.fn(),
    startSelection: vi.fn(),
    updateSelection: vi.fn(),
    commitSelection: vi.fn(),
    selectAll: vi.fn(),
    deselect: vi.fn(),
    startMove: vi.fn(),
    updateMove: vi.fn(),
    commitMove: vi.fn(),
    deleteSelection: vi.fn(),
    copySelection: vi.fn(),
    cutSelection: vi.fn(),
    pasteSelection: vi.fn(),
    fillSelection: vi.fn(),
    setRegionImageData: vi.fn(),
    clearRegionImageData: vi.fn(),
    isPointInRegion: vi.fn(),
    getSelectionBounds: vi.fn(),
  })

  const createMockTransform = (): MutableTransformReturn => ({
    isTransforming: false,
    transformState: null,
    previewImageData: null,
    startTransform: vi.fn(),
    setTransformMode: vi.fn(),
    updateTransform: vi.fn(),
    commitTransform: vi.fn().mockResolvedValue({
      imageData: createMockImageData(100, 100),
      bounds: { x: 0, y: 0, width: 100, height: 100 },
    }),
    cancelTransform: vi.fn(),
    cycleTransformMode: vi.fn(),
    startHandleOperation: vi.fn(),
    endHandleOperation: vi.fn(),
    detectHandleAtPoint: vi.fn(),
    getHandlePositions: vi.fn(),
    isHandleOperating: false,
  })

  const defaultOptions = {
    selection: createMockSelection(),
    transform: createMockTransform(),
    layers: [],
    canvasWidth: 800,
    canvasHeight: 600,
    replaceLayerDrawables: vi.fn(),
    setDrawablesToLayer: vi.fn(),
    undo: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('handleFreeTransform', () => {
    test('選択領域がない場合は何もしない', async () => {
      const { result } = renderHook(() => useTransformHandlers(defaultOptions))

      await act(async () => {
        result.current.handleFreeTransform()
      })

      expect(defaultOptions.transform.startTransform).not.toHaveBeenCalled()
    })
  })

  describe('handleScaleTransform', () => {
    test('選択領域がない場合は何もしない', async () => {
      const { result } = renderHook(() => useTransformHandlers(defaultOptions))

      await act(async () => {
        result.current.handleScaleTransform()
      })

      expect(defaultOptions.transform.startTransform).not.toHaveBeenCalled()
    })
  })

  describe('handleRotateTransform', () => {
    test('選択領域がない場合は何もしない', async () => {
      const { result } = renderHook(() => useTransformHandlers(defaultOptions))

      await act(async () => {
        result.current.handleRotateTransform()
      })

      expect(defaultOptions.transform.startTransform).not.toHaveBeenCalled()
    })
  })

  describe('handleTransformShortcut', () => {
    test('変形中の場合はモードをサイクルする', () => {
      const transforming = createMockTransform()
      transforming.isTransforming = true

      const options = {
        ...defaultOptions,
        transform: transforming,
      }

      const { result } = renderHook(() => useTransformHandlers(options))

      act(() => {
        result.current.handleTransformShortcut()
      })

      expect(transforming.cycleTransformMode).toHaveBeenCalled()
    })

    test('選択領域がある場合は自由変形を開始する', async () => {
      const selectionWithRegion: MutableSelectionReturn = {
        ...createMockSelection(),
        state: {
          phase: 'idle',
          region: {
            id: 'selection-1',
            shape: {
              type: 'rectangle',
              bounds: { x: 0, y: 0, width: 100, height: 100 },
            },
            layerId: 'layer-1',
            offset: { x: 0, y: 0 },
            imageData: null,
          },
          clipboard: null,
          toolConfig: { type: 'select-rectangle', feather: 0, antiAlias: true },
        },
      }

      const options = {
        ...defaultOptions,
        selection: selectionWithRegion,
        layers: [
          {
            id: 'layer-1',
            drawables: [],
            isVisible: true,
            opacity: 1,
            blendMode: 'normal' as const,
            name: 'Layer 1',
            type: 'drawing' as const,
            isLocked: false,
          },
        ],
      }

      const { result } = renderHook(() => useTransformHandlers(options))

      await act(async () => {
        result.current.handleTransformShortcut()
      })

      // handleStartTransformが内部で呼ばれる
      expect(options.transform.startTransform).toHaveBeenCalledWith(
        'free-transform',
        expect.any(Object), // ImageDataのモック
        expect.any(Object)
      )
    })
  })

  describe('handleCancelTransform', () => {
    test('変形中の場合はキャンセルしてundoを呼び出す', () => {
      const transforming = createMockTransform()
      transforming.isTransforming = true

      const options = {
        ...defaultOptions,
        transform: transforming,
      }

      const { result } = renderHook(() => useTransformHandlers(options))

      act(() => {
        result.current.handleCancelTransform()
      })

      expect(transforming.cancelTransform).toHaveBeenCalled()
      expect(options.undo).toHaveBeenCalled()
    })

    test('変形中でない場合は何もしない', () => {
      const { result } = renderHook(() => useTransformHandlers(defaultOptions))

      act(() => {
        result.current.handleCancelTransform()
      })

      expect(defaultOptions.transform.cancelTransform).not.toHaveBeenCalled()
      expect(defaultOptions.undo).not.toHaveBeenCalled()
    })
  })

  describe('handleConfirmTransform', () => {
    test('変形中でない場合は何もしない', async () => {
      const { result } = renderHook(() => useTransformHandlers(defaultOptions))

      await act(async () => {
        await result.current.handleConfirmTransform()
      })

      expect(defaultOptions.transform.commitTransform).not.toHaveBeenCalled()
    })
  })
})
