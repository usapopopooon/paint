import { memo } from 'react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useLocale } from '@/features/i18n'

type UndoButtonProps = {
  readonly disabled: boolean
  readonly onClick: () => void
}

export const UndoButton = memo(function UndoButton({ disabled, onClick }: UndoButtonProps) {
  const { t } = useLocale()
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
