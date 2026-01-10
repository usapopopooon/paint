import { useCallback, useRef, useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useTranslation } from '@/features/i18n'
import { saveProject, loadProject, useAutoSave, useRecovery } from '@/features/project'
import type { LoadProjectError } from '@/features/project'
import type { Layer } from '@/features/layer'
import { createInitialLayerState } from '@/features/layer'
import type { ToolType } from '@/features/tools'

export interface UseProjectHandlersOptions {
  canvasWidth: number
  canvasHeight: number
  layers: readonly Layer[]
  activeLayerId: string
  canUndo: boolean
  setLayers: (layers: readonly Layer[], activeLayerId: string) => void
  clearHistory: () => void
  setSizeDirectly: (width: number, height: number) => void
  setToolType: (type: ToolType) => void
}

export interface ProjectHandlers {
  projectName: string | null
  setProjectName: (name: string | null) => void
  isCanvasCreated: boolean
  saveDialogOpen: boolean
  setSaveDialogOpen: (open: boolean) => void
  loadError: LoadProjectError | null
  setLoadError: (error: LoadProjectError | null) => void
  confirmLoadDialogOpen: boolean
  setConfirmLoadDialogOpen: (open: boolean) => void
  newCanvasDialogOpen: boolean
  setNewCanvasDialogOpen: (open: boolean) => void
  recoveryDialogOpen: boolean
  projectInputRef: React.RefObject<HTMLInputElement | null>
  handleOpenProjectFilePicker: () => void
  handleProjectFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  handleConfirmLoad: () => void
  handleSaveProject: () => void
  handleSaveProjectConfirm: (fileName: string) => Promise<void>
  handleOpenNewCanvasDialog: () => void
  handleCreateNewCanvas: (width: number, height: number, newProjectName: string | null) => void
  handleRecoveryRestore: () => Promise<void>
  handleRecoveryDiscard: () => Promise<void>
}

export function useProjectHandlers(options: UseProjectHandlersOptions): ProjectHandlers {
  const {
    canvasWidth,
    canvasHeight,
    layers,
    activeLayerId,
    canUndo,
    setLayers,
    clearHistory,
    setSizeDirectly,
    setToolType,
  } = options

  const { t } = useTranslation()
  const recovery = useRecovery()

  // プロジェクトファイル読み込み用ref
  const projectInputRef = useRef<HTMLInputElement>(null)

  // プロジェクト名とダイアログの状態
  const [projectName, setProjectName] = useState<string | null>(null)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [loadError, setLoadError] = useState<LoadProjectError | null>(null)
  const [confirmLoadDialogOpen, setConfirmLoadDialogOpen] = useState(false)
  const [newCanvasDialogOpen, setNewCanvasDialogOpen] = useState(false)
  const [isCanvasCreated, setIsCanvasCreated] = useState(false)
  const [recoveryDialogOpen, setRecoveryDialogOpen] = useState(false)

  // canvas.canUndoをrefで保持（useCallbackの依存配列問題を回避）
  const canUndoRef = useRef(canUndo)
  useEffect(() => {
    canUndoRef.current = canUndo
  }, [canUndo])

  // プロジェクト名やキャンバス状態が変わったらブラウザタイトルを更新
  useEffect(() => {
    if (projectName) {
      document.title = `${projectName} - Paint`
    } else if (isCanvasCreated) {
      const untitledName = t('app.untitledProject')
      document.title = `${untitledName} - Paint`
    } else {
      document.title = 'Paint'
    }
  }, [projectName, isCanvasCreated, t])

  // 復元可能なデータがある場合にダイアログを表示
  useEffect(() => {
    if (!recovery.isLoading && recovery.hasRecoverableData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- リカバリーダイアログの初期表示に必要
      setRecoveryDialogOpen(true)
    }
  }, [recovery.isLoading, recovery.hasRecoverableData])

  // 自動保存（キャンバスが作成されている場合のみ）
  useAutoSave({
    projectName: projectName || '',
    canvasWidth,
    canvasHeight,
    layers,
    activeLayerId,
    enabled: isCanvasCreated,
  })

  /**
   * 自動保存データを復元するハンドラ
   */
  const handleRecoveryRestore = useCallback(async () => {
    const project = await recovery.restore()
    if (project) {
      setLayers(project.layers, project.activeLayerId)
      clearHistory()
      setSizeDirectly(project.canvasWidth, project.canvasHeight)
      setProjectName(project.name)
      setIsCanvasCreated(true)
      setToolType('pen')
      toast.success(t('recovery.restored'))
    }
    setRecoveryDialogOpen(false)
  }, [recovery, setLayers, clearHistory, setSizeDirectly, setToolType, t])

  /**
   * 自動保存データを破棄するハンドラ
   */
  const handleRecoveryDiscard = useCallback(async () => {
    await recovery.discard()
    setRecoveryDialogOpen(false)
  }, [recovery])

  /**
   * プロジェクトを開くボタンのハンドラ
   * 未保存の編集がある場合は確認ダイアログを表示してからファイル選択
   */
  const handleOpenProjectFilePicker = useCallback(() => {
    if (canUndoRef.current) {
      setConfirmLoadDialogOpen(true)
      return
    }
    projectInputRef.current?.click()
  }, [])

  /**
   * プロジェクトファイルを実際に読み込む処理
   */
  const loadProjectFile = useCallback(
    async (file: File) => {
      const result = await loadProject(file)
      if (!result.success) {
        setLoadError(result.error)
        return
      }

      // プロジェクト読み込み
      const project = result.project
      setLayers(project.layers, project.activeLayerId)
      clearHistory()
      setSizeDirectly(project.canvasWidth, project.canvasHeight)
      setProjectName(project.name)
      setIsCanvasCreated(true)
      setToolType('pen')
      toast.success(t('project.loaded'))
    },
    [setLayers, clearHistory, setSizeDirectly, setToolType, t]
  )

  const handleProjectFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      // inputをリセット（同じファイルを再選択可能にする）
      e.target.value = ''

      await loadProjectFile(file)
    },
    [loadProjectFile]
  )

  /**
   * 確認ダイアログでOKを押した時の処理（ファイル選択ダイアログを開く）
   */
  const handleConfirmLoad = useCallback(() => {
    setConfirmLoadDialogOpen(false)
    projectInputRef.current?.click()
  }, [])

  const handleSaveProject = useCallback(() => {
    setSaveDialogOpen(true)
  }, [])

  const handleSaveProjectConfirm = useCallback(
    async (fileName: string) => {
      const saved = await saveProject({
        fileName,
        canvasWidth,
        canvasHeight,
        layers,
        activeLayerId,
      })

      if (saved) {
        setProjectName(fileName)
        toast.success(t('project.saved'))
      }
    },
    [layers, activeLayerId, canvasWidth, canvasHeight, t]
  )

  /**
   * 新規キャンバスダイアログを開くハンドラ
   */
  const handleOpenNewCanvasDialog = useCallback(() => {
    setNewCanvasDialogOpen(true)
  }, [])

  /**
   * 新規キャンバス作成ハンドラ
   * キャンバスをリセットしてペンツールを選択
   */
  const handleCreateNewCanvas = useCallback(
    (width: number, height: number, newProjectName: string | null) => {
      // キャンバスサイズを設定
      setSizeDirectly(width, height)
      // レイヤーを初期状態にリセット
      const initialState = createInitialLayerState(t('layers.defaultName', { number: 1 }))
      setLayers(initialState.layers, initialState.activeLayerId)
      // 履歴をクリア
      clearHistory()
      // プロジェクト名を設定
      setProjectName(newProjectName)
      // ペンツールを選択
      setToolType('pen')
      // キャンバス作成済みフラグを設定
      setIsCanvasCreated(true)
    },
    [setSizeDirectly, setLayers, clearHistory, setToolType, t]
  )

  return {
    projectName,
    setProjectName,
    isCanvasCreated,
    saveDialogOpen,
    setSaveDialogOpen,
    loadError,
    setLoadError,
    confirmLoadDialogOpen,
    setConfirmLoadDialogOpen,
    newCanvasDialogOpen,
    setNewCanvasDialogOpen,
    recoveryDialogOpen,
    projectInputRef,
    handleOpenProjectFilePicker,
    handleProjectFileChange,
    handleConfirmLoad,
    handleSaveProject,
    handleSaveProjectConfirm,
    handleOpenNewCanvasDialog,
    handleCreateNewCanvas,
    handleRecoveryRestore,
    handleRecoveryDiscard,
  }
}
