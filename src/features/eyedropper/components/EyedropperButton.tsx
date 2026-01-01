import { memo } from 'react'
import { Pipette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useTranslation } from '@/features/i18n'

type EyedropperButtonProps = {
  readonly isActive: boolean
  readonly onClick: () => void
}

export const EyedropperButton = memo(function EyedropperButton({
  isActive,
  onClick,
}: EyedropperButtonProps) {
  const { t } = useTranslation()
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant={isActive ? 'default' : 'secondary'} size="icon" onClick={onClick}>
          <Pipette className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {t('tools.eyedropper')} ({t('shortcuts.eyedropper')})
      </TooltipContent>
    </Tooltip>
  )
})
