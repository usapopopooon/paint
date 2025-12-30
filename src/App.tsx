import { useCallback } from 'react'
import { ThemeToggle } from './components/ui/ThemeToggle'
import { Canvas, useCanvas } from './features/canvas'
import type { Point } from './features/drawable'
import { LocaleToggle, useLocale } from './features/i18n'
import { Toolbar } from './features/toolbar'
import { useTool, ToolPanel } from './features/tools'
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

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Top toolbar */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-zinc-300 dark:border-border bg-zinc-200 dark:bg-background">
        <Toolbar
          canUndo={canvas.canUndo}
          canRedo={canvas.canRedo}
          onUndo={canvas.undo}
          onRedo={canvas.redo}
          onClear={canvas.clear}
          t={t}
        />
        <div className="flex items-center gap-1">
          <LocaleToggle locale={locale} onToggle={toggleLocale} t={t} />
          <ThemeToggle isDark={isDark} onToggle={toggleTheme} t={t} />
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        <ToolPanel
          currentType={tool.currentType}
          penConfig={tool.penConfig}
          eraserConfig={tool.eraserConfig}
          onToolTypeChange={tool.setToolType}
          onPenWidthChange={tool.setPenWidth}
          onPenColorChange={tool.setPenColor}
          onEraserWidthChange={tool.setEraserWidth}
          layers={canvas.layers}
          activeLayerId={canvas.activeLayerId}
          onLayerSelect={canvas.setActiveLayer}
          onLayerVisibilityChange={canvas.setLayerVisibility}
          t={t}
        />

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
