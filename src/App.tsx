import { useCallback, useEffect, useMemo, useRef } from 'react'
import { toast } from 'sonner'
import { Toaster } from './components/ui/sonner'
import { ThemeToggle } from './components/ui/ThemeToggle'
import { DISPLAY_SCALE } from './constants/display'
import { Canvas, CanvasViewport, useCanvas, useCanvasOffset } from './features/canvas'
import { CanvasResizeMenu, useCanvasSize } from './features/canvas-resize'
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
  FlipHorizontalButton,
} from './features/toolbar'
import { ZoomInButton, ZoomOutButton, ZoomResetButton, ZoomDisplay, useZoom } from './features/zoom'
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
import { sliderToValue, valueToSlider } from './lib/slider'
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
  const zoom = useZoom()
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

  // toolの最新状態をrefで保持（useCallbackの依存配列問題を回避）
  const toolRef = useRef(tool)
  useEffect(() => {
    toolRef.current = tool
  }, [tool])

  /**
   * 対数スケールで次の値を計算（値が変わるまでスライダー位置を増減）
   */
  const getNextLogValue = (
    currentWidth: number,
    min: number,
    max: number,
    direction: 1 | -1
  ): number => {
    let sliderPos = valueToSlider(currentWidth, min, max)
    let newWidth = currentWidth

    // 値が変わるまでスライダー位置を増減（最大10回試行）
    for (let i = 0; i < 10 && newWidth === currentWidth; i++) {
      sliderPos = direction > 0 ? Math.min(100, sliderPos + 1) : Math.max(0, sliderPos - 1)
      newWidth = sliderToValue(sliderPos, min, max)
    }

    return newWidth
  }

  /**
   * ツールサイズを1段階大きくする（対数スケール）
   */
  const handleIncreaseToolSize = useCallback(() => {
    const t = toolRef.current
    const toolType = t.currentType
    if (toolType === 'pen') {
      const newWidth = getNextLogValue(t.penConfig.width, MIN_PEN_WIDTH, MAX_PEN_WIDTH, 1)
      t.setPenWidth(newWidth)
    } else if (toolType === 'brush') {
      const newWidth = getNextLogValue(t.brushConfig.width, MIN_BRUSH_WIDTH, MAX_BRUSH_WIDTH, 1)
      t.setBrushWidth(newWidth)
    } else if (toolType === 'eraser') {
      const newWidth = getNextLogValue(t.eraserConfig.width, MIN_ERASER_WIDTH, MAX_ERASER_WIDTH, 1)
      t.setEraserWidth(newWidth)
    }
  }, [])

  /**
   * ツールサイズを1段階小さくする（対数スケール）
   */
  const handleDecreaseToolSize = useCallback(() => {
    const t = toolRef.current
    const toolType = t.currentType
    if (toolType === 'pen') {
      const newWidth = getNextLogValue(t.penConfig.width, MIN_PEN_WIDTH, MAX_PEN_WIDTH, -1)
      t.setPenWidth(newWidth)
    } else if (toolType === 'brush') {
      const newWidth = getNextLogValue(t.brushConfig.width, MIN_BRUSH_WIDTH, MAX_BRUSH_WIDTH, -1)
      t.setBrushWidth(newWidth)
    } else if (toolType === 'eraser') {
      const newWidth = getNextLogValue(t.eraserConfig.width, MIN_ERASER_WIDTH, MAX_ERASER_WIDTH, -1)
      t.setEraserWidth(newWidth)
    }
  }, [])

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
    onZoomIn: zoom.zoomIn,
    onZoomOut: zoom.zoomOut,
    onZoomReset: zoom.resetZoom,
    onFlipHorizontal: () => canvas.flipHorizontal(canvasSize.width),
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
          <ZoomInButton
            isActive={tool.currentType === 'zoom-in'}
            onClick={() => tool.setToolType('zoom-in')}
          />
          <ZoomOutButton
            isActive={tool.currentType === 'zoom-out'}
            onClick={() => tool.setToolType('zoom-out')}
          />
          <ZoomResetButton onClick={zoom.resetZoom} />
          <ZoomDisplay zoomPercent={zoom.zoomPercent} onZoomChange={zoom.setZoomLevel} />
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
            drawingLayerCount={canvas.drawingLayerCount}
            onLayerSelect={canvas.setActiveLayer}
            onLayerVisibilityChange={canvas.setLayerVisibility}
            onLayerAdd={canvas.addLayer}
            onLayerDelete={canvas.deleteLayer}
            onLayerNameChange={canvas.setLayerName}
            onLayerMove={canvas.moveLayer}
          />
        </ToolPanel>

        {/* Canvas area */}
        <main className="flex-1 overflow-hidden bg-[rgb(220,220,220)] dark:bg-muted/30">
          <CanvasViewport
            canvasWidth={canvasSize.width}
            canvasHeight={canvasSize.height}
            offset={canvasOffset.offset}
            onOffsetChange={canvasOffset.setPosition}
            zoom={zoom.zoom}
            onWheelAtPoint={handleWheelAtPoint}
          >
            {(viewportSize) => (
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
                />
              </div>
            )}
          </CanvasViewport>
        </main>
      </div>
      <Toaster />
    </div>
  )
}

export default App
