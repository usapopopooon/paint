import { describe, test, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useToolHandlers } from './useToolHandlers'
import type { UseToolReturn } from '@/features/tools'
import type { ToolType } from '@/features/tools'

// 書き換え可能なモック型
type MutableToolReturn = {
  -readonly [K in keyof UseToolReturn]: UseToolReturn[K]
}

describe('useToolHandlers', () => {
  const defaultToolState = {
    currentType: 'pen' as const,
    lastDrawingToolType: 'pen' as const,
    penConfig: {
      type: 'pen' as const,
      width: 5,
      color: '#000000',
      opacity: 1,
      hardness: 1,
      isBlurEnabled: false,
    },
    brushConfig: {
      type: 'brush' as const,
      width: 20,
      color: '#ff0000',
      opacity: 1,
      hardness: 0.5,
      isBlurEnabled: true,
    },
    blurConfig: {
      type: 'blur' as const,
      width: 30,
      opacity: 0.5,
      hardness: 0.8,
    },
    eraserConfig: {
      type: 'eraser' as const,
      width: 10,
      opacity: 1,
      hardness: 1,
      isBlurEnabled: false,
    },
  }

  const createMockTool = (overrides: Partial<MutableToolReturn> = {}): MutableToolReturn => ({
    currentType: 'pen' as ToolType,
    currentConfig: {
      type: 'pen',
      width: 5,
      color: '#000000',
      opacity: 1,
      hardness: 1,
      isBlurEnabled: false,
    },
    penConfig: {
      type: 'pen',
      width: 5,
      color: '#000000',
      opacity: 1,
      hardness: 1,
      isBlurEnabled: false,
    },
    brushConfig: {
      type: 'brush',
      width: 20,
      color: '#ff0000',
      opacity: 1,
      hardness: 0.5,
      isBlurEnabled: true,
    },
    blurConfig: { type: 'blur', width: 30, opacity: 0.5, hardness: 0.8 },
    eraserConfig: { type: 'eraser', width: 10, opacity: 1, hardness: 1, isBlurEnabled: false },
    cursor: { size: 5, color: '#000000' },
    lastDrawingToolHardness: 1,
    lastDrawingToolBlurEnabled: false,
    toolState: defaultToolState,
    setToolType: vi.fn(),
    setPenWidth: vi.fn(),
    setPenColor: vi.fn(),
    setPenOpacity: vi.fn(),
    setPenHardness: vi.fn(),
    setPenBlurEnabled: vi.fn(),
    setBrushWidth: vi.fn(),
    setBrushColor: vi.fn(),
    setBrushOpacity: vi.fn(),
    setBrushHardness: vi.fn(),
    setBrushBlurEnabled: vi.fn(),
    setBlurWidth: vi.fn(),
    setBlurOpacity: vi.fn(),
    setBlurHardness: vi.fn(),
    setEraserWidth: vi.fn(),
    setEraserOpacity: vi.fn(),
    setEraserHardness: vi.fn(),
    setEraserBlurEnabled: vi.fn(),
    setFullState: vi.fn(),
    getCursor: vi.fn(),
    ...overrides,
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('handleSelectPen', () => {
    test('ペンツールを選択する', () => {
      const tool = createMockTool()
      const { result } = renderHook(() => useToolHandlers({ tool }))

      act(() => {
        result.current.handleSelectPen()
      })

      expect(tool.setToolType).toHaveBeenCalledWith('pen')
    })
  })

  describe('handleSelectBrush', () => {
    test('ブラシツールを選択する', () => {
      const tool = createMockTool()
      const { result } = renderHook(() => useToolHandlers({ tool }))

      act(() => {
        result.current.handleSelectBrush()
      })

      expect(tool.setToolType).toHaveBeenCalledWith('brush')
    })
  })

  describe('handleSelectBlur', () => {
    test('ぼかしツールを選択する', () => {
      const tool = createMockTool()
      const { result } = renderHook(() => useToolHandlers({ tool }))

      act(() => {
        result.current.handleSelectBlur()
      })

      expect(tool.setToolType).toHaveBeenCalledWith('blur')
    })
  })

  describe('handleSelectEraser', () => {
    test('消しゴムツールを選択する', () => {
      const tool = createMockTool()
      const { result } = renderHook(() => useToolHandlers({ tool }))

      act(() => {
        result.current.handleSelectEraser()
      })

      expect(tool.setToolType).toHaveBeenCalledWith('eraser')
    })
  })

  describe('handleColorChange', () => {
    test('ペンとブラシの両方の色を変更する', () => {
      const tool = createMockTool()
      const { result } = renderHook(() => useToolHandlers({ tool }))

      act(() => {
        result.current.handleColorChange('#00ff00')
      })

      expect(tool.setPenColor).toHaveBeenCalledWith('#00ff00')
      expect(tool.setBrushColor).toHaveBeenCalledWith('#00ff00')
    })
  })

  describe('handleHardnessChange', () => {
    test('ペン選択時はペンのhardnessを変更する', () => {
      const tool = createMockTool()
      tool.currentType = 'pen'
      const { result } = renderHook(() => useToolHandlers({ tool }))

      act(() => {
        result.current.handleHardnessChange(0.5)
      })

      expect(tool.setPenHardness).toHaveBeenCalledWith(0.5)
    })

    test('ブラシ選択時はブラシのhardnessを変更する', () => {
      const tool = createMockTool()
      tool.currentType = 'brush'
      const { result } = renderHook(() => useToolHandlers({ tool }))

      act(() => {
        result.current.handleHardnessChange(0.3)
      })

      expect(tool.setBrushHardness).toHaveBeenCalledWith(0.3)
    })

    test('消しゴム選択時は消しゴムのhardnessを変更する', () => {
      const tool = createMockTool()
      tool.currentType = 'eraser'
      const { result } = renderHook(() => useToolHandlers({ tool }))

      act(() => {
        result.current.handleHardnessChange(0.8)
      })

      expect(tool.setEraserHardness).toHaveBeenCalledWith(0.8)
    })

    test('ぼかしツール選択時はぼかしのhardnessを変更する', () => {
      const tool = createMockTool()
      tool.currentType = 'blur'
      const { result } = renderHook(() => useToolHandlers({ tool }))

      act(() => {
        result.current.handleHardnessChange(0.6)
      })

      expect(tool.setBlurHardness).toHaveBeenCalledWith(0.6)
    })
  })

  describe('handleBlurEnabledChange', () => {
    test('ペン選択時はペンのblurEnabledを変更する', () => {
      const tool = createMockTool()
      tool.currentType = 'pen'
      const { result } = renderHook(() => useToolHandlers({ tool }))

      act(() => {
        result.current.handleBlurEnabledChange(true)
      })

      expect(tool.setPenBlurEnabled).toHaveBeenCalledWith(true)
    })
  })

  describe('currentColor', () => {
    test('ペン選択時はペンの色を返す', () => {
      const tool = createMockTool()
      tool.currentType = 'pen'
      const { result } = renderHook(() => useToolHandlers({ tool }))

      expect(result.current.currentColor).toBe('#000000')
    })

    test('ブラシ選択時はブラシの色を返す', () => {
      const tool = createMockTool()
      tool.currentType = 'brush'
      const { result } = renderHook(() => useToolHandlers({ tool }))

      expect(result.current.currentColor).toBe('#ff0000')
    })
  })

  describe('currentHardness', () => {
    test('ペン選択時はペンのhardnessを返す', () => {
      const tool = createMockTool()
      tool.currentType = 'pen'
      const { result } = renderHook(() => useToolHandlers({ tool }))

      expect(result.current.currentHardness).toBe(1)
    })

    test('ブラシ選択時はブラシのhardnessを返す', () => {
      const tool = createMockTool()
      tool.currentType = 'brush'
      const { result } = renderHook(() => useToolHandlers({ tool }))

      expect(result.current.currentHardness).toBe(0.5)
    })

    test('ぼかしツール選択時はぼかしのhardnessを返す', () => {
      const tool = createMockTool()
      tool.currentType = 'blur'
      const { result } = renderHook(() => useToolHandlers({ tool }))

      expect(result.current.currentHardness).toBe(0.8)
    })

    test('描画ツール以外の場合はlastDrawingToolHardnessを返す', () => {
      const tool = createMockTool()
      tool.currentType = 'hand'
      tool.lastDrawingToolHardness = 0.7
      const { result } = renderHook(() => useToolHandlers({ tool }))

      expect(result.current.currentHardness).toBe(0.7)
    })
  })

  describe('isHardnessDisabled', () => {
    test('ペン選択時はfalse', () => {
      const tool = createMockTool()
      tool.currentType = 'pen'
      const { result } = renderHook(() => useToolHandlers({ tool }))

      expect(result.current.isHardnessDisabled).toBe(false)
    })

    test('ブラシ選択時はfalse', () => {
      const tool = createMockTool()
      tool.currentType = 'brush'
      const { result } = renderHook(() => useToolHandlers({ tool }))

      expect(result.current.isHardnessDisabled).toBe(false)
    })

    test('ぼかしツール選択時はfalse', () => {
      const tool = createMockTool()
      tool.currentType = 'blur'
      const { result } = renderHook(() => useToolHandlers({ tool }))

      expect(result.current.isHardnessDisabled).toBe(false)
    })

    test('消しゴム選択時はfalse', () => {
      const tool = createMockTool()
      tool.currentType = 'eraser'
      const { result } = renderHook(() => useToolHandlers({ tool }))

      expect(result.current.isHardnessDisabled).toBe(false)
    })

    test('ハンドツール選択時はtrue', () => {
      const tool = createMockTool()
      tool.currentType = 'hand'
      const { result } = renderHook(() => useToolHandlers({ tool }))

      expect(result.current.isHardnessDisabled).toBe(true)
    })

    test('スポイトツール選択時はtrue', () => {
      const tool = createMockTool()
      tool.currentType = 'eyedropper'
      const { result } = renderHook(() => useToolHandlers({ tool }))

      expect(result.current.isHardnessDisabled).toBe(true)
    })
  })

  describe('handleIncreaseToolSize / handleDecreaseToolSize', () => {
    test('ペンのサイズを増加させる', () => {
      const tool = createMockTool()
      tool.currentType = 'pen'
      const { result } = renderHook(() => useToolHandlers({ tool }))

      act(() => {
        result.current.handleIncreaseToolSize()
      })

      expect(tool.setPenWidth).toHaveBeenCalled()
    })

    test('ペンのサイズを減少させる', () => {
      const tool = createMockTool()
      tool.currentType = 'pen'
      const { result } = renderHook(() => useToolHandlers({ tool }))

      act(() => {
        result.current.handleDecreaseToolSize()
      })

      expect(tool.setPenWidth).toHaveBeenCalled()
    })

    test('ブラシのサイズを増加させる', () => {
      const tool = createMockTool()
      tool.currentType = 'brush'
      const { result } = renderHook(() => useToolHandlers({ tool }))

      act(() => {
        result.current.handleIncreaseToolSize()
      })

      expect(tool.setBrushWidth).toHaveBeenCalled()
    })

    test('消しゴムのサイズを減少させる', () => {
      const tool = createMockTool()
      tool.currentType = 'eraser'
      const { result } = renderHook(() => useToolHandlers({ tool }))

      act(() => {
        result.current.handleDecreaseToolSize()
      })

      expect(tool.setEraserWidth).toHaveBeenCalled()
    })

    test('ぼかしツールのサイズを増加させる', () => {
      const tool = createMockTool()
      tool.currentType = 'blur'
      const { result } = renderHook(() => useToolHandlers({ tool }))

      act(() => {
        result.current.handleIncreaseToolSize()
      })

      expect(tool.setBlurWidth).toHaveBeenCalled()
    })
  })
})
