import { memo, type RefObject, type ChangeEventHandler } from 'react'
import { ImagePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useTranslation } from '@/features/i18n'

type ImportButtonProps = {
  readonly inputRef: RefObject<HTMLInputElement | null>
  readonly onOpenFilePicker: () => void
  readonly onFileChange: ChangeEventHandler<HTMLInputElement>
}

/**
 * 画像インポートボタンコンポーネント
 */
export const ImportButton = memo(function ImportButton({
  inputRef,
  onOpenFilePicker,
  onFileChange,
}: ImportButtonProps) {
  const { t } = useTranslation()

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp"
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
            aria-label={t('toolbar.import')}
          >
            <ImagePlus className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">{t('toolbar.import')}</TooltipContent>
      </Tooltip>
    </>
  )
})
