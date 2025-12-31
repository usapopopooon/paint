import { memo } from 'react'
import { SquareDot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useLocale } from '@/features/i18n'
import { getModifierKey } from '@/lib/platform'

type ZoomResetButtonProps = {
  readonly onClick: () => void
}

export const ZoomResetButton = memo(function ZoomResetButton({ onClick }: ZoomResetButtonProps) {
  const { t } = useLocale()
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="secondary" size="icon" onClick={onClick}>
          <SquareDot className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {t('zoom.reset')} ({getModifierKey()}0)
      </TooltipContent>
    </Tooltip>
  )
})
