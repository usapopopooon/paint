import { memo } from 'react'
import { Crosshair } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useTranslation } from '@/features/i18n'

type CenterCanvasButtonProps = {
  readonly onClick: () => void
}

export const CenterCanvasButton = memo(function CenterCanvasButton({
  onClick,
}: CenterCanvasButtonProps) {
  const { t } = useTranslation()
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="secondary" size="icon" onClick={onClick}>
          <Crosshair className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{t('canvas.center')}</TooltipContent>
    </Tooltip>
  )
})
