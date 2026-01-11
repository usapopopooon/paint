import { useCallback, useEffect, useMemo, useRef } from 'react'
import { toast } from 'sonner'
import { Toaster } from './components/ui/sonner'
import { AppMenubar } from './features/menubar'
import { Canvas, CanvasViewport, useCanvas, useCanvasOffset } from './features/canvas'
import {
  CanvasResizeDialog,
  ConfirmNewCanvasDialog,
  NewCanvasDialog,
  useCanvasSize,
} from './features/canvas-resize'
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
  RecoveryDialog,
  LoadToolStateDialog,
  useRecovery,
} from './features/project'
import type { ImageDrawable } from './features/drawable'
import { Toolbar, ToolbarDivider, HandButton, EyedropperButton } from './features/toolbar'
import { ZoomInButton, ZoomOutButton, ZoomDisplay, useZoom } from './features/zoom'
import {
  useTool,
  ToolPanel,
  PenTool,
  BrushTool,
  BlurTool,
  EraserTool,
  LayerPanel,
  HardnessSlider,
} from './features/tools'
import { StabilizationSlider, useStabilization } from './features/stabilization'
import {
  useKeyboardShortcuts,
  useBeforeUnload,
  useProjectHandlers,
  useSelectionHandlers,
  useTransformHandlers,
  useToolHandlers,
} from './hooks'
import { ReloadPrompt } from './features/pwa'
import {
  useSelection,
  useTransform,
  SelectionToolButton,
  SelectionContextMenu,
} from './features/selection'
import { useState } from 'react'

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

  // 自動保存データの復元
  const recovery = useRecovery()

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
  const transform = useTransform()
  const exportImage = useExportImage(canvasContainerRef)
  const { t } = useTranslation()

  // 画像保存ダイアログの状態
  const [saveImageDialogOpen, setSaveImageDialogOpen] = useState(false)
  // キャンバスリサイズメニューの状態
  const [canvasResizeOpen, setCanvasResizeOpen] = useState(false)

  // プロジェクト関連のハンドラ
  const projectHandlers = useProjectHandlers({
    canvasWidth: canvasSize.width,
    canvasHeight: canvasSize.height,
    layers: canvas.layers,
    activeLayerId: canvas.activeLayerId,
    canUndo: canvas.canUndo,
    toolState: tool.toolState,
    stabilization: stabilization.stabilization,
    setLayers: canvas.setLayers,
    clearHistory: canvas.clearHistory,
    setSizeDirectly: canvasSize.setSizeDirectly,
    setToolType: tool.setToolType,
    setFullToolState: tool.setFullState,
    setStabilization: stabilization.setStabilization,
  })

  // ツール関連のハンドラ
  const toolHandlers = useToolHandlers({ tool })

  // 選択関連のハンドラ
  const selectionHandlers = useSelectionHandlers({
    selection,
    layers: canvas.layers,
    activeLayerId: canvas.activeLayerId,
    canvasWidth: canvasSize.width,
    canvasHeight: canvasSize.height,
    penColor: tool.penConfig.color,
    brushColor: tool.brushConfig.color,
    currentToolType: tool.currentType,
    setDrawablesToLayer: canvas.setDrawablesToLayer,
    replaceLayerDrawables: canvas.replaceLayerDrawables,
    addDrawable: canvas.addDrawable,
    recordCanvasResize: canvas.recordCanvasResize,
    translateAllLayers: canvas.translateAllLayers,
    setSizeDirectly: canvasSize.setSizeDirectly,
    setToolType: tool.setToolType,
    setSelectionToolType: selection.setToolType,
  })

  // 変形関連のハンドラ
  const transformHandlers = useTransformHandlers({
    selection,
    transform,
    layers: canvas.layers,
    canvasWidth: canvasSize.width,
    canvasHeight: canvasSize.height,
    replaceLayerDrawables: canvas.replaceLayerDrawables,
    setDrawablesToLayer: canvas.setDrawablesToLayer,
    undo: canvas.undo,
  })

  /**
   * 画像インポート時のハンドラ
   * 新しいレイヤーを作成し、画像を追加して画像範囲を選択する
   */
  const handleImportImage = useCallback(
    (drawable: ImageDrawable) => {
      // 新しいレイヤーを作成（自動的にアクティブになる）
      const { layerId } = canvas.addLayer()
      // 新しいレイヤーに画像を追加
      canvas.addDrawable(drawable)
      // 画像範囲を選択
      selection.selectAll(
        {
          x: drawable.x,
          y: drawable.y,
          width: drawable.width,
          height: drawable.height,
        },
        layerId
      )
    },
    [canvas, selection]
  )

  // 画像インポート
  const importImage = useImportImage({
    canvasWidth: canvasSize.width,
    canvasHeight: canvasSize.height,
    onImport: handleImportImage,
    onError: () => {
      toast.error(t('import.invalidFileType'))
    },
  })

  // ページを離れる前に確認ダイアログを表示
  useBeforeUnload()

  // アクティブレイヤーが非表示かどうかをチェック
  const isActiveLayerHidden = useMemo(() => {
    const activeLayer = canvas.layers.find((l) => l.id === canvas.activeLayerId)
    return activeLayer ? !activeLayer.isVisible : false
  }, [canvas.layers, canvas.activeLayerId])

  // 非表示レイヤーで操作しようとした時のトースト表示
  const handleHiddenLayerInteraction = useCallback(() => {
    toast.warning(t('messages.hiddenLayerCannotOperate'))
  }, [t])

  /**
   * 画像保存ボタンのハンドラ（ダイアログを開く）
   */
  const handleOpenSaveImageDialog = useCallback(() => {
    setSaveImageDialogOpen(true)
  }, [])

  /**
   * 画像保存ダイアログで保存を確定した時のハンドラ
   */
  const handleSaveImage = useCallback(
    async (options: ExportOptions) => {
      await exportImage.saveImage(options, canvas.showBackgroundLayer, canvas.hideBackgroundLayer)
    },
    [exportImage, canvas.showBackgroundLayer, canvas.hideBackgroundLayer]
  )

  /**
   * 変形をキャンセルするハンドラ（選択解除も含む）
   */
  const handleCancelTransformOrDeselect = useCallback(() => {
    if (transform.isTransforming) {
      transformHandlers.handleCancelTransform()
    } else {
      selectionHandlers.handleDeselect()
    }
  }, [transform.isTransforming, transformHandlers, selectionHandlers])

  // キーボードショートカット
  useKeyboardShortcuts({
    onUndo: canvas.undo,
    onRedo: canvas.redo,
    onClear: canvas.clear,
    onSelectPen: () => tool.setToolType('pen'),
    onSelectBrush: () => tool.setToolType('brush'),
    onSelectBlur: () => tool.setToolType('blur'),
    onSelectEraser: () => tool.setToolType('eraser'),
    onSelectHand: () => tool.setToolType('hand'),
    onSelectEyedropper: () => tool.setToolType('eyedropper'),
    onSelectRectangle: selectionHandlers.handleSelectRectangle,
    onSelectLasso: selectionHandlers.handleSelectLasso,
    onSelectAll: selectionHandlers.handleSelectAll,
    onDeselect: selectionHandlers.handleDeselect,
    onDeleteSelection: selectionHandlers.handleDeleteSelection,
    onCopySelection: selectionHandlers.handleCopySelection,
    onCutSelection: selectionHandlers.handleCutSelection,
    onPasteSelection: selectionHandlers.handlePasteSelection,
    onFillSelection: selectionHandlers.handleFillSelection,
    onTransform: transformHandlers.handleTransformShortcut,
    onConfirmTransform: transformHandlers.handleConfirmTransform,
    onCancelTransform: handleCancelTransformOrDeselect,
    onZoomIn: zoom.zoomIn,
    onZoomOut: zoom.zoomOut,
    onZoomReset: zoom.resetZoom,
    onFlipHorizontal: () => canvas.flipHorizontal(canvasSize.width),
    onFlipVertical: () => canvas.flipVertical(canvasSize.height),
    onMoveLayerUp: () => canvas.moveLayerUp(canvas.activeLayerId),
    onMoveLayerDown: () => canvas.moveLayerDown(canvas.activeLayerId),
    onMergeLayerDown: () =>
      canvas.mergeLayerDown(canvas.activeLayerId, canvasSize.width, canvasSize.height),
    onIncreaseToolSize: toolHandlers.handleIncreaseToolSize,
    onDecreaseToolSize: toolHandlers.handleDecreaseToolSize,
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
            onNewCanvas={projectHandlers.handleOpenNewCanvasDialog}
            projectInputRef={projectHandlers.projectInputRef}
            onOpenProject={projectHandlers.handleOpenProjectFilePicker}
            onProjectFileChange={projectHandlers.handleProjectFileChange}
            onSaveProject={projectHandlers.handleSaveProject}
            importInputRef={importImage.inputRef}
            onImport={importImage.openFilePicker}
            onImportFileChange={importImage.handleFileChange}
            onExport={handleOpenSaveImageDialog}
            isCanvasCreated={projectHandlers.isCanvasCreated}
            canUndo={canvas.canUndo}
            canRedo={canvas.canRedo}
            onUndo={canvas.undo}
            onRedo={canvas.redo}
            onClear={canvas.clear}
            onFlipHorizontal={() => canvas.flipHorizontal(canvasSize.width)}
            onFlipVertical={() => canvas.flipVertical(canvasSize.height)}
            onCanvasSize={() => setCanvasResizeOpen(true)}
            hasSelection={selection.state.region !== null}
            isRectangleSelection={selection.state.region?.shape.type === 'rectangle'}
            hasClipboard={selection.state.clipboard !== null}
            onSelectAll={selectionHandlers.handleSelectAll}
            onDeselect={selectionHandlers.handleDeselect}
            onCut={selectionHandlers.handleCutSelection}
            onCopy={selectionHandlers.handleCopySelection}
            onPaste={selectionHandlers.handlePasteSelection}
            onDelete={selectionHandlers.handleDeleteSelection}
            onFillSelection={selectionHandlers.handleFillSelection}
            onCropToSelection={selectionHandlers.handleCropToSelection}
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
          <ColorWheel color={toolHandlers.currentColor} onChange={toolHandlers.handleColorChange} />
          <HardnessSlider
            hardness={toolHandlers.currentHardness}
            onHardnessChange={toolHandlers.handleHardnessChange}
            isBlurEnabled={toolHandlers.currentBlurEnabled}
            onBlurEnabledChange={toolHandlers.handleBlurEnabledChange}
            disabled={toolHandlers.isHardnessDisabled}
          />
          <PenTool
            isActive={tool.currentType === 'pen'}
            width={tool.penConfig.width}
            opacity={tool.penConfig.opacity}
            onSelect={toolHandlers.handleSelectPen}
            onWidthChange={tool.setPenWidth}
            onOpacityChange={tool.setPenOpacity}
          />
          <BrushTool
            isActive={tool.currentType === 'brush'}
            width={tool.brushConfig.width}
            opacity={tool.brushConfig.opacity}
            onSelect={toolHandlers.handleSelectBrush}
            onWidthChange={tool.setBrushWidth}
            onOpacityChange={tool.setBrushOpacity}
          />
          <BlurTool
            isActive={tool.currentType === 'blur'}
            width={tool.blurConfig.width}
            opacity={tool.blurConfig.opacity}
            onSelect={toolHandlers.handleSelectBlur}
            onWidthChange={tool.setBlurWidth}
            onOpacityChange={tool.setBlurOpacity}
          />
          <EraserTool
            isActive={tool.currentType === 'eraser'}
            width={tool.eraserConfig.width}
            opacity={tool.eraserConfig.opacity}
            onSelect={toolHandlers.handleSelectEraser}
            onWidthChange={tool.setEraserWidth}
            onOpacityChange={tool.setEraserOpacity}
          />
          <SelectionToolButton
            toolType="select-rectangle"
            isActive={tool.currentType === 'select-rectangle'}
            onSelect={selectionHandlers.handleSelectRectangle}
          />
          <SelectionToolButton
            toolType="select-lasso"
            isActive={tool.currentType === 'select-lasso'}
            onSelect={selectionHandlers.handleSelectLasso}
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
            onLayerMergeDown={(id) =>
              canvas.mergeLayerDown(id, canvasSize.width, canvasSize.height)
            }
            canMergeLayerDown={canvas.canMergeLayerDown}
          />
        </ToolPanel>

        {/* Canvas area */}
        <main className="flex-1 overflow-hidden bg-[rgb(220,220,220)] dark:bg-muted/30">
          {projectHandlers.isCanvasCreated ? (
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
                  isRectangleSelection={selection.state.region?.shape.type === 'rectangle'}
                  hasClipboard={selection.state.clipboard !== null}
                  onCut={selectionHandlers.handleCutSelection}
                  onCopy={selectionHandlers.handleCopySelection}
                  onPaste={selectionHandlers.handlePasteSelection}
                  onDelete={selectionHandlers.handleDeleteSelection}
                  onDeselect={selectionHandlers.handleDeselect}
                  onSelectAll={selectionHandlers.handleSelectAll}
                  onFillSelection={selectionHandlers.handleFillSelection}
                  onCropToSelection={selectionHandlers.handleCropToSelection}
                  onFreeTransform={transformHandlers.handleFreeTransform}
                  onScaleTransform={transformHandlers.handleScaleTransform}
                  onRotateTransform={transformHandlers.handleRotateTransform}
                  showContextMenu={
                    tool.currentType === 'select-rectangle' || tool.currentType === 'select-lasso'
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
                      onPickColor={toolHandlers.handleColorChange}
                      zoom={zoom.zoom}
                      viewportSize={viewportSize}
                      onZoomAtPoint={handleZoomAtPoint}
                      selectionRegion={selection.state.region}
                      selectionPoints={selection.selectionPoints}
                      selectionToolType={selection.state.toolConfig.type}
                      isSelecting={selection.state.phase === 'selecting'}
                      isMoving={selection.state.phase === 'moving'}
                      onStartSelection={selectionHandlers.handleStartSelection}
                      onUpdateSelection={selection.updateSelection}
                      onCommitSelection={selection.commitSelection}
                      onStartMove={selectionHandlers.handleStartMove}
                      onUpdateMove={selection.updateMove}
                      onCommitMove={selectionHandlers.handleCommitMove}
                      isPointInRegion={selection.isPointInRegion}
                      isActiveLayerHidden={isActiveLayerHidden}
                      onHiddenLayerInteraction={handleHiddenLayerInteraction}
                      transformState={transform.transformState}
                      previewImageData={transform.previewImageData}
                      onStartHandleOperation={transform.startHandleOperation}
                      onUpdateTransform={transform.updateTransform}
                      onEndHandleOperation={transform.endHandleOperation}
                      detectHandleAtPoint={transform.detectHandleAtPoint}
                      onConfirmTransform={transformHandlers.handleConfirmTransform}
                      onCancelTransform={transformHandlers.handleCancelTransform}
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
        open={projectHandlers.saveDialogOpen}
        onOpenChange={projectHandlers.setSaveDialogOpen}
        onSave={projectHandlers.handleSaveProjectConfirm}
      />
      <LoadProjectErrorDialog
        open={projectHandlers.loadError !== null}
        onOpenChange={(open) => !open && projectHandlers.setLoadError(null)}
        error={projectHandlers.loadError}
      />
      <ConfirmLoadProjectDialog
        open={projectHandlers.confirmLoadDialogOpen}
        onOpenChange={projectHandlers.setConfirmLoadDialogOpen}
        onConfirm={projectHandlers.handleConfirmLoad}
      />
      <ConfirmNewCanvasDialog
        open={projectHandlers.confirmNewCanvasDialogOpen}
        onOpenChange={projectHandlers.setConfirmNewCanvasDialogOpen}
        onConfirm={projectHandlers.handleConfirmNewCanvas}
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
        open={projectHandlers.newCanvasDialogOpen}
        onOpenChange={projectHandlers.setNewCanvasDialogOpen}
        onCreate={projectHandlers.handleCreateNewCanvas}
      />
      <RecoveryDialog
        open={projectHandlers.recoveryDialogOpen}
        savedAt={recovery.savedAt}
        hasToolState={recovery.hasToolState}
        onRestore={projectHandlers.handleRecoveryRestore}
        onDiscard={projectHandlers.handleRecoveryDiscard}
      />
      <LoadToolStateDialog
        open={projectHandlers.loadToolStateDialogOpen}
        onConfirm={projectHandlers.handleLoadToolStateRestore}
        onSkip={projectHandlers.handleLoadToolStateSkip}
      />
      <ReloadPrompt />
    </div>
  )
}

export default App
