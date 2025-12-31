import { memo } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useLocale } from '@/features/i18n'

type SaveButtonProps = {
  readonly onSave: () => void
}

/**
 * 保存ボタンコンポーネント
 */
export const SaveButton = memo(function SaveButton({ onSave }: SaveButtonProps) {
  const { t } = useLocale()

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={onSave}
          className="h-8 w-8"
          aria-label={t('toolbar.save')}
        >
          <Download className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{t('toolbar.save')}</TooltipContent>
    </Tooltip>
  )
})
