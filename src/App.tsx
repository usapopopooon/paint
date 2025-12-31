import { useCallback, useEffect, useMemo, useRef } from 'react'
import { ThemeToggle } from './components/ui/ThemeToggle'
import {
  Canvas,
  CanvasResizeMenu,
  CanvasViewport,
  useCanvas,
  useCanvasSize,
  useCanvasOffset,
} from './features/canvas'
import { ColorWheel } from './features/color'
import type { Point } from './features/drawable'
import { LocaleToggle } from './features/i18n'
import {
  Toolbar,
  UndoButton,
  RedoButton,
  ClearButton,
  ToolbarDivider,
  HandButton,
  EyedropperButton,
  CenterCanvasButton,
} from './features/toolbar'
import { useTool, ToolPanel, PenTool, BrushTool, EraserTool, LayerPanel } from './features/tools'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'

/**
 * ペイントアプリケーションのメインコンポーネント
 */
function App() {
  // canvasSizeのsetSizeDirectlyをrefで保持（循環依存を避けるため）
  const setSizeDirectlyRef = useRef<(width: number, height: number) => void>(() => {})

  // キャンバスリサイズundo/redo時のコールバック
  const handleCanvasResize = useCallback((width: number, height: number) => {
    setSizeDirectlyRef.current(width, height)
  }, [])

  const canvasOptions = useMemo(
    () => ({ onCanvasResize: handleCanvasResize }),
    [handleCanvasResize]
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
  const tool = useTool()

  // キーボードショートカット
  useKeyboardShortcuts({
    onUndo: canvas.undo,
    onRedo: canvas.redo,
    onClear: canvas.clear,
    onSelectPen: () => tool.setToolType('pen'),
    onSelectEraser: () => tool.setToolType('eraser'),
    onSelectHand: () => tool.setToolType('hand'),
    onSelectEyedropper: () => tool.setToolType('eyedropper'),
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
          <PenTool
            isActive={tool.currentType === 'pen'}
            width={tool.penConfig.width}
            onSelect={handleSelectPen}
            onWidthChange={tool.setPenWidth}
          />
          <BrushTool
            isActive={tool.currentType === 'brush'}
            width={tool.brushConfig.width}
            onSelect={handleSelectBrush}
            onWidthChange={tool.setBrushWidth}
          />
          <EraserTool
            isActive={tool.currentType === 'eraser'}
            width={tool.eraserConfig.width}
            onSelect={handleSelectEraser}
            onWidthChange={tool.setEraserWidth}
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
          >
            <Canvas
              layers={canvas.layers}
              onStartStroke={handleStartStroke}
              onAddPoint={canvas.addPoint}
              onEndStroke={canvas.endStroke}
              onWheel={tool.adjustBrushSize}
              cursor={tool.cursor}
              width={canvasSize.width}
              height={canvasSize.height}
              toolType={tool.currentType}
              offset={canvasOffset.offset}
              onPan={canvasOffset.pan}
              onPickColor={handleColorChange}
            />
          </CanvasViewport>
        </main>
      </div>
    </div>
  )
}

export default App
