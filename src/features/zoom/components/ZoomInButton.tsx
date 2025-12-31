import { memo } from 'react'
import { ZoomIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useLocale } from '@/features/i18n'
import { getModifierKey } from '@/lib/platform'

type ZoomInButtonProps = {
  readonly isActive?: boolean
  readonly onClick: () => void
}

export const ZoomInButton = memo(function ZoomInButton({
  isActive = false,
  onClick,
}: ZoomInButtonProps) {
  const { t } = useLocale()
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant={isActive ? 'default' : 'secondary'} size="icon" onClick={onClick}>
          <ZoomIn className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {t('zoom.in')} ({getModifierKey()}++)
      </TooltipContent>
    </Tooltip>
  )
})
