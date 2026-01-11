import { describe, test, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
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
    canvasWidth: 800,
    canvasHeight: 600,
    layers: [],
    activeLayerId: 'layer-1',
    canUndo: false,
    toolState: defaultToolState,
    stabilization: 0.5,
    setLayers: vi.fn(),
    clearHistory: vi.fn(),
    setSizeDirectly: vi.fn(),
    setToolType: vi.fn(),
    setFullToolState: vi.fn(),
    setStabilization: vi.fn(),
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

  test('handleOpenNewCanvasDialogで未保存の変更がある場合は確認ダイアログを表示', () => {
    const { result } = renderHook(() =>
      useProjectHandlers({
        ...defaultOptions,
        canUndo: true,
      })
    )

    expect(result.current.confirmNewCanvasDialogOpen).toBe(false)
    expect(result.current.newCanvasDialogOpen).toBe(false)

    act(() => {
      result.current.handleOpenNewCanvasDialog()
    })

    expect(result.current.confirmNewCanvasDialogOpen).toBe(true)
    expect(result.current.newCanvasDialogOpen).toBe(false)
  })

  test('handleConfirmNewCanvasで確認ダイアログを閉じて新規キャンバスダイアログを開く', () => {
    const { result } = renderHook(() =>
      useProjectHandlers({
        ...defaultOptions,
        canUndo: true,
      })
    )

    act(() => {
      result.current.handleOpenNewCanvasDialog()
    })

    expect(result.current.confirmNewCanvasDialogOpen).toBe(true)

    act(() => {
      result.current.handleConfirmNewCanvas()
    })

    expect(result.current.confirmNewCanvasDialogOpen).toBe(false)
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

    const error = { type: 'parse_error' as const }
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

  describe('ツール設定の保存と読み込み', () => {
    test('loadToolStateDialogOpenの初期値はfalse', () => {
      const { result } = renderHook(() => useProjectHandlers(defaultOptions))

      expect(result.current.loadToolStateDialogOpen).toBe(false)
    })

    test('loadedProjectHasToolStateの初期値はfalse', () => {
      const { result } = renderHook(() => useProjectHandlers(defaultOptions))

      expect(result.current.loadedProjectHasToolState).toBe(false)
    })

    test('handleLoadToolStateRestoreがtrueで呼ばれた場合はツール設定を復元', () => {
      const { result } = renderHook(() => useProjectHandlers(defaultOptions))

      // ダイアログを閉じるだけ（loadedProjectがnullなのでapplyProjectは呼ばれない）
      act(() => {
        result.current.handleLoadToolStateRestore(true)
      })

      expect(result.current.loadToolStateDialogOpen).toBe(false)
    })

    test('handleLoadToolStateSkipでダイアログを閉じる', () => {
      const { result } = renderHook(() => useProjectHandlers(defaultOptions))

      act(() => {
        result.current.handleLoadToolStateSkip()
      })

      expect(result.current.loadToolStateDialogOpen).toBe(false)
    })
  })
})
