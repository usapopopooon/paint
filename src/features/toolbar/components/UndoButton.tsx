import { memo } from 'react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { TranslationKey } from '@/features/i18n'

type UndoButtonProps = {
  readonly disabled: boolean
  readonly onClick: () => void
  readonly t: (key: TranslationKey) => string
}

export const UndoButton = memo(function UndoButton({ disabled, onClick, t }: UndoButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-block">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClick}
            disabled={disabled}
            className="w-20"
          >
            {t('actions.undo')}
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>
        {disabled ? t('messages.noUndoHistory') : t('shortcuts.undo')}
      </TooltipContent>
    </Tooltip>
  )
})
