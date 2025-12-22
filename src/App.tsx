import { useCallback, useMemo } from 'react'
import { ThemeToggle } from './components/ui/ThemeToggle'
import { Canvas, useCanvas } from './features/canvas'
import type { Point } from './features/drawable'
import { LocaleToggle, useLocale } from './features/i18n'
import { Toolbar } from './features/toolbar'
import { useTool, ToolPanel } from './features/tools'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useTheme } from './hooks/useTheme'
import { valueToSlider, sliderToValue } from './lib/slider'

const MIN_PEN_WIDTH = 1
const MAX_PEN_WIDTH = 300
const MIN_ERASER_WIDTH = 5
const MAX_ERASER_WIDTH = 300

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
  })

  // ホイールでブラシサイズ変更
  const handleWheel = useCallback(
    (deltaY: number) => {
      const step = deltaY > 0 ? -5 : 5
      if (tool.currentType === 'pen') {
        const currentSlider = valueToSlider(tool.penConfig.width, MIN_PEN_WIDTH, MAX_PEN_WIDTH)
        const newSlider = Math.max(0, Math.min(100, currentSlider + step))
        const newWidth = sliderToValue(newSlider, MIN_PEN_WIDTH, MAX_PEN_WIDTH)
        tool.setPenWidth(newWidth)
      } else {
        const currentSlider = valueToSlider(tool.eraserConfig.width, MIN_ERASER_WIDTH, MAX_ERASER_WIDTH)
        const newSlider = Math.max(0, Math.min(100, currentSlider + step))
        const newWidth = sliderToValue(newSlider, MIN_ERASER_WIDTH, MAX_ERASER_WIDTH)
        tool.setEraserWidth(newWidth)
      }
    },
    [tool]
  )

  const handleStartStroke = useCallback(
    (point: Point) => {
      canvas.startStroke(point, tool.currentConfig)
    },
    [canvas, tool.currentConfig]
  )

  const cursor = useMemo(() => tool.getCursor('#ffffff'), [tool])

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
          t={t}
        />

        {/* Canvas area */}
        <main className="flex-1 overflow-hidden bg-muted/30">
          <Canvas
            layers={canvas.layers}
            onStartStroke={handleStartStroke}
            onAddPoint={canvas.addPoint}
            onEndStroke={canvas.endStroke}
            onWheel={handleWheel}
            cursor={cursor}
            fillContainer
          />
        </main>
      </div>
    </div>
  )
}

export default App
