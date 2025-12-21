import { ColorWheel } from './components/ColorWheel'
import { ThemeToggle } from './components/ThemeToggle'
import { Slider } from './components/ui/slider'
import { Canvas, Toolbar, useCanvas } from './features/canvas'
import { useTheme } from './hooks/useTheme'

const MIN_WIDTH = 1
const MAX_WIDTH = 20

function App() {
  const canvas = useCanvas()
  const { isDark, toggleTheme } = useTheme()

  const handleSliderChange = (values: number[]) => {
    const value = values[0]
    if (value !== undefined) {
      canvas.setStrokeWidth(value)
    }
  }

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
        />
        <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <aside className="w-[232px] p-4 border-r border-zinc-300 dark:border-border bg-zinc-200 dark:bg-background flex flex-col gap-6">
          <ColorWheel
            color={canvas.strokeColor}
            onChange={canvas.setStrokeColor}
          />
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Width</span>
              <span className="text-sm font-mono text-foreground">{canvas.strokeWidth}px</span>
            </div>
            <Slider
              value={[canvas.strokeWidth]}
              onValueChange={handleSliderChange}
              min={MIN_WIDTH}
              max={MAX_WIDTH}
              step={1}
            />
          </div>
        </aside>

        {/* Canvas area */}
        <main className="flex-1 overflow-hidden bg-muted/30">
          <Canvas
            strokes={canvas.strokes}
            onStartStroke={canvas.startStroke}
            onAddPoint={canvas.addPoint}
            onEndStroke={canvas.endStroke}
            fillContainer
          />
        </main>
      </div>
    </div>
  )
}

export default App
