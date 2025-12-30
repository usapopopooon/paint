import { useCallback } from 'react'
import { ThemeToggle } from './components/ui/ThemeToggle'
import { Canvas, useCanvas } from './features/canvas'
import { ColorWheel } from './features/color'
import type { Point } from './features/drawable'
import { LocaleToggle, useLocale } from './features/i18n'
import { Toolbar, UndoButton, RedoButton, ClearButton, ToolbarDivider } from './features/toolbar'
import { useTool, ToolPanel, PenTool, EraserTool, LayerPanel } from './features/tools'
import { useTheme } from './features/theme'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'

/**
 * ペイントアプリケーションのメインコンポーネント
 */
function App() {
  const canvas = useCanvas()
  const tool = useTool()
  const { isDark, toggleTheme } = useTheme()
  const { locale, toggleLocale, t } = useLocale()

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
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Top toolbar */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-zinc-300 dark:border-border bg-zinc-200 dark:bg-background">
        <Toolbar>
          <UndoButton disabled={!canvas.canUndo} onClick={canvas.undo} t={t} />
          <RedoButton disabled={!canvas.canRedo} onClick={canvas.redo} t={t} />
          <ToolbarDivider />
          <ClearButton onClick={canvas.clear} t={t} />
        </Toolbar>
        <div className="flex items-center gap-1">
          <LocaleToggle locale={locale} onToggle={toggleLocale} t={t} />
          <ThemeToggle isDark={isDark} onToggle={toggleTheme} t={t} />
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        <ToolPanel>
          <ColorWheel color={tool.penConfig.color} onChange={tool.setPenColor} t={t} />
          <PenTool
            isActive={tool.currentType === 'pen'}
            width={tool.penConfig.width}
            onSelect={handleSelectPen}
            onWidthChange={tool.setPenWidth}
            t={t}
          />
          <EraserTool
            isActive={tool.currentType === 'eraser'}
            width={tool.eraserConfig.width}
            onSelect={handleSelectEraser}
            onWidthChange={tool.setEraserWidth}
            t={t}
          />
          <LayerPanel
            layers={canvas.layers}
            activeLayerId={canvas.activeLayerId}
            onLayerSelect={canvas.setActiveLayer}
            onLayerVisibilityChange={canvas.setLayerVisibility}
            t={t}
          />
        </ToolPanel>

        {/* Canvas area */}
        <main className="flex-1 overflow-hidden bg-muted/30">
          <Canvas
            layers={canvas.layers}
            onStartStroke={handleStartStroke}
            onAddPoint={canvas.addPoint}
            onEndStroke={canvas.endStroke}
            onWheel={tool.adjustBrushSize}
            cursor={tool.cursor}
            fillContainer
          />
        </main>
      </div>
    </div>
  )
}

export default App
