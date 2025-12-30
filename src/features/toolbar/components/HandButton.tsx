import { memo } from 'react'
import { Hand } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useLocale } from '@/features/i18n'

type HandButtonProps = {
  readonly isActive: boolean
  readonly onClick: () => void
}

export const HandButton = memo(function HandButton({ isActive, onClick }: HandButtonProps) {
  const { t } = useLocale()
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={isActive ? 'default' : 'secondary'}
          size="icon"
          onClick={onClick}
        >
          <Hand className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {t('tools.hand')} ({t('shortcuts.hand')})
      </TooltipContent>
    </Tooltip>
  )
})
