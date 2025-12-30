import { memo } from 'react'
import { Redo2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useLocale } from '@/features/i18n'

type RedoButtonProps = {
  readonly disabled: boolean
  readonly onClick: () => void
}

export const RedoButton = memo(function RedoButton({ disabled, onClick }: RedoButtonProps) {
  const { t } = useLocale()
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-block">
          <Button
            variant="secondary"
            size="icon"
            onClick={onClick}
            disabled={disabled}
            aria-label={t('actions.redo')}
          >
            <Redo2 className="h-4 w-4" />
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>
        {t('actions.redo')} ({disabled ? t('messages.noRedoHistory') : t('shortcuts.redo')})
      </TooltipContent>
    </Tooltip>
  )
})
