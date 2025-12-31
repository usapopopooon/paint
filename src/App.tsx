import { useCallback, useEffect, useMemo, useRef } from 'react'
import { toast } from 'sonner'
import { Toaster } from './components/ui/sonner'
import { ThemeToggle } from './components/ui/ThemeToggle'
import { DISPLAY_SCALE } from './constants/display'
import {
  Canvas,
  CanvasResizeMenu,
  CanvasViewport,
  useCanvas,
  useCanvasSize,
  useCanvasOffset,
  useCanvasZoom,
} from './features/canvas'
import { ColorWheel } from './features/color'
import type { Point } from './features/drawable'
import { SaveButton, useExportImage } from './features/export'
import { useLocale, LocaleToggle } from './features/i18n'
import { ImportButton, useImportImage } from './features/import'
import {
  Toolbar,
  UndoButton,
  RedoButton,
  ClearButton,
  ToolbarDivider,
  HandButton,
  EyedropperButton,
  CenterCanvasButton,
  ZoomInButton,
  ZoomOutButton,
  ZoomResetButton,
  ZoomDisplay,
  FlipHorizontalButton,
} from './features/toolbar'
import {
  useTool,
  ToolPanel,
  PenTool,
  BrushTool,
  EraserTool,
  LayerPanel,
  HardnessSlider,
} from './features/tools'
import { StabilizationSlider, useStabilization } from './features/stabilization'
import { useKeyboardShortcuts, useBeforeUnload } from './hooks'

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
  const canvasZoom = useCanvasZoom()
  const tool = useTool()
  const exportImage = useExportImage(canvasContainerRef)
  const { t } = useLocale()

  // 画像インポート（canvasSizeは内部座標系なのでUI座標系に変換）
  const importImage = useImportImage({
    canvasWidth: canvasSize.width * DISPLAY_SCALE,
    canvasHeight: canvasSize.height * DISPLAY_SCALE,
    onImport: canvas.addDrawable,
    onError: () => {
      toast.error(t('import.invalidFileType'))
    },
  })

  // ページを離れる前に確認ダイアログを表示
  useBeforeUnload()

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
    onZoomIn: canvasZoom.zoomIn,
    onZoomOut: canvasZoom.zoomOut,
    onZoomReset: canvasZoom.resetZoom,
    onFlipHorizontal: () => canvas.flipHorizontal(canvasSize.width),
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
   * 現在選択中のツールのhardnessを変更
   */
  const handleHardnessChange = useCallback(
    (hardness: number) => {
      if (tool.currentType === 'pen') {
        tool.setPenHardness(hardness)
      } else if (tool.currentType === 'brush') {
        tool.setBrushHardness(hardness)
      } else if (tool.currentType === 'eraser') {
        tool.setEraserHardness(hardness)
      }
    },
    [tool]
  )

  /**
   * hardnessスライダーが無効かどうか（ペン、ブラシ、消しゴム以外）
   */
  const isHardnessDisabled = !['pen', 'brush', 'eraser'].includes(tool.currentType)

  return (
    <div className="h-screen flex flex-col">
      {/* Top toolbar */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100">
        <Toolbar>
          <UndoButton disabled={!canvas.canUndo} onClick={canvas.undo} />
          <RedoButton disabled={!canvas.canRedo} onClick={canvas.redo} />
          <ToolbarDivider />
          <HandButton
            isActive={tool.currentType === 'hand'}
            onClick={() => tool.setToolType('hand')}
          />
          <CenterCanvasButton onClick={canvasOffset.reset} />
          <ToolbarDivider />
          <ZoomInButton onClick={canvasZoom.zoomIn} />
          <ZoomOutButton onClick={canvasZoom.zoomOut} />
          <ZoomResetButton onClick={canvasZoom.resetZoom} />
          <ZoomDisplay
            zoomPercent={canvasZoom.zoomPercent}
            onZoomChange={canvasZoom.setZoomLevel}
          />
          <ToolbarDivider />
          <StabilizationSlider
            stabilization={stabilization.stabilization}
            onStabilizationChange={stabilization.setStabilization}
          />
          <ToolbarDivider />
          <ClearButton onClick={canvas.clear} />
          <EyedropperButton
            isActive={tool.currentType === 'eyedropper'}
            onClick={() => tool.setToolType('eyedropper')}
          />
          <CanvasResizeMenu
            width={canvasSize.width}
            height={canvasSize.height}
            anchor={canvasSize.anchor}
            onWidthChange={canvasSize.setWidth}
            onHeightChange={canvasSize.setHeight}
            onAnchorChange={canvasSize.setAnchor}
          />
          <FlipHorizontalButton onClick={() => canvas.flipHorizontal(canvasSize.width)} />
          <ToolbarDivider />
          <ImportButton
            inputRef={importImage.inputRef}
            onOpenFilePicker={importImage.openFilePicker}
            onFileChange={importImage.handleFileChange}
          />
          <SaveButton
            onSave={() =>
              exportImage.downloadAsJpg(canvas.showBackgroundLayer, canvas.hideBackgroundLayer)
            }
          />
        </Toolbar>
        <div className="flex items-center gap-1">
          <LocaleToggle />
          <ThemeToggle />
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 min-h-0">
        <ToolPanel>
          <ColorWheel color={currentColor} onChange={handleColorChange} />
          <HardnessSlider
            hardness={currentHardness}
            onHardnessChange={handleHardnessChange}
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
          <LayerPanel
            layers={canvas.layers}
            activeLayerId={canvas.activeLayerId}
            onLayerSelect={canvas.setActiveLayer}
            onLayerVisibilityChange={canvas.setLayerVisibility}
          />
        </ToolPanel>

        {/* Canvas area */}
        <main className="flex-1 overflow-hidden bg-[rgb(220,220,220)] dark:bg-muted/30">
          <CanvasViewport
            canvasWidth={canvasSize.width}
            canvasHeight={canvasSize.height}
            offset={canvasOffset.offset}
            onOffsetChange={canvasOffset.setPosition}
            zoom={canvasZoom.zoom}
            onWheel={canvasZoom.handleWheel}
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
                zoom={canvasZoom.zoom}
              />
            </div>
          </CanvasViewport>
        </main>
      </div>
      <Toaster />
    </div>
  )
}

export default App
