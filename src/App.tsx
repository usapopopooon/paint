import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Toaster } from './components/ui/sonner'
import { AppMenubar } from './features/menubar'
import { Canvas, CanvasViewport, useCanvas, useCanvasOffset } from './features/canvas'
import { CanvasResizeDialog, NewCanvasDialog, useCanvasSize } from './features/canvas-resize'
import { ColorWheel } from './features/color'
import type { Point } from './features/drawable'
import { SaveImageDialog, useExportImage } from './features/export'
import type { ExportOptions } from './features/export'
import { useTranslation } from './features/i18n'
import { useImportImage } from './features/import'
import {
  SaveProjectDialog,
  LoadProjectErrorDialog,
  ConfirmLoadProjectDialog,
  saveProject,
  loadProject,
} from './features/project'
import type { LoadProjectError } from './features/project'
import { Toolbar, ToolbarDivider, HandButton, EyedropperButton } from './features/toolbar'
import { ZoomInButton, ZoomOutButton, ZoomDisplay, useZoom } from './features/zoom'
import {
  useTool,
  ToolPanel,
  PenTool,
  BrushTool,
  EraserTool,
  LayerPanel,
  HardnessSlider,
} from './features/tools'
import { MIN_PEN_WIDTH, MAX_PEN_WIDTH } from './features/tools/constants/pen'
import { MIN_BRUSH_WIDTH, MAX_BRUSH_WIDTH } from './features/tools/constants/brush'
import { MIN_ERASER_WIDTH, MAX_ERASER_WIDTH } from './features/tools/constants/eraser'
import { getNextLogValue } from './lib/getNextLogValue'
import { StabilizationSlider, useStabilization } from './features/stabilization'
import { useKeyboardShortcuts, useBeforeUnload } from './hooks'
import { ReloadPrompt } from './features/pwa'
import {
  useSelection,
  SelectionToolButton,
  SelectionContextMenu,
  renderLayerToOffscreenCanvas,
  clearSelectionRegion,
  getMaskedImageDataFromSelection,
  imageDataToDataURL,
  canvasToDataURL,
  getSelectionBounds,
  fillSelectionRegion,
  getOrCreateOffscreenCanvas,
  drawImageDataToContext,
} from './features/selection'
import type { SelectionRegion } from './features/selection'
import { createInitialLayerState, type Layer } from './features/layer'
import type { ImageDrawable } from './features/drawable'
import { generateId } from './lib/id'

/**
 * キャンバス全体をカバーするImageDrawableを作成
 */
const createFullCanvasImageDrawable = (
  dataURL: string,
  width: number,
  height: number
): ImageDrawable => ({
  id: generateId('drawable'),
  createdAt: Date.now(),
  type: 'image',
  src: dataURL,
  x: 0,
  y: 0,
  width,
  height,
  scaleX: 1,
  scaleY: 1,
})

/**
 * 選択領域のキャッシュされたImageDataをレイヤーに保存
 * @param region - 選択領域
 * @param layer - 対象レイヤー
 * @param canvasWidth - キャンバス幅
 * @param canvasHeight - キャンバス高さ
 * @returns 保存用のImageDrawable（保存不要の場合はnull）
 */
const saveRegionImageDataToLayer = async (
  region: SelectionRegion,
  layer: Layer,
  canvasWidth: number,
  canvasHeight: number
): Promise<ImageDrawable | null> => {
  if (!region.imageData) return null

  // レイヤーをオフスクリーンCanvasにレンダリング
  const offscreenCanvas = await getOrCreateOffscreenCanvas(layer, canvasWidth, canvasHeight)
  const ctx = offscreenCanvas.getContext('2d')!

  // キャッシュされたImageDataを現在位置に描画
  const bounds = getSelectionBounds(region.shape, { x: 0, y: 0 })
  drawImageDataToContext(
    ctx,
    region.imageData,
    bounds.x + region.offset.x,
    bounds.y + region.offset.y
  )

  // 結果をImageDrawableとして返す
  const dataURL = canvasToDataURL(offscreenCanvas)
  return createFullCanvasImageDrawable(dataURL, canvasWidth, canvasHeight)
}

/**
 * ペイントアプリケーションのメインコンポーネント
 */
function App() {
  // canvasSizeのsetSizeDirectlyをrefで保持（循環依存を避けるため）
  const setSizeDirectlyRef = useRef<(width: number, height: number) => void>(() => {})
  // キャンバスコンテナのref（画像エクスポート用）
  const canvasContainerRef = useRef<HTMLDivElement>(null)

  // キャンバスリサイズundo/redo時のコールバック
  const handleCanvasResize = useCallback((width: number, height: number) => {
    setSizeDirectlyRef.current(width, height)
  }, [])

  const stabilization = useStabilization()

  const canvasOptions = useMemo(
    () => ({
      onCanvasResize: handleCanvasResize,
      stabilization: stabilization.stabilization,
    }),
    [handleCanvasResize, stabilization.stabilization]
  )
  const canvas = useCanvas(canvasOptions)

  // キャンバスサイズのオプション
  const canvasSizeOptions = useMemo(
    () => ({
      onSizeChange: canvas.translateAllLayers,
      onSizeChangeForHistory: canvas.recordCanvasResize,
    }),
    [canvas.translateAllLayers, canvas.recordCanvasResize]
  )
  const canvasSize = useCanvasSize(canvasSizeOptions)

  // refを更新
  useEffect(() => {
    setSizeDirectlyRef.current = canvasSize.setSizeDirectly
  }, [canvasSize.setSizeDirectly])

  const canvasOffset = useCanvasOffset()
  const zoom = useZoom()
  const tool = useTool()
  const selection = useSelection()
  const exportImage = useExportImage(canvasContainerRef)
  const { t } = useTranslation()

  // 画像インポート
  const importImage = useImportImage({
    canvasWidth: canvasSize.width,
    canvasHeight: canvasSize.height,
    onImport: canvas.addDrawable,
    onError: () => {
      toast.error(t('import.invalidFileType'))
    },
  })

  // ページを離れる前に確認ダイアログを表示
  useBeforeUnload()

  // プロジェクトファイル読み込み用ref
  const projectInputRef = useRef<HTMLInputElement>(null)
  // プロジェクト名とダイアログの状態
  const [projectName, setProjectName] = useState<string | null>(null)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [loadError, setLoadError] = useState<LoadProjectError | null>(null)
  const [confirmLoadDialogOpen, setConfirmLoadDialogOpen] = useState(false)
  // 画像保存ダイアログの状態
  const [saveImageDialogOpen, setSaveImageDialogOpen] = useState(false)
  // キャンバスリサイズメニューの状態
  const [canvasResizeOpen, setCanvasResizeOpen] = useState(false)
  // 新規キャンバスダイアログの状態
  const [newCanvasDialogOpen, setNewCanvasDialogOpen] = useState(false)
  // キャンバスが作成されたかどうか（初期状態では未作成）
  const [isCanvasCreated, setIsCanvasCreated] = useState(false)

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

  // canvas.canUndoをrefで保持（useCallbackの依存配列問題を回避）
  const canUndoRef = useRef(canvas.canUndo)
  useEffect(() => {
    canUndoRef.current = canvas.canUndo
  }, [canvas.canUndo])

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
      canvas.setLayers(project.layers, project.activeLayerId)
      canvas.clearHistory()
      canvasSize.setSizeDirectly(project.canvasWidth, project.canvasHeight)
      setProjectName(project.name)
      // キャンバス作成済みフラグを設定
      setIsCanvasCreated(true)
      // ペンツールを選択
      tool.setToolType('pen')
      toast.success(t('project.loaded'))
    },
    [canvas, canvasSize, tool, t]
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

  /**
   * 画像保存ボタンのハンドラ（ダイアログを開く）
   */
  const handleOpenSaveImageDialog = useCallback(() => {
    setSaveImageDialogOpen(true)
  }, [])

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
      canvasSize.setSizeDirectly(width, height)
      // レイヤーを初期状態にリセット
      const initialState = createInitialLayerState(t('layers.defaultName', { number: 1 }))
      canvas.setLayers(initialState.layers, initialState.activeLayerId)
      // 履歴をクリア
      canvas.clearHistory()
      // プロジェクト名を設定
      setProjectName(newProjectName)
      // ペンツールを選択
      tool.setToolType('pen')
      // キャンバス作成済みフラグを設定
      setIsCanvasCreated(true)
    },
    [canvasSize, canvas, tool, t]
  )

  /**
   * 画像保存ダイアログで保存を確定した時のハンドラ
   */
  const handleSaveImage = useCallback(
    async (options: ExportOptions) => {
      await exportImage.saveImage(options, canvas.showBackgroundLayer, canvas.hideBackgroundLayer)
    },
    [exportImage, canvas.showBackgroundLayer, canvas.hideBackgroundLayer]
  )

  const handleSaveProjectConfirm = useCallback(
    async (fileName: string) => {
      const saved = await saveProject({
        fileName,
        canvasWidth: canvasSize.width,
        canvasHeight: canvasSize.height,
        layers: canvas.layers,
        activeLayerId: canvas.activeLayerId,
      })

      if (saved) {
        setProjectName(fileName)
        toast.success(t('project.saved'))
      }
    },
    [canvas.layers, canvas.activeLayerId, canvasSize.width, canvasSize.height, t]
  )

  // toolの最新状態をrefで保持（useCallbackの依存配列問題を回避）
  const toolRef = useRef(tool)
  useEffect(() => {
    toolRef.current = tool
  }, [tool])

  /**
   * ツールサイズを1段階大きくする（対数スケール）
   */
  const handleIncreaseToolSize = useCallback(() => {
    const t = toolRef.current
    const toolType = t.currentType
    const configs = {
      pen: {
        width: t.penConfig.width,
        min: MIN_PEN_WIDTH,
        max: MAX_PEN_WIDTH,
        setter: t.setPenWidth,
      },
      brush: {
        width: t.brushConfig.width,
        min: MIN_BRUSH_WIDTH,
        max: MAX_BRUSH_WIDTH,
        setter: t.setBrushWidth,
      },
      eraser: {
        width: t.eraserConfig.width,
        min: MIN_ERASER_WIDTH,
        max: MAX_ERASER_WIDTH,
        setter: t.setEraserWidth,
      },
    }
    const config = configs[toolType as keyof typeof configs]
    if (config) {
      const newWidth = getNextLogValue(config.width, config.min, config.max, 1)
      config.setter(newWidth)
    }
  }, [])

  /**
   * ツールサイズを1段階小さくする（対数スケール）
   */
  const handleDecreaseToolSize = useCallback(() => {
    const t = toolRef.current
    const toolType = t.currentType
    const configs = {
      pen: {
        width: t.penConfig.width,
        min: MIN_PEN_WIDTH,
        max: MAX_PEN_WIDTH,
        setter: t.setPenWidth,
      },
      brush: {
        width: t.brushConfig.width,
        min: MIN_BRUSH_WIDTH,
        max: MAX_BRUSH_WIDTH,
        setter: t.setBrushWidth,
      },
      eraser: {
        width: t.eraserConfig.width,
        min: MIN_ERASER_WIDTH,
        max: MAX_ERASER_WIDTH,
        setter: t.setEraserWidth,
      },
    }
    const config = configs[toolType as keyof typeof configs]
    if (config) {
      const newWidth = getNextLogValue(config.width, config.min, config.max, -1)
      config.setter(newWidth)
    }
  }, [])

  const handleSelectRectangle = useCallback(() => {
    tool.setToolType('select-rectangle')
    selection.setToolType('select-rectangle')
  }, [tool, selection])

  const handleSelectLasso = useCallback(() => {
    tool.setToolType('select-lasso')
    selection.setToolType('select-lasso')
  }, [tool, selection])

  /**
   * すべて選択するハンドラ
   */
  const handleSelectAll = useCallback(() => {
    selection.selectAll(
      { x: 0, y: 0, width: canvasSize.width, height: canvasSize.height },
      canvas.activeLayerId
    )
  }, [selection, canvasSize.width, canvasSize.height, canvas.activeLayerId])

  /**
   * 選択解除ハンドラ
   * 移動中の場合はキャッシュされたImageDataを現在位置に描画してから選択解除
   */
  const handleDeselect = useCallback(async () => {
    const region = selection.state.region
    if (!region) {
      selection.deselect()
      return
    }

    // キャッシュされたImageDataがある場合は現在位置に描画
    const layer = canvas.layers.find((l) => l.id === region.layerId)
    if (layer && region.imageData) {
      const imageDrawable = await saveRegionImageDataToLayer(
        region,
        layer,
        canvasSize.width,
        canvasSize.height
      )
      if (imageDrawable) {
        canvas.setDrawablesToLayer([imageDrawable], region.layerId)
      }
    }

    selection.deselect()
  }, [selection, canvas, canvasSize.width, canvasSize.height])

  /**
   * 選択領域を削除するハンドラ
   * レイヤーをオフスクリーンCanvasにレンダリング → 選択領域をクリア → ImageDrawableとして保存
   */
  const handleDeleteSelection = useCallback(async () => {
    const region = selection.state.region
    if (!region) return

    // 対象レイヤーを取得
    const layer = canvas.layers.find((l) => l.id === region.layerId)
    if (!layer || layer.drawables.length === 0) {
      selection.deselect()
      return
    }

    // レイヤーをオフスクリーンCanvasにレンダリング
    const offscreenCanvas = await renderLayerToOffscreenCanvas(
      layer,
      canvasSize.width,
      canvasSize.height
    )
    const ctx = offscreenCanvas.getContext('2d')!

    // 選択領域をクリア
    clearSelectionRegion(ctx, region.shape, region.offset)

    // 結果をImageDrawableとして作成
    const imageDrawable = createFullCanvasImageDrawable(
      canvasToDataURL(offscreenCanvas),
      canvasSize.width,
      canvasSize.height
    )
    canvas.setDrawablesToLayer([imageDrawable], region.layerId)

    // 選択を解除
    selection.deselect()
  }, [selection, canvas, canvasSize.width, canvasSize.height])

  /**
   * 選択領域をコピーするハンドラ
   * レイヤーをオフスクリーンCanvasにレンダリング → 選択領域のImageDataを取得 → clipboardに保存
   */
  const handleCopySelection = useCallback(async () => {
    const region = selection.state.region
    if (!region) return

    // 対象レイヤーを取得
    const layer = canvas.layers.find((l) => l.id === region.layerId)
    if (!layer) return

    // レイヤーをオフスクリーンCanvasにレンダリング
    const offscreenCanvas = await renderLayerToOffscreenCanvas(
      layer,
      canvasSize.width,
      canvasSize.height
    )
    const ctx = offscreenCanvas.getContext('2d')!

    // 選択領域からImageDataを取得（Lassoの場合はマスク適用）
    const imageData = getMaskedImageDataFromSelection(ctx, region.shape, region.offset)
    const bounds = getSelectionBounds(region.shape, region.offset)

    // clipboardに保存
    selection.copySelection(imageData, bounds)
  }, [selection, canvas.layers, canvasSize.width, canvasSize.height])

  /**
   * 選択領域をカットするハンドラ
   * コピー + 削除
   */
  const handleCutSelection = useCallback(async () => {
    const region = selection.state.region
    if (!region) return

    // 対象レイヤーを取得
    const layer = canvas.layers.find((l) => l.id === region.layerId)
    if (!layer) return

    // レイヤーをオフスクリーンCanvasにレンダリング
    const offscreenCanvas = await renderLayerToOffscreenCanvas(
      layer,
      canvasSize.width,
      canvasSize.height
    )
    const ctx = offscreenCanvas.getContext('2d')!

    // 選択領域からImageDataを取得（Lassoの場合はマスク適用）
    const imageData = getMaskedImageDataFromSelection(ctx, region.shape, region.offset)
    const bounds = getSelectionBounds(region.shape, region.offset)

    // 選択領域をクリア
    clearSelectionRegion(ctx, region.shape, region.offset)

    // 結果をImageDrawableとして作成
    const imageDrawable = createFullCanvasImageDrawable(
      canvasToDataURL(offscreenCanvas),
      canvasSize.width,
      canvasSize.height
    )
    canvas.setDrawablesToLayer([imageDrawable], region.layerId)

    // clipboardに保存してから選択解除
    selection.cutSelection(imageData, bounds)
  }, [selection, canvas, canvasSize.width, canvasSize.height])

  /**
   * ペーストするハンドラ
   * clipboardのImageDataをImageDrawableとしてレイヤーに追加
   */
  const handlePasteSelection = useCallback(() => {
    const clipboard = selection.state.clipboard
    if (!clipboard) return

    // ImageDataをbase64データURLに変換
    const dataURL = imageDataToDataURL(clipboard.imageData)

    // 中央にペースト
    const centerX = (canvasSize.width - clipboard.bounds.width) / 2
    const centerY = (canvasSize.height - clipboard.bounds.height) / 2

    // ImageDrawableとして追加
    const imageDrawable: ImageDrawable = {
      id: generateId('drawable'),
      createdAt: Date.now(),
      type: 'image',
      src: dataURL,
      x: centerX,
      y: centerY,
      width: clipboard.bounds.width,
      height: clipboard.bounds.height,
      scaleX: 1,
      scaleY: 1,
    }
    canvas.addDrawable(imageDrawable)

    // 選択状態を更新（pasteSelectionは内部でregionを更新するが、ここでは描画のみ）
    selection.pasteSelection(canvas.activeLayerId, {
      x: 0,
      y: 0,
      width: canvasSize.width,
      height: canvasSize.height,
    })
  }, [selection, canvas, canvasSize.width, canvasSize.height])

  /**
   * 選択領域を前景色で塗りつぶすハンドラ
   */
  const handleFillSelection = useCallback(async () => {
    const region = selection.state.region
    if (!region) return

    // 対象レイヤーを取得
    const layer = canvas.layers.find((l) => l.id === region.layerId)
    if (!layer) return

    // 現在の前景色を取得
    const color = tool.currentType === 'brush' ? tool.brushConfig.color : tool.penConfig.color

    // レイヤーをオフスクリーンCanvasにレンダリング
    const offscreenCanvas = await renderLayerToOffscreenCanvas(
      layer,
      canvasSize.width,
      canvasSize.height
    )
    const ctx = offscreenCanvas.getContext('2d')!

    // 選択領域を塗りつぶし
    fillSelectionRegion(ctx, region.shape, color, region.offset)

    // 結果をImageDrawableとして作成
    const imageDrawable = createFullCanvasImageDrawable(
      canvasToDataURL(offscreenCanvas),
      canvasSize.width,
      canvasSize.height
    )
    canvas.setDrawablesToLayer([imageDrawable], region.layerId)

    // 選択を解除
    selection.deselect()
  }, [
    selection,
    canvas,
    tool.currentType,
    tool.brushConfig.color,
    tool.penConfig.color,
    canvasSize.width,
    canvasSize.height,
  ])

  // キーボードショートカット
  useKeyboardShortcuts({
    onUndo: canvas.undo,
    onRedo: canvas.redo,
    onClear: canvas.clear,
    onSelectPen: () => tool.setToolType('pen'),
    onSelectBrush: () => tool.setToolType('brush'),
    onSelectEraser: () => tool.setToolType('eraser'),
    onSelectHand: () => tool.setToolType('hand'),
    onSelectEyedropper: () => tool.setToolType('eyedropper'),
    onSelectRectangle: handleSelectRectangle,
    onSelectLasso: handleSelectLasso,
    onSelectAll: handleSelectAll,
    onDeselect: handleDeselect,
    onDeleteSelection: handleDeleteSelection,
    onCopySelection: handleCopySelection,
    onCutSelection: handleCutSelection,
    onPasteSelection: handlePasteSelection,
    onFillSelection: handleFillSelection,
    onZoomIn: zoom.zoomIn,
    onZoomOut: zoom.zoomOut,
    onZoomReset: zoom.resetZoom,
    onFlipHorizontal: () => canvas.flipHorizontal(canvasSize.width),
    onFlipVertical: () => canvas.flipVertical(canvasSize.height),
    onMoveLayerUp: () => canvas.moveLayerUp(canvas.activeLayerId),
    onMoveLayerDown: () => canvas.moveLayerDown(canvas.activeLayerId),
    onIncreaseToolSize: handleIncreaseToolSize,
    onDecreaseToolSize: handleDecreaseToolSize,
  })

  /**
   * ストローク開始時のハンドラ
   * @param point - 開始位置
   */
  const handleStartStroke = useCallback(
    (point: Point) => {
      canvas.startStroke(point, tool.currentConfig)
    },
    [canvas, tool.currentConfig]
  )

  const handleSelectPen = useCallback(() => {
    tool.setToolType('pen')
  }, [tool])

  const handleSelectBrush = useCallback(() => {
    tool.setToolType('brush')
  }, [tool])

  const handleSelectEraser = useCallback(() => {
    tool.setToolType('eraser')
  }, [tool])

  /**
   * 選択開始ハンドラ
   * 既存の選択領域がある場合は先に保存してから新しい選択を開始
   */
  const handleStartSelection = useCallback(
    async (point: Point) => {
      const region = selection.state.region
      // 既存の選択領域にImageDataがキャッシュされている場合は先に保存
      if (region?.imageData) {
        const layer = canvas.layers.find((l) => l.id === region.layerId)
        if (layer) {
          const imageDrawable = await saveRegionImageDataToLayer(
            region,
            layer,
            canvasSize.width,
            canvasSize.height
          )
          if (imageDrawable) {
            canvas.setDrawablesToLayer([imageDrawable], region.layerId)
          }
        }
      }

      selection.startSelection(point, canvas.activeLayerId)
    },
    [selection, canvas, canvasSize.width, canvasSize.height]
  )

  /**
   * 選択領域の移動を開始するハンドラ
   * 最初の移動時にImageDataをキャッシュして品質劣化を防ぐ
   * レイヤーはクリアされた状態のまま保持し、描画はhandleDeselectで行う
   */
  const handleStartMove = useCallback(
    async (point: Point) => {
      const region = selection.state.region
      if (!region) return

      // すでにImageDataがキャッシュされている場合は移動開始のみ
      // （レイヤーは既にクリアされた状態のまま）
      if (region.imageData) {
        selection.startMove(point)
        return
      }

      // 対象レイヤーを取得
      const layer = canvas.layers.find((l) => l.id === region.layerId)
      if (!layer || layer.drawables.length === 0) {
        selection.startMove(point)
        return
      }

      // 最初の移動：レイヤーをオフスクリーンCanvasにレンダリング
      const offscreenCanvas = await renderLayerToOffscreenCanvas(
        layer,
        canvasSize.width,
        canvasSize.height
      )
      const ctx = offscreenCanvas.getContext('2d')!

      // 選択領域からImageDataを取得してキャッシュ
      const imageData = getMaskedImageDataFromSelection(ctx, region.shape, { x: 0, y: 0 })
      selection.setRegionImageData(imageData)

      // オリジナルの位置から選択領域をクリア
      clearSelectionRegion(ctx, region.shape, { x: 0, y: 0 })

      // クリア後のキャンバスをImageDrawableとして保存
      const imageDrawable = createFullCanvasImageDrawable(
        canvasToDataURL(offscreenCanvas),
        canvasSize.width,
        canvasSize.height
      )
      canvas.setDrawablesToLayer([imageDrawable], region.layerId)

      // 移動開始
      selection.startMove(point)
    },
    [selection, canvas, canvasSize.width, canvasSize.height]
  )

  /**
   * 選択領域の移動を確定するハンドラ
   * レイヤーには描画せず、選択状態のみ更新（実際の描画はhandleDeselectで行う）
   */
  const handleCommitMove = useCallback(() => {
    // 選択状態をコミット（shape座標が更新される）
    selection.commitMove()
  }, [selection])

  /**
   * 色変更ハンドラ（ペンとブラシの両方に適用）
   */
  const handleColorChange = useCallback(
    (color: string) => {
      tool.setPenColor(color)
      tool.setBrushColor(color)
    },
    [tool]
  )

  /**
   * 現在選択中のツールに応じた色を取得
   */
  const currentColor = tool.currentType === 'brush' ? tool.brushConfig.color : tool.penConfig.color

  /**
   * 現在選択中のツールのhardnessを取得
   * 描画ツール以外の場合は最後に選択されていた描画ツールのhardness値を返す
   */
  const currentHardness =
    tool.currentType === 'pen'
      ? tool.penConfig.hardness
      : tool.currentType === 'brush'
        ? tool.brushConfig.hardness
        : tool.currentType === 'eraser'
          ? tool.eraserConfig.hardness
          : tool.lastDrawingToolHardness

  /**
   * 現在選択中のツールのisBlurEnabledを取得
   * 描画ツール以外の場合は最後に選択されていた描画ツールのisBlurEnabled値を返す
   */
  const currentBlurEnabled =
    tool.currentType === 'pen'
      ? tool.penConfig.isBlurEnabled
      : tool.currentType === 'brush'
        ? tool.brushConfig.isBlurEnabled
        : tool.currentType === 'eraser'
          ? tool.eraserConfig.isBlurEnabled
          : tool.lastDrawingToolBlurEnabled

  /**
   * 現在選択中のツールのhardnessを変更
   */
  const handleHardnessChange = useCallback(
    (hardness: number) => {
      const setters = {
        pen: tool.setPenHardness,
        brush: tool.setBrushHardness,
        eraser: tool.setEraserHardness,
      }
      const setter = setters[tool.currentType as keyof typeof setters]
      if (setter) setter(hardness)
    },
    [tool]
  )

  /**
   * 現在選択中のツールのisBlurEnabledを変更
   */
  const handleBlurEnabledChange = useCallback(
    (enabled: boolean) => {
      const setters = {
        pen: tool.setPenBlurEnabled,
        brush: tool.setBrushBlurEnabled,
        eraser: tool.setEraserBlurEnabled,
      }
      const setter = setters[tool.currentType as keyof typeof setters]
      if (setter) setter(enabled)
    },
    [tool]
  )

  /**
   * hardnessスライダーが無効かどうか（ペン、ブラシ、消しゴム以外）
   */
  const isHardnessDisabled = !['pen', 'brush', 'eraser'].includes(tool.currentType)

  /**
   * ホイールでのズーム処理（カーソル位置を基準にPhotoshopスタイル）
   */
  const handleWheelAtPoint = useCallback(
    (
      deltaY: number,
      mouseX: number,
      mouseY: number,
      viewportWidth: number,
      viewportHeight: number
    ) => {
      const result = zoom.handleWheelAtPoint(
        deltaY,
        mouseX,
        mouseY,
        viewportWidth,
        viewportHeight,
        canvasOffset.offset
      )
      canvasOffset.setPosition(result.offset.x, result.offset.y)

      // ホイール方向に応じてツール選択状態を更新
      if (result.direction === 'in') {
        tool.setToolType('zoom-in')
      } else {
        tool.setToolType('zoom-out')
      }

      return result
    },
    [zoom, canvasOffset, tool]
  )

  /**
   * ズームツールクリック時の処理（クリック位置を基準にPhotoshopスタイル）
   * NOTE: Canvas側でviewportSizeを取得してこのハンドラに渡す必要がある
   */
  const handleZoomAtPoint = useCallback(
    (
      mouseX: number,
      mouseY: number,
      viewportWidth: number,
      viewportHeight: number,
      direction: 'in' | 'out'
    ) => {
      const newOffset = zoom.zoomAtPoint(
        mouseX,
        mouseY,
        viewportWidth,
        viewportHeight,
        direction,
        canvasOffset.offset
      )
      canvasOffset.setPosition(newOffset.x, newOffset.y)
    },
    [zoom, canvasOffset]
  )

  return (
    <div className="h-screen flex flex-col">
      {/* Top menubar and toolbar */}
      <header className="flex items-center justify-between px-2 py-1 border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100">
        <div className="flex items-center">
          <AppMenubar
            onNewCanvas={handleOpenNewCanvasDialog}
            projectInputRef={projectInputRef}
            onOpenProject={handleOpenProjectFilePicker}
            onProjectFileChange={handleProjectFileChange}
            onSaveProject={handleSaveProject}
            importInputRef={importImage.inputRef}
            onImport={importImage.openFilePicker}
            onImportFileChange={importImage.handleFileChange}
            onExport={handleOpenSaveImageDialog}
            isCanvasCreated={isCanvasCreated}
            canUndo={canvas.canUndo}
            canRedo={canvas.canRedo}
            onUndo={canvas.undo}
            onRedo={canvas.redo}
            onClear={canvas.clear}
            onFlipHorizontal={() => canvas.flipHorizontal(canvasSize.width)}
            onFlipVertical={() => canvas.flipVertical(canvasSize.height)}
            onCanvasSize={() => setCanvasResizeOpen(true)}
            hasSelection={selection.state.region !== null}
            hasClipboard={selection.state.clipboard !== null}
            onSelectAll={handleSelectAll}
            onDeselect={handleDeselect}
            onCut={handleCutSelection}
            onCopy={handleCopySelection}
            onPaste={handlePasteSelection}
            onDelete={handleDeleteSelection}
            onZoomIn={zoom.zoomIn}
            onZoomOut={zoom.zoomOut}
            onZoomReset={zoom.resetZoom}
            onCenterCanvas={canvasOffset.reset}
          />
          <ToolbarDivider />
          <Toolbar>
            <HandButton
              isActive={tool.currentType === 'hand'}
              onClick={() => tool.setToolType('hand')}
            />
            <EyedropperButton
              isActive={tool.currentType === 'eyedropper'}
              onClick={() => tool.setToolType('eyedropper')}
            />
            <ToolbarDivider />
            <ZoomInButton
              isActive={tool.currentType === 'zoom-in'}
              onClick={() => tool.setToolType('zoom-in')}
            />
            <ZoomOutButton
              isActive={tool.currentType === 'zoom-out'}
              onClick={() => tool.setToolType('zoom-out')}
            />
            <ZoomDisplay zoomPercent={zoom.zoomPercent} onZoomChange={zoom.setZoomLevel} />
            <ToolbarDivider />
            <StabilizationSlider
              stabilization={stabilization.stabilization}
              onStabilizationChange={stabilization.setStabilization}
            />
          </Toolbar>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 min-h-0">
        <ToolPanel>
          <ColorWheel color={currentColor} onChange={handleColorChange} />
          <HardnessSlider
            hardness={currentHardness}
            onHardnessChange={handleHardnessChange}
            isBlurEnabled={currentBlurEnabled}
            onBlurEnabledChange={handleBlurEnabledChange}
            disabled={isHardnessDisabled}
          />
          <PenTool
            isActive={tool.currentType === 'pen'}
            width={tool.penConfig.width}
            opacity={tool.penConfig.opacity}
            onSelect={handleSelectPen}
            onWidthChange={tool.setPenWidth}
            onOpacityChange={tool.setPenOpacity}
          />
          <BrushTool
            isActive={tool.currentType === 'brush'}
            width={tool.brushConfig.width}
            opacity={tool.brushConfig.opacity}
            onSelect={handleSelectBrush}
            onWidthChange={tool.setBrushWidth}
            onOpacityChange={tool.setBrushOpacity}
          />
          <EraserTool
            isActive={tool.currentType === 'eraser'}
            width={tool.eraserConfig.width}
            opacity={tool.eraserConfig.opacity}
            onSelect={handleSelectEraser}
            onWidthChange={tool.setEraserWidth}
            onOpacityChange={tool.setEraserOpacity}
          />
          <SelectionToolButton
            toolType="select-rectangle"
            isActive={tool.currentType === 'select-rectangle'}
            onSelect={handleSelectRectangle}
          />
          <SelectionToolButton
            toolType="select-lasso"
            isActive={tool.currentType === 'select-lasso'}
            onSelect={handleSelectLasso}
          />
          <LayerPanel
            layers={canvas.layers}
            activeLayerId={canvas.activeLayerId}
            drawingLayerCount={canvas.drawingLayerCount}
            onLayerSelect={canvas.setActiveLayer}
            onLayerVisibilityChange={canvas.setLayerVisibility}
            onLayerAdd={canvas.addLayer}
            onLayerDelete={canvas.deleteLayer}
            onLayerNameChange={canvas.setLayerName}
            onLayerBlendModeChange={canvas.setLayerBlendMode}
            onLayerOpacityChange={canvas.setLayerOpacity}
            onLayerMove={canvas.moveLayer}
          />
        </ToolPanel>

        {/* Canvas area */}
        <main className="flex-1 overflow-hidden bg-[rgb(220,220,220)] dark:bg-muted/30">
          {isCanvasCreated ? (
            <CanvasViewport
              canvasWidth={canvasSize.width}
              canvasHeight={canvasSize.height}
              offset={canvasOffset.offset}
              onOffsetChange={canvasOffset.setPosition}
              zoom={zoom.zoom}
              onWheelAtPoint={handleWheelAtPoint}
            >
              {(viewportSize) => (
                <SelectionContextMenu
                  hasSelection={selection.state.region !== null}
                  hasClipboard={selection.state.clipboard !== null}
                  onCut={handleCutSelection}
                  onCopy={handleCopySelection}
                  onPaste={handlePasteSelection}
                  onDelete={handleDeleteSelection}
                  onDeselect={handleDeselect}
                  onSelectAll={handleSelectAll}
                  showContextMenu={
                    tool.currentType === 'select-rectangle' ||
                    tool.currentType === 'select-lasso'
                  }
                >
                  <div ref={canvasContainerRef}>
                    <Canvas
                      layers={canvas.layers}
                      onStartStroke={handleStartStroke}
                      onAddPoint={canvas.addPoint}
                      onEndStroke={canvas.endStroke}
                      cursor={tool.cursor}
                      width={canvasSize.width}
                      height={canvasSize.height}
                      toolType={tool.currentType}
                      offset={canvasOffset.offset}
                      onPan={canvasOffset.pan}
                      onPickColor={handleColorChange}
                      zoom={zoom.zoom}
                      viewportSize={viewportSize}
                      onZoomAtPoint={handleZoomAtPoint}
                      selectionRegion={selection.state.region}
                      selectionPoints={selection.selectionPoints}
                      selectionToolType={selection.state.toolConfig.type}
                      isSelecting={selection.state.phase === 'selecting'}
                      isMoving={selection.state.phase === 'moving'}
                      onStartSelection={handleStartSelection}
                      onUpdateSelection={selection.updateSelection}
                      onCommitSelection={selection.commitSelection}
                      onStartMove={handleStartMove}
                      onUpdateMove={selection.updateMove}
                      onCommitMove={handleCommitMove}
                      isPointInRegion={selection.isPointInRegion}
                    />
                  </div>
                </SelectionContextMenu>
              )}
            </CanvasViewport>
          ) : null}
        </main>
      </div>
      <Toaster />
      <SaveProjectDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        onSave={handleSaveProjectConfirm}
      />
      <LoadProjectErrorDialog
        open={loadError !== null}
        onOpenChange={(open) => !open && setLoadError(null)}
        error={loadError}
      />
      <ConfirmLoadProjectDialog
        open={confirmLoadDialogOpen}
        onOpenChange={setConfirmLoadDialogOpen}
        onConfirm={handleConfirmLoad}
      />
      <SaveImageDialog
        open={saveImageDialogOpen}
        onOpenChange={setSaveImageDialogOpen}
        onSave={handleSaveImage}
      />
      <CanvasResizeDialog
        open={canvasResizeOpen}
        onOpenChange={setCanvasResizeOpen}
        width={canvasSize.width}
        height={canvasSize.height}
        anchor={canvasSize.anchor}
        onResize={(w, h, a) => {
          canvasSize.setWidth(w)
          canvasSize.setHeight(h)
          canvasSize.setAnchor(a)
        }}
      />
      <NewCanvasDialog
        open={newCanvasDialogOpen}
        onOpenChange={setNewCanvasDialogOpen}
        onCreate={handleCreateNewCanvas}
      />
      <ReloadPrompt />
    </div>
  )
}

export default App
