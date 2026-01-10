import { describe, test, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useRecovery } from './useRecovery'
import * as indexedDB from '@/lib/indexedDB'

// IndexedDBのモック
vi.mock('@/lib/indexedDB', () => ({
  loadFromIndexedDB: vi.fn(),
  clearFromIndexedDB: vi.fn().mockResolvedValue(undefined),
  isIndexedDBAvailable: vi.fn().mockReturnValue(true),
}))

// プロジェクトデータのサンプル
const createValidProjectData = () => ({
  version: 1,
  name: 'Test Project',
  canvasWidth: 800,
  canvasHeight: 600,
  layers: [
    {
      id: 'layer-1',
      name: 'Layer 1',
      type: 'drawing' as const,
      isVisible: true,
      isLocked: false,
      opacity: 1,
      blendMode: 'normal' as const,
      drawables: [],
    },
  ],
  activeLayerId: 'layer-1',
  createdAt: 1000000000000,
  updatedAt: 1000000000000,
})

describe('useRecovery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // デフォルトでIndexedDBが利用可能に設定
    vi.mocked(indexedDB.isIndexedDBAvailable).mockReturnValue(true)
  })

  test('初期状態ではisLoading: trueである', () => {
    vi.mocked(indexedDB.loadFromIndexedDB).mockResolvedValue(null)

    const { result } = renderHook(() => useRecovery())

    expect(result.current.isLoading).toBe(true)
    expect(result.current.hasRecoverableData).toBe(false)
  })

  test('復元可能なデータがない場合、hasRecoverableData: falseになる', async () => {
    vi.mocked(indexedDB.loadFromIndexedDB).mockResolvedValue(null)

    const { result } = renderHook(() => useRecovery())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.hasRecoverableData).toBe(false)
    expect(result.current.savedAt).toBeNull()
  })

  test('復元可能なデータがある場合、hasRecoverableData: trueになる', async () => {
    const savedAt = 1000000000000
    const projectData = createValidProjectData()
    vi.mocked(indexedDB.loadFromIndexedDB).mockResolvedValue({
      id: 'current',
      projectData: JSON.stringify(projectData),
      savedAt,
    })

    const { result } = renderHook(() => useRecovery())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.hasRecoverableData).toBe(true)
    expect(result.current.savedAt).toBe(savedAt)
  })

  test('無効なデータの場合、hasRecoverableData: falseになる', async () => {
    vi.mocked(indexedDB.loadFromIndexedDB).mockResolvedValue({
      id: 'current',
      projectData: 'invalid json',
      savedAt: Date.now(),
    })

    const { result } = renderHook(() => useRecovery())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.hasRecoverableData).toBe(false)
  })

  test('IndexedDBが利用不可の場合、hasRecoverableData: falseになる', async () => {
    vi.mocked(indexedDB.isIndexedDBAvailable).mockReturnValue(false)

    const { result } = renderHook(() => useRecovery())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.hasRecoverableData).toBe(false)
  })

  test('restoreを呼び出すとプロジェクトデータが返される', async () => {
    const savedAt = 1000000000000
    const projectData = createValidProjectData()
    vi.mocked(indexedDB.loadFromIndexedDB).mockResolvedValue({
      id: 'current',
      projectData: JSON.stringify(projectData),
      savedAt,
    })

    const { result } = renderHook(() => useRecovery())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    let restored: unknown = null
    await act(async () => {
      restored = await result.current.restore()
    })

    expect(restored).toEqual(projectData)
  })

  test('discardを呼び出すとhasRecoverableDataがfalseになる', async () => {
    const savedAt = 1000000000000
    const projectData = createValidProjectData()
    vi.mocked(indexedDB.loadFromIndexedDB).mockResolvedValue({
      id: 'current',
      projectData: JSON.stringify(projectData),
      savedAt,
    })

    const { result } = renderHook(() => useRecovery())

    await waitFor(() => {
      expect(result.current.hasRecoverableData).toBe(true)
    })

    await act(async () => {
      await result.current.discard()
    })

    expect(result.current.hasRecoverableData).toBe(false)
  })

  test('completeCheckを呼び出すとhasRecoverableData: falseになる', async () => {
    const savedAt = 1000000000000
    const projectData = createValidProjectData()
    vi.mocked(indexedDB.loadFromIndexedDB).mockResolvedValue({
      id: 'current',
      projectData: JSON.stringify(projectData),
      savedAt,
    })

    const { result } = renderHook(() => useRecovery())

    await waitFor(() => {
      expect(result.current.hasRecoverableData).toBe(true)
    })

    act(() => {
      result.current.completeCheck()
    })

    expect(result.current.hasRecoverableData).toBe(false)
  })
})
