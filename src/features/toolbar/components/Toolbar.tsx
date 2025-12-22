import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { TranslationKey } from '@/features/i18n'

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
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-block">
            <Button
              variant="secondary"
              size="sm"
              onClick={onUndo}
              disabled={!canUndo}
              className="w-20"
            >
              {t('undo')}
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          {canUndo ? t('undoShortcut') : t('noUndoHistory')}
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-block">
            <Button
              variant="secondary"
              size="sm"
              onClick={onRedo}
              disabled={!canRedo}
              className="w-20"
            >
              {t('redo')}
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          {canRedo ? t('redoShortcut') : t('noRedoHistory')}
        </TooltipContent>
      </Tooltip>
      <div className="h-6 w-px bg-border" />
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="sm" onClick={onClear} className="w-16 text-foreground">
            {t('clear')}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t('clearShortcut')}</TooltipContent>
      </Tooltip>
    </div>
  )
}
