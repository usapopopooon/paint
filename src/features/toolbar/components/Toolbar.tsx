import { Button } from '@/components/ui/button'
import type { TranslationKey } from '@/hooks/useLocale'

type ToolbarProps = {
  readonly canUndo: boolean
  readonly canRedo: boolean
  readonly onUndo: () => void
  readonly onRedo: () => void
  readonly onClear: () => void
  readonly t: (key: TranslationKey) => string
}

export const Toolbar = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClear,
  t,
}: ToolbarProps) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={onUndo}
        disabled={!canUndo}
      >
        {t('undo')}
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={onRedo}
        disabled={!canRedo}
      >
        {t('redo')}
      </Button>
      <div className="h-6 w-px bg-border" />
      <Button variant="outline" size="sm" onClick={onClear} className="text-foreground">
        {t('clear')}
      </Button>
    </div>
  )
}
