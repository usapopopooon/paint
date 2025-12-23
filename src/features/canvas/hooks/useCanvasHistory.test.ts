import { renderHook, act } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import { useCanvasHistory } from './useCanvasHistory'
import type { Drawable } from '@/features/drawable'

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
        result.current.addDrawable(drawable)
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
        await result.current.recordClear(drawables)
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
        result.current.addDrawable(drawable)
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
        await result.current.recordClear(drawables)
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
        await result.current.recordClear(drawables)
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
        await result.current.recordClear(drawables)
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
})
