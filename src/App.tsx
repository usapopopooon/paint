import { Canvas, Toolbar, useCanvas } from './features/canvas'

function App() {
  const canvas = useCanvas()

  return (
    <div className="dark min-h-screen bg-background flex flex-col items-center justify-center gap-6 p-8">
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
