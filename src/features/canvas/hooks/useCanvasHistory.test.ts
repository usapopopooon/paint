import { renderHook, act } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import { useCanvasHistory } from './useCanvasHistory'
import type { Drawable } from '@/features/drawable'

const TEST_LAYER_ID = 'layer-1'

const createMockDrawable = (id: string): Drawable => ({
  id,
  type: 'stroke',
  points: [{ x: 0, y: 0 }],
  style: {
    color: '#000000',
    brushTip: { type: 'solid', size: 2, hardness: 1, opacity: 1 },
    blendMode: 'normal',
  },
  createdAt: Date.now(),
})

describe('useCanvasHistory', () => {
  describe('peekUndo', () => {
    test('undoスタックが空の場合はnullを返す', async () => {
      const { result } = renderHook(() => useCanvasHistory())

      const action = await result.current.peekUndo()

      expect(action).toBeNull()
    })

    test('drawable:addedアクションを正しく返す', async () => {
      const { result } = renderHook(() => useCanvasHistory())
      const drawable = createMockDrawable('test-1')

      act(() => {
        result.current.addDrawable(drawable, TEST_LAYER_ID)
      })

      // 非同期の状態更新を待つ
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0))
      })

      const action = await result.current.peekUndo()

      expect(action).not.toBeNull()
      expect(action?.type).toBe('drawable:added')
      if (action?.type === 'drawable:added') {
        expect(action.drawable.id).toBe('test-1')
      }
    })

    test('drawables:clearedアクションを正しく返す', async () => {
      const { result } = renderHook(() => useCanvasHistory())
      const drawables = [createMockDrawable('test-1'), createMockDrawable('test-2')]

      await act(async () => {
        await result.current.recordClear(drawables, TEST_LAYER_ID)
      })

      const action = await result.current.peekUndo()

      expect(action).not.toBeNull()
      expect(action?.type).toBe('drawables:cleared')
      if (action?.type === 'drawables:cleared') {
        expect(action.previousDrawables).toHaveLength(2)
      }
    })
  })

  describe('peekRedo', () => {
    test('redoスタックが空の場合はnullを返す', async () => {
      const { result } = renderHook(() => useCanvasHistory())

      const action = await result.current.peekRedo()

      expect(action).toBeNull()
    })

    test('undo後にredoスタックからアクションを返す', async () => {
      const { result } = renderHook(() => useCanvasHistory())
      const drawable = createMockDrawable('test-1')

      act(() => {
        result.current.addDrawable(drawable, TEST_LAYER_ID)
      })

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0))
      })

      await act(async () => {
        await result.current.undo()
      })

      const action = await result.current.peekRedo()

      expect(action).not.toBeNull()
      expect(action?.type).toBe('drawable:added')
    })

    test('drawables:clearedのundo後にredoスタックからアクションを返す', async () => {
      const { result } = renderHook(() => useCanvasHistory())
      const drawables = [createMockDrawable('test-1')]

      await act(async () => {
        await result.current.recordClear(drawables, TEST_LAYER_ID)
      })

      await act(async () => {
        await result.current.undo()
      })

      const action = await result.current.peekRedo()

      expect(action).not.toBeNull()
      expect(action?.type).toBe('drawables:cleared')
    })
  })

  describe('undo/redo with clear', () => {
    test('クリア後のundoでcanRedoがtrueになる', async () => {
      const { result } = renderHook(() => useCanvasHistory())
      const drawables = [createMockDrawable('test-1')]

      await act(async () => {
        await result.current.recordClear(drawables, TEST_LAYER_ID)
      })

      expect(result.current.canUndo).toBe(true)
      expect(result.current.canRedo).toBe(false)

      await act(async () => {
        await result.current.undo()
      })

      expect(result.current.canUndo).toBe(false)
      expect(result.current.canRedo).toBe(true)
    })

    test('クリアのundo後にredoで元に戻る', async () => {
      const { result } = renderHook(() => useCanvasHistory())
      const drawables = [createMockDrawable('test-1')]

      await act(async () => {
        await result.current.recordClear(drawables, TEST_LAYER_ID)
      })

      await act(async () => {
        await result.current.undo()
      })

      await act(async () => {
        await result.current.redo()
      })

      expect(result.current.canUndo).toBe(true)
      expect(result.current.canRedo).toBe(false)
    })
  })

  describe('recordLayerVisibilityChange', () => {
    test('レイヤー可視性変更を履歴に記録する', async () => {
      const { result } = renderHook(() => useCanvasHistory())

      await act(async () => {
        await result.current.recordLayerVisibilityChange(TEST_LAYER_ID, true, false)
      })

      expect(result.current.canUndo).toBe(true)

      const action = await result.current.peekUndo()
      expect(action).not.toBeNull()
      expect(action?.type).toBe('layer:visibility-changed')
      if (action?.type === 'layer:visibility-changed') {
        expect(action.layerId).toBe(TEST_LAYER_ID)
        expect(action.previousValue).toBe(true)
        expect(action.newValue).toBe(false)
      }
    })

    test('レイヤー可視性変更のundo/redoで状態が変化する', async () => {
      const { result } = renderHook(() => useCanvasHistory())

      await act(async () => {
        await result.current.recordLayerVisibilityChange(TEST_LAYER_ID, true, false)
      })

      await act(async () => {
        await result.current.undo()
      })

      expect(result.current.canRedo).toBe(true)

      const redoAction = await result.current.peekRedo()
      expect(redoAction?.type).toBe('layer:visibility-changed')
    })
  })

  describe('recordLayerOpacityChange', () => {
    test('レイヤー不透明度変更を履歴に記録する', async () => {
      const { result } = renderHook(() => useCanvasHistory())

      await act(async () => {
        await result.current.recordLayerOpacityChange(TEST_LAYER_ID, 1.0, 0.5)
      })

      expect(result.current.canUndo).toBe(true)

      const action = await result.current.peekUndo()
      expect(action).not.toBeNull()
      expect(action?.type).toBe('layer:opacity-changed')
      if (action?.type === 'layer:opacity-changed') {
        expect(action.layerId).toBe(TEST_LAYER_ID)
        expect(action.previousValue).toBe(1.0)
        expect(action.newValue).toBe(0.5)
      }
    })

    test('レイヤー不透明度変更のundo/redoで状態が変化する', async () => {
      const { result } = renderHook(() => useCanvasHistory())

      await act(async () => {
        await result.current.recordLayerOpacityChange(TEST_LAYER_ID, 0.8, 0.3)
      })

      await act(async () => {
        await result.current.undo()
      })

      expect(result.current.canRedo).toBe(true)

      const redoAction = await result.current.peekRedo()
      expect(redoAction?.type).toBe('layer:opacity-changed')
    })
  })

  describe('recordCanvasResize', () => {
    test('キャンバスリサイズを履歴に記録する', async () => {
      const { result } = renderHook(() => useCanvasHistory())

      await act(async () => {
        await result.current.recordCanvasResize(800, 600, 1000, 800, 100, 100)
      })

      expect(result.current.canUndo).toBe(true)

      const action = await result.current.peekUndo()
      expect(action).not.toBeNull()
      expect(action?.type).toBe('canvas:resized')
      if (action?.type === 'canvas:resized') {
        expect(action.previousWidth).toBe(800)
        expect(action.previousHeight).toBe(600)
        expect(action.newWidth).toBe(1000)
        expect(action.newHeight).toBe(800)
        expect(action.offsetX).toBe(100)
        expect(action.offsetY).toBe(100)
      }
    })

    test('キャンバスリサイズのundo/redoで状態が変化する', async () => {
      const { result } = renderHook(() => useCanvasHistory())

      await act(async () => {
        await result.current.recordCanvasResize(800, 600, 1024, 768, 112, 84)
      })

      await act(async () => {
        await result.current.undo()
      })

      expect(result.current.canRedo).toBe(true)

      const redoAction = await result.current.peekRedo()
      expect(redoAction?.type).toBe('canvas:resized')
    })
  })
})
