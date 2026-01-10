import { describe, test, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSelectionHandlers, createFullCanvasImageDrawable } from './useSelectionHandlers'
import type { UseSelectionReturn } from '@/features/selection'

// ImageDataのモック（jsdom環境では定義されていない場合がある）
const createMockImageData = (width: number, height: number) => ({
  width,
  height,
  data: new Uint8ClampedArray(width * height * 4),
})

// モック
vi.mock('@/features/selection', () => ({
  renderLayerToOffscreenCanvas: vi.fn(),
  clearSelectionRegion: vi.fn(),
  getMaskedImageDataFromSelection: vi.fn(),
  imageDataToDataURL: vi.fn().mockReturnValue('data:image/png;base64,test'),
  canvasToDataURL: vi.fn().mockReturnValue('data:image/png;base64,test'),
  getSelectionBounds: vi.fn().mockReturnValue({ x: 0, y: 0, width: 100, height: 100 }),
  fillSelectionRegion: vi.fn(),
  getOrCreateOffscreenCanvas: vi.fn(),
  drawImageDataToContext: vi.fn(),
}))

vi.mock('@/lib/id', () => ({
  generateId: vi.fn().mockReturnValue('test-id'),
}))

// 書き換え可能なモック型
type MutableSelectionReturn = {
  -readonly [K in keyof UseSelectionReturn]: UseSelectionReturn[K]
}

describe('useSelectionHandlers', () => {
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
    fillSelection: vi.fn(),
    copySelection: vi.fn(),
    cutSelection: vi.fn(),
    pasteSelection: vi.fn(),
    setRegionImageData: vi.fn(),
    clearRegionImageData: vi.fn(),
    isPointInRegion: vi.fn(),
    getSelectionBounds: vi.fn(),
  })

  const defaultOptions = {
    selection: createMockSelection(),
    layers: [],
    activeLayerId: 'layer-1',
    canvasWidth: 800,
    canvasHeight: 600,
    penColor: '#000000',
    brushColor: '#ff0000',
    currentToolType: 'pen' as const,
    setDrawablesToLayer: vi.fn(),
    replaceLayerDrawables: vi.fn(),
    addDrawable: vi.fn(),
    recordCanvasResize: vi.fn(),
    translateAllLayers: vi.fn(),
    setSizeDirectly: vi.fn(),
    setToolType: vi.fn(),
    setSelectionToolType: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createFullCanvasImageDrawable', () => {
    test('正しいImageDrawableを作成する', () => {
      const result = createFullCanvasImageDrawable('data:image/png;base64,test', 800, 600)

      expect(result).toMatchObject({
        type: 'image',
        src: 'data:image/png;base64,test',
        x: 0,
        y: 0,
        width: 800,
        height: 600,
        scaleX: 1,
        scaleY: 1,
      })
    })
  })

  describe('handleSelectRectangle', () => {
    test('矩形選択ツールを選択する', () => {
      const { result } = renderHook(() => useSelectionHandlers(defaultOptions))

      act(() => {
        result.current.handleSelectRectangle()
      })

      expect(defaultOptions.setToolType).toHaveBeenCalledWith('select-rectangle')
      expect(defaultOptions.setSelectionToolType).toHaveBeenCalledWith('select-rectangle')
    })
  })

  describe('handleSelectLasso', () => {
    test('自由選択ツールを選択する', () => {
      const { result } = renderHook(() => useSelectionHandlers(defaultOptions))

      act(() => {
        result.current.handleSelectLasso()
      })

      expect(defaultOptions.setToolType).toHaveBeenCalledWith('select-lasso')
      expect(defaultOptions.setSelectionToolType).toHaveBeenCalledWith('select-lasso')
    })
  })

  describe('handleSelectAll', () => {
    test('全体選択を実行して選択ツールに切り替える', () => {
      const { result } = renderHook(() => useSelectionHandlers(defaultOptions))

      act(() => {
        result.current.handleSelectAll()
      })

      expect(defaultOptions.selection.selectAll).toHaveBeenCalledWith(
        { x: 0, y: 0, width: 800, height: 600 },
        'layer-1'
      )
      expect(defaultOptions.setToolType).toHaveBeenCalledWith('select-rectangle')
    })
  })

  describe('handleDeselect', () => {
    test('選択領域がない場合はdeselectを呼び出す', async () => {
      const { result } = renderHook(() => useSelectionHandlers(defaultOptions))

      await act(async () => {
        await result.current.handleDeselect()
      })

      expect(defaultOptions.selection.deselect).toHaveBeenCalled()
    })
  })

  describe('handleCommitMove', () => {
    test('移動を確定する', () => {
      const { result } = renderHook(() => useSelectionHandlers(defaultOptions))

      act(() => {
        result.current.handleCommitMove()
      })

      expect(defaultOptions.selection.commitMove).toHaveBeenCalled()
    })
  })

  describe('handlePasteSelection', () => {
    test('クリップボードが空の場合は何もしない', () => {
      const { result } = renderHook(() => useSelectionHandlers(defaultOptions))

      act(() => {
        result.current.handlePasteSelection()
      })

      expect(defaultOptions.addDrawable).not.toHaveBeenCalled()
    })

    test('クリップボードがある場合はペーストする', () => {
      const selectionWithClipboard: MutableSelectionReturn = {
        ...createMockSelection(),
        state: {
          phase: 'idle',
          region: null,
          clipboard: {
            imageData: createMockImageData(100, 100) as unknown as ImageData,
            bounds: { x: 0, y: 0, width: 100, height: 100 },
          },
          toolConfig: { type: 'select-rectangle', feather: 0, antiAlias: true },
        },
      }

      const optionsWithClipboard = {
        ...defaultOptions,
        selection: selectionWithClipboard,
      }

      const { result } = renderHook(() => useSelectionHandlers(optionsWithClipboard))

      act(() => {
        result.current.handlePasteSelection()
      })

      expect(optionsWithClipboard.addDrawable).toHaveBeenCalled()
      expect(selectionWithClipboard.pasteSelection).toHaveBeenCalled()
    })
  })
})
