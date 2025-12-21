import { ColorPicker } from '@/components/ColorPicker'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'

type ToolbarProps = {
  readonly strokeWidth: number
  readonly strokeColor: string
  readonly onStrokeWidthChange: (width: number) => void
  readonly onStrokeColorChange: (color: string) => void
  readonly canUndo: boolean
  readonly canRedo: boolean
  readonly onUndo: () => void
  readonly onRedo: () => void
  readonly onClear: () => void
}

const MIN_WIDTH = 1
const MAX_WIDTH = 20

export const Toolbar = ({
  strokeWidth,
  strokeColor,
  onStrokeWidthChange,
  onStrokeColorChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClear,
}: ToolbarProps) => {
  const handleSliderChange = (values: number[]) => {
    const value = values[0]
    if (value !== undefined) {
      onStrokeWidthChange(value)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Color:</span>
        <ColorPicker color={strokeColor} onChange={onStrokeColorChange} />
      </div>

      <div className="h-6 w-px bg-border" />

      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Width:</span>
        <Slider
          value={[strokeWidth]}
          onValueChange={handleSliderChange}
          min={MIN_WIDTH}
          max={MAX_WIDTH}
          step={1}
          className="w-32"
        />
        <span className="w-6 text-sm text-foreground">{strokeWidth}</span>
      </div>

      <div className="h-6 w-px bg-border" />

      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={onUndo}
          disabled={!canUndo}
        >
          Undo
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={onRedo}
          disabled={!canRedo}
        >
          Redo
        </Button>
      </div>

      <div className="h-6 w-px bg-border" />

      <Button variant="outline" size="sm" onClick={onClear} className="text-foreground">
        Clear
      </Button>
    </div>
  )
}
