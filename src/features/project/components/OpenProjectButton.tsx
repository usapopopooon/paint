import { memo, type RefObject, type ChangeEventHandler } from 'react'
import { FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useTranslation } from '@/features/i18n'
import { PROJECT_FILE_EXTENSION } from '../constants'

type OpenProjectButtonProps = {
  readonly inputRef: RefObject<HTMLInputElement | null>
  readonly onOpenFilePicker: () => void
  readonly onFileChange: ChangeEventHandler<HTMLInputElement>
}

/**
 * プロジェクト読み込みボタンコンポーネント
 */
export const OpenProjectButton = memo(function OpenProjectButton({
  inputRef,
  onOpenFilePicker,
  onFileChange,
}: OpenProjectButtonProps) {
  const { t } = useTranslation()

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={PROJECT_FILE_EXTENSION}
        onChange={onFileChange}
        className="hidden"
        aria-hidden="true"
      />
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenFilePicker}
            className="h-8 w-8"
            aria-label={t('toolbar.openProject')}
          >
            <FolderOpen className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">{t('toolbar.openProject')}</TooltipContent>
      </Tooltip>
    </>
  )
})
