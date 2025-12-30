import { useCallback } from 'react'
import { ThemeToggle } from './components/ui/ThemeToggle'
import { Canvas, CanvasSizeInput, useCanvas, useCanvasSize } from './features/canvas'
import { ColorWheel } from './features/color'
import type { Point } from './features/drawable'
import { LocaleToggle } from './features/i18n'
import { Toolbar, UndoButton, RedoButton, ClearButton, ToolbarDivider } from './features/toolbar'
import { useTool, ToolPanel, PenTool, EraserTool, LayerPanel } from './features/tools'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'

/**
 * ペイントアプリケーションのメインコンポーネント
 */
function App() {
  const canvas = useCanvas()
  const canvasSize = useCanvasSize(canvas.translateAllLayers)
  const tool = useTool()

  // キーボードショートカット
  useKeyboardShortcuts({
    onUndo: canvas.undo,
    onRedo: canvas.redo,
    onClear: canvas.clear,
    onSelectPen: () => tool.setToolType('pen'),
    onSelectEraser: () => tool.setToolType('eraser'),
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

  const handleSelectEraser = useCallback(() => {
    tool.setToolType('eraser')
  }, [tool])

  return (
    <div className="h-screen flex flex-col">
      {/* Top toolbar */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-zinc-300 dark:border-border bg-zinc-200 dark:bg-background">
        <Toolbar>
          <UndoButton disabled={!canvas.canUndo} onClick={canvas.undo} />
          <RedoButton disabled={!canvas.canRedo} onClick={canvas.redo} />
          <ToolbarDivider />
          <ClearButton onClick={canvas.clear} />
        </Toolbar>
        <CanvasSizeInput
          width={canvasSize.width}
          height={canvasSize.height}
          onWidthChange={canvasSize.setWidth}
          onHeightChange={canvasSize.setHeight}
        />
        <div className="flex items-center gap-1">
          <LocaleToggle />
          <ThemeToggle />
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 min-h-0">
        <ToolPanel>
          <ColorWheel color={tool.penConfig.color} onChange={tool.setPenColor} />
          <PenTool
            isActive={tool.currentType === 'pen'}
            width={tool.penConfig.width}
            onSelect={handleSelectPen}
            onWidthChange={tool.setPenWidth}
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
        <main className="flex-1 overflow-auto bg-muted/30 flex items-center justify-center p-4">
          <Canvas
            layers={canvas.layers}
            onStartStroke={handleStartStroke}
            onAddPoint={canvas.addPoint}
            onEndStroke={canvas.endStroke}
            onWheel={tool.adjustBrushSize}
            cursor={tool.cursor}
            width={canvasSize.width}
            height={canvasSize.height}
          />
        </main>
      </div>
    </div>
  )
}

export default App
