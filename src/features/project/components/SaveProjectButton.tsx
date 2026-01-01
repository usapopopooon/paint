import { memo } from 'react'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useTranslation } from '@/features/i18n'

type SaveProjectButtonProps = {
  readonly onSave: () => void
}

/**
 * プロジェクト保存ボタンコンポーネント
 */
export const SaveProjectButton = memo(function SaveProjectButton({
  onSave,
}: SaveProjectButtonProps) {
  const { t } = useTranslation()

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={onSave}
          className="h-8 w-8"
          aria-label={t('toolbar.saveProject')}
        >
          <Save className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{t('toolbar.saveProject')}</TooltipContent>
    </Tooltip>
  )
})
