import { Eraser, Pencil } from 'lucide-react'
import { useEffect } from 'react'
import { LocaleToggle } from './components/ui/LocaleToggle'
import { ThemeToggle } from './components/ui/ThemeToggle'
import { Button } from './components/ui/button'
import { Slider } from './components/ui/slider'
import { Tooltip, TooltipContent, TooltipTrigger } from './components/ui/tooltip'
import { Canvas, useCanvas } from './features/canvas'
import { ColorWheel } from './features/color'
import { Toolbar } from './features/toolbar'
import { useLocale } from './hooks/useLocale'
import { useTheme } from './hooks/useTheme'

const MIN_PEN_WIDTH = 1
const MAX_PEN_WIDTH = 300
const MIN_ERASER_WIDTH = 5
const MAX_ERASER_WIDTH = 300

// Logarithmic scale conversion for smoother control of small values
const valueToSlider = (value: number, min: number, max: number): number => {
  const minLog = Math.log(min)
  const maxLog = Math.log(max)
  return ((Math.log(value) - minLog) / (maxLog - minLog)) * 100
}

const sliderToValue = (slider: number, min: number, max: number): number => {
  const minLog = Math.log(min)
  const maxLog = Math.log(max)
  const value = Math.exp(minLog + (slider / 100) * (maxLog - minLog))
  return Math.round(value)
}

function App() {
  const canvas = useCanvas()
  const { isDark, toggleTheme } = useTheme()
  const { locale, toggleLocale, t } = useLocale()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault()
        if (e.shiftKey) {
          canvas.redo()
        } else {
          canvas.undo()
        }
      }
      if (e.shiftKey && e.key === 'Delete') {
        e.preventDefault()
        canvas.clear()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [canvas])

  const handlePenWidthChange = (values: number[]) => {
    const sliderValue = values[0]
    if (sliderValue !== undefined) {
      const width = sliderToValue(sliderValue, MIN_PEN_WIDTH, MAX_PEN_WIDTH)
      canvas.setStrokeWidth(width)
    }
  }

  const handleEraserWidthChange = (values: number[]) => {
    const sliderValue = values[0]
    if (sliderValue !== undefined) {
      const width = sliderToValue(sliderValue, MIN_ERASER_WIDTH, MAX_ERASER_WIDTH)
      canvas.setEraserWidth(width)
    }
  }

  const currentWidth = canvas.tool === 'eraser' ? canvas.eraserWidth : canvas.strokeWidth
  const currentColor = canvas.tool === 'eraser' ? '#ffffff' : canvas.strokeColor

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
        {/* Left sidebar */}
        <aside className="w-[232px] p-4 border-r border-zinc-300 dark:border-border bg-zinc-200 dark:bg-background flex flex-col gap-6">
          {/* Color picker */}
          <ColorWheel
            color={canvas.strokeColor}
            onChange={canvas.setStrokeColor}
            t={t}
          />

          {/* Pen tool */}
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={canvas.tool === 'pen' ? 'default' : 'secondary'}
                  size="sm"
                  onClick={() => canvas.setTool('pen')}
                  aria-label={t('pen')}
                >
                  <Pencil className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">{t('pen')}</TooltipContent>
            </Tooltip>
            <div className="flex-1 flex items-center gap-2">
              <Slider
                value={[valueToSlider(canvas.strokeWidth, MIN_PEN_WIDTH, MAX_PEN_WIDTH)]}
                onValueChange={handlePenWidthChange}
                min={0}
                max={100}
                step={0.1}
              />
              <span className="text-sm font-mono text-foreground w-8 text-right">
                {canvas.strokeWidth}
              </span>
            </div>
          </div>

          {/* Eraser tool */}
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={canvas.tool === 'eraser' ? 'default' : 'secondary'}
                  size="sm"
                  onClick={() => canvas.setTool('eraser')}
                  aria-label={t('eraser')}
                >
                  <Eraser className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">{t('eraser')}</TooltipContent>
            </Tooltip>
            <div className="flex-1 flex items-center gap-2">
              <Slider
                value={[valueToSlider(canvas.eraserWidth, MIN_ERASER_WIDTH, MAX_ERASER_WIDTH)]}
                onValueChange={handleEraserWidthChange}
                min={0}
                max={100}
                step={0.1}
              />
              <span className="text-sm font-mono text-foreground w-8 text-right">
                {canvas.eraserWidth}
              </span>
            </div>
          </div>
        </aside>

        {/* Canvas area */}
        <main className="flex-1 overflow-hidden bg-muted/30">
          <Canvas
            strokes={canvas.strokes}
            onStartStroke={canvas.startStroke}
            onAddPoint={canvas.addPoint}
            onEndStroke={canvas.endStroke}
            strokeWidth={currentWidth}
            strokeColor={currentColor}
            isEraser={canvas.tool === 'eraser'}
            fillContainer
          />
        </main>
      </div>
    </div>
  )
}

export default App
