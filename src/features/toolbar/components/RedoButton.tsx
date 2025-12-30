import { memo } from 'react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { TranslationKey } from '@/features/i18n'

type RedoButtonProps = {
  readonly disabled: boolean
  readonly onClick: () => void
  readonly t: (key: TranslationKey) => string
}

export const RedoButton = memo(function RedoButton({ disabled, onClick, t }: RedoButtonProps) {
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
            {t('actions.redo')}
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>
        {disabled ? t('messages.noRedoHistory') : t('shortcuts.redo')}
      </TooltipContent>
    </Tooltip>
  )
})
