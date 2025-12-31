import { memo } from 'react'
import { ZoomOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useLocale } from '@/features/i18n'
import { getModifierKey } from '@/lib/platform'

type ZoomOutButtonProps = {
  readonly isActive?: boolean
  readonly onClick: () => void
}

export const ZoomOutButton = memo(function ZoomOutButton({
  isActive = false,
  onClick,
}: ZoomOutButtonProps) {
  const { t } = useLocale()
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant={isActive ? 'default' : 'secondary'} size="icon" onClick={onClick}>
          <ZoomOut className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {t('zoom.out')} ({getModifierKey()}-)
      </TooltipContent>
    </Tooltip>
  )
})
