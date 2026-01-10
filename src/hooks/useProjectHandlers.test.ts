import { describe, test, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useProjectHandlers } from './useProjectHandlers'

// モック
vi.mock('@/features/i18n', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      if (key === 'layers.defaultName' && params?.number) {
        return `Layer ${params.number}`
      }
      return key
    },
  }),
}))

vi.mock('@/features/project', () => ({
  saveProject: vi.fn().mockResolvedValue(true),
  loadProject: vi.fn(),
  useAutoSave: vi.fn(),
  useRecovery: vi.fn().mockReturnValue({
    isLoading: false,
    hasRecoverableData: false,
    savedAt: null,
    restore: vi.fn(),
    discard: vi.fn(),
  }),
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('useProjectHandlers', () => {
  const defaultOptions = {
    canvasWidth: 800,
    canvasHeight: 600,
    layers: [],
    activeLayerId: 'layer-1',
    canUndo: false,
    setLayers: vi.fn(),
    clearHistory: vi.fn(),
    setSizeDirectly: vi.fn(),
    setToolType: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('初期状態ではisCanvasCreatedがfalse', () => {
    const { result } = renderHook(() => useProjectHandlers(defaultOptions))

    expect(result.current.isCanvasCreated).toBe(false)
    expect(result.current.projectName).toBeNull()
  })

  test('handleOpenNewCanvasDialogでダイアログが開く', () => {
    const { result } = renderHook(() => useProjectHandlers(defaultOptions))

    expect(result.current.newCanvasDialogOpen).toBe(false)

    act(() => {
      result.current.handleOpenNewCanvasDialog()
    })

    expect(result.current.newCanvasDialogOpen).toBe(true)
  })

  test('handleCreateNewCanvasでキャンバスが作成される', () => {
    const { result } = renderHook(() => useProjectHandlers(defaultOptions))

    act(() => {
      result.current.handleCreateNewCanvas(1024, 768, 'My Project')
    })

    expect(defaultOptions.setSizeDirectly).toHaveBeenCalledWith(1024, 768)
    expect(defaultOptions.setLayers).toHaveBeenCalled()
    expect(defaultOptions.clearHistory).toHaveBeenCalled()
    expect(defaultOptions.setToolType).toHaveBeenCalledWith('pen')
    expect(result.current.isCanvasCreated).toBe(true)
    expect(result.current.projectName).toBe('My Project')
  })

  test('handleSaveProjectでダイアログが開く', () => {
    const { result } = renderHook(() => useProjectHandlers(defaultOptions))

    expect(result.current.saveDialogOpen).toBe(false)

    act(() => {
      result.current.handleSaveProject()
    })

    expect(result.current.saveDialogOpen).toBe(true)
  })

  test('handleOpenProjectFilePickerで未保存の変更がある場合は確認ダイアログを表示', () => {
    const optionsWithUndo = { ...defaultOptions, canUndo: true }
    const { result } = renderHook(() => useProjectHandlers(optionsWithUndo))

    act(() => {
      result.current.handleOpenProjectFilePicker()
    })

    expect(result.current.confirmLoadDialogOpen).toBe(true)
  })

  test('setProjectNameでプロジェクト名を更新できる', () => {
    const { result } = renderHook(() => useProjectHandlers(defaultOptions))

    act(() => {
      result.current.setProjectName('New Name')
    })

    expect(result.current.projectName).toBe('New Name')
  })

  test('setSaveDialogOpenでダイアログの状態を更新できる', () => {
    const { result } = renderHook(() => useProjectHandlers(defaultOptions))

    act(() => {
      result.current.setSaveDialogOpen(true)
    })

    expect(result.current.saveDialogOpen).toBe(true)

    act(() => {
      result.current.setSaveDialogOpen(false)
    })

    expect(result.current.saveDialogOpen).toBe(false)
  })

  test('setLoadErrorでエラー状態を更新できる', () => {
    const { result } = renderHook(() => useProjectHandlers(defaultOptions))

    const error = { type: 'invalid-format' as const }
    act(() => {
      result.current.setLoadError(error)
    })

    expect(result.current.loadError).toEqual(error)

    act(() => {
      result.current.setLoadError(null)
    })

    expect(result.current.loadError).toBeNull()
  })

  test('handleConfirmLoadで確認ダイアログを閉じる', () => {
    const optionsWithUndo = { ...defaultOptions, canUndo: true }
    const { result } = renderHook(() => useProjectHandlers(optionsWithUndo))

    // まず確認ダイアログを開く
    act(() => {
      result.current.handleOpenProjectFilePicker()
    })
    expect(result.current.confirmLoadDialogOpen).toBe(true)

    // 確認するとダイアログが閉じる
    act(() => {
      result.current.handleConfirmLoad()
    })
    expect(result.current.confirmLoadDialogOpen).toBe(false)
  })
})
