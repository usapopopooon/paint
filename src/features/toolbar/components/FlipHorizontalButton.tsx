import { memo } from 'react'
import { FlipHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useLocale } from '@/features/i18n'

type FlipHorizontalButtonProps = {
  readonly onClick: () => void
}

export const FlipHorizontalButton = memo(function FlipHorizontalButton({
  onClick,
}: FlipHorizontalButtonProps) {
  const { t } = useLocale()
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          onClick={onClick}
          aria-label={t('canvas.flipHorizontal')}
        >
          <FlipHorizontal className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {t('canvas.flipHorizontal')} ({t('shortcuts.flipHorizontal')})
      </TooltipContent>
    </Tooltip>
  )
})
