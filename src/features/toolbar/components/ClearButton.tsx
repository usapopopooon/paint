import { memo } from 'react'
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
        <Button variant="outline" size="sm" onClick={onClick} className="w-16 text-foreground">
          {t('actions.clear')}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{t('shortcuts.clear')}</TooltipContent>
    </Tooltip>
  )
})
