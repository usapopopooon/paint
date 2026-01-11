import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAutoSave } from './useAutoSave'
import * as indexedDB from '@/lib/indexedDB'
import type { Layer } from '@/features/layer'

// IndexedDBのモック
vi.mock('@/lib/indexedDB', () => ({
  saveToIndexedDB: vi.fn().mockResolvedValue(undefined),
  isIndexedDBAvailable: vi.fn().mockReturnValue(true),
}))

describe('useAutoSave', () => {
  const defaultToolState = {
    currentType: 'pen' as const,
    lastDrawingToolType: 'pen' as const,
    penConfig: {
      type: 'pen' as const,
      width: 2,
      color: '#000000',
      opacity: 1,
      hardness: 0.5,
      isBlurEnabled: true,
    },
    brushConfig: {
      type: 'brush' as const,
      width: 20,
      color: '#000000',
      opacity: 1,
      hardness: 0.5,
      isBlurEnabled: true,
    },
    blurConfig: {
      type: 'blur' as const,
      width: 20,
      opacity: 1,
      hardness: 0.5,
    },
    eraserConfig: {
      type: 'eraser' as const,
      width: 50,
      opacity: 1,
      hardness: 0.5,
      isBlurEnabled: true,
    },
  }

  const defaultOptions = {
    projectName: 'Test Project',
    canvasWidth: 800,
    canvasHeight: 600,
    layers: [] as Layer[],
    activeLayerId: 'layer-1',
    toolState: defaultToolState,
    stabilization: 0.5,
    enabled: true,
  }

  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    vi.mocked(indexedDB.isIndexedDBAvailable).mockReturnValue(true)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('デフォルトで有効な場合、遅延後に自動保存が実行される', async () => {
    renderHook(() => useAutoSave(defaultOptions))

    // 3秒後に保存が実行される
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000)
    })

    expect(indexedDB.saveToIndexedDB).toHaveBeenCalledTimes(1)
  })

  test('enabled: falseの場合、自動保存は実行されない', async () => {
    renderHook(() =>
      useAutoSave({
        ...defaultOptions,
        enabled: false,
      })
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000)
    })

    expect(indexedDB.saveToIndexedDB).not.toHaveBeenCalled()
  })

  test('IndexedDBが利用不可の場合、自動保存は実行されない', async () => {
    vi.mocked(indexedDB.isIndexedDBAvailable).mockReturnValue(false)

    renderHook(() => useAutoSave(defaultOptions))

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000)
    })

    expect(indexedDB.saveToIndexedDB).not.toHaveBeenCalled()
  })

  test('saveNowを呼び出すと即座に保存が実行される', async () => {
    const { result } = renderHook(() => useAutoSave(defaultOptions))

    await act(async () => {
      await result.current.saveNow()
    })

    expect(indexedDB.saveToIndexedDB).toHaveBeenCalledTimes(1)
  })

  test('layersが変更されると遅延保存がトリガーされる', async () => {
    const { rerender } = renderHook((props) => useAutoSave(props), { initialProps: defaultOptions })

    // 最初の遅延保存
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000)
    })
    expect(indexedDB.saveToIndexedDB).toHaveBeenCalledTimes(1)

    // layersを変更
    rerender({
      ...defaultOptions,
      layers: [
        {
          id: 'layer-1',
          name: 'Layer 1',
          drawables: [],
          isVisible: true,
          opacity: 1,
          blendMode: 'normal' as const,
          type: 'drawing' as const,
          isLocked: false,
        },
      ],
    })

    // 再度遅延後に保存
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000)
    })
    expect(indexedDB.saveToIndexedDB).toHaveBeenCalledTimes(2)
  })

  test('連続した変更は最後の変更から3秒後に1回だけ保存される', async () => {
    const { rerender } = renderHook((props) => useAutoSave(props), { initialProps: defaultOptions })

    // 1秒後にlayersを変更
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000)
    })
    rerender({
      ...defaultOptions,
      layers: [
        {
          id: 'layer-1',
          name: 'Layer 1',
          drawables: [],
          isVisible: true,
          opacity: 1,
          blendMode: 'normal' as const,
          type: 'drawing' as const,
          isLocked: false,
        },
      ],
    })

    // さらに1秒後に変更
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000)
    })
    rerender({
      ...defaultOptions,
      layers: [
        {
          id: 'layer-2',
          name: 'Layer 2',
          drawables: [],
          isVisible: true,
          opacity: 1,
          blendMode: 'normal' as const,
          type: 'drawing' as const,
          isLocked: false,
        },
      ],
    })

    // 2秒経過時点ではまだ保存されていない
    expect(indexedDB.saveToIndexedDB).not.toHaveBeenCalled()

    // 最後の変更から3秒後に保存
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000)
    })
    expect(indexedDB.saveToIndexedDB).toHaveBeenCalledTimes(1)
  })

  test('定期保存は30秒ごとに実行される', async () => {
    renderHook(() => useAutoSave(defaultOptions))

    // 最初の遅延保存（3秒後）
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000)
    })
    expect(indexedDB.saveToIndexedDB).toHaveBeenCalledTimes(1)

    // 27秒後（合計30秒）に定期保存チェック - 最後の保存から27秒なのでまだ保存されない
    await act(async () => {
      await vi.advanceTimersByTimeAsync(27000)
    })
    expect(indexedDB.saveToIndexedDB).toHaveBeenCalledTimes(1)

    // さらに30秒後（合計60秒）に定期保存 - 最後の保存から30秒経過
    await act(async () => {
      await vi.advanceTimersByTimeAsync(30000)
    })
    expect(indexedDB.saveToIndexedDB).toHaveBeenCalledTimes(2)
  })
})
