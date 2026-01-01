import { memo } from 'react'
import { Undo2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useTranslation } from '@/features/i18n'
import { getModifierKey } from '@/lib/platform'

type UndoButtonProps = {
  readonly disabled: boolean
  readonly onClick: () => void
}

export const UndoButton = memo(function UndoButton({ disabled, onClick }: UndoButtonProps) {
  const { t } = useTranslation()
  const modifier = getModifierKey()
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-block">
          <Button
            variant="secondary"
            size="icon"
            onClick={onClick}
            disabled={disabled}
            aria-label={t('actions.undo')}
          >
            <Undo2 className="h-4 w-4" />
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>
        {t('actions.undo')} (
        {disabled ? t('messages.noUndoHistory') : t('shortcuts.undo', { modifier })})
      </TooltipContent>
    </Tooltip>
  )
})
