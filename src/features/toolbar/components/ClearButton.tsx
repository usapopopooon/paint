import { memo } from 'react'
import { ImageOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useTranslation } from '@/features/i18n'
import { getModifierKey } from '@/lib/platform'

type ClearButtonProps = {
  readonly onClick: () => void
}

export const ClearButton = memo(function ClearButton({ onClick }: ClearButtonProps) {
  const { t } = useTranslation()
  const modifier = getModifierKey()
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          onClick={onClick}
          aria-label={t('actions.clearLayer')}
        >
          <ImageOff className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {t('actions.clearLayer')} ({t('shortcuts.clearLayer', { modifier })})
      </TooltipContent>
    </Tooltip>
  )
})
