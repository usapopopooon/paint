import { memo } from 'react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { TranslationKey } from '@/features/i18n'

type ClearButtonProps = {
  readonly onClick: () => void
  readonly t: (key: TranslationKey) => string
}

export const ClearButton = memo(function ClearButton({ onClick, t }: ClearButtonProps) {
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
