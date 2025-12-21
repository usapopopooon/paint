import { Button } from '@/components/ui/button'

type ToolbarProps = {
  readonly canUndo: boolean
  readonly canRedo: boolean
  readonly onUndo: () => void
  readonly onRedo: () => void
  readonly onClear: () => void
}

export const Toolbar = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClear,
}: ToolbarProps) => {
  return (
    <div className="flex items-center gap-2">
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
      <div className="h-6 w-px bg-border" />
      <Button variant="outline" size="sm" onClick={onClear} className="text-foreground">
        Clear
      </Button>
    </div>
  )
}
