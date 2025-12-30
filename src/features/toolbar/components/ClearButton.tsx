import { memo } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useLocale } from '@/features/i18n'

type ClearButtonProps = {
  readonly onClick: () => void
}

export const ClearButton = memo(function ClearButton({ onClick }: ClearButtonProps) {
  const { t } = useLocale()
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="icon" onClick={onClick} aria-label={t('actions.clear')}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {t('actions.clear')} ({t('shortcuts.clear')})
      </TooltipContent>
    </Tooltip>
  )
})
