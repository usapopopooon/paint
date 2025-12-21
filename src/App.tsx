import { ThemeToggle } from './components/ThemeToggle'
import { Canvas, Toolbar, useCanvas } from './features/canvas'
import { useTheme } from './hooks/useTheme'

function App() {
  const canvas = useCanvas()
  const { isDark, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 p-8">
      <div className="absolute top-4 right-4">
        <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
      </div>
      <h1 className="text-4xl font-bold text-foreground">Paint</h1>
      <Toolbar
        strokeWidth={canvas.strokeWidth}
        onStrokeWidthChange={canvas.setStrokeWidth}
        canUndo={canvas.canUndo}
        canRedo={canvas.canRedo}
        onUndo={canvas.undo}
        onRedo={canvas.redo}
        onClear={canvas.clear}
      />
      <Canvas
        strokes={canvas.strokes}
        onStartStroke={canvas.startStroke}
        onAddPoint={canvas.addPoint}
        onEndStroke={canvas.endStroke}
      />
    </div>
  )
}

export default App
