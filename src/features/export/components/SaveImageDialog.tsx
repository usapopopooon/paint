import { memo, useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useTranslation } from '@/features/i18n'

export type ImageFormat = 'jpg' | 'png'

const MAX_FILE_NAME_LENGTH = 100

const fileNameSchema = z
  .string()
  .min(1, 'too_small')
  .max(MAX_FILE_NAME_LENGTH, 'too_big')
  .refine((value) => !/[<>:"/\\|?*]/.test(value), 'invalidCharacters')

const formSchema = z.object({
  fileName: fileNameSchema,
  format: z.enum(['jpg', 'png']),
})

type FormData = z.infer<typeof formSchema>

type SaveImageDialogProps = {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onSave: (fileName: string, format: ImageFormat) => void
}

/**
 * 画像保存ダイアログコンポーネント
 */
export const SaveImageDialog = memo(function SaveImageDialog({
  open,
  onOpenChange,
  onSave,
}: SaveImageDialogProps) {
  const { t } = useTranslation()

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setFocus,
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { fileName: 'untitled', format: 'jpg' },
    mode: 'onChange',
  })

  const format = watch('format')

  // ダイアログが開いたときにinputにフォーカス
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        setFocus('fileName', { shouldSelect: true })
      }, 50)
      return () => clearTimeout(timer)
    } else {
      reset({ fileName: 'untitled', format: 'jpg' })
    }
  }, [open, setFocus, reset])

  const onSubmit = useCallback(
    (data: FormData) => {
      onSave(data.fileName.trim(), data.format)
      onOpenChange(false)
    },
    [onSave, onOpenChange]
  )

  const handleCancel = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  const handleFormatChange = useCallback(
    (value: string) => {
      setValue('format', value as ImageFormat)
    },
    [setValue]
  )

  const getErrorMessage = (): string | undefined => {
    if (!errors.fileName) return undefined

    const errorType = errors.fileName.type
    const errorMessage = errors.fileName.message

    if (errorType === 'too_small' || errorMessage === 'too_small') {
      return t('export.saveDialog.fileNameRequired')
    }
    if (errorType === 'too_big' || errorMessage === 'too_big') {
      return t('export.saveDialog.fileNameTooLong', { max: MAX_FILE_NAME_LENGTH })
    }
    if (errorMessage === 'invalidCharacters') {
      return t('export.saveDialog.invalidCharacters')
    }
    return t('export.saveDialog.fileNameRequired')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[350px]">
        <DialogHeader>
          <DialogTitle>{t('export.saveDialog.title')}</DialogTitle>
          <DialogDescription className="sr-only">
            {t('export.saveDialog.description')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="image-format" className="text-sm whitespace-nowrap">
                {t('export.saveDialog.format')}
              </label>
              <Select value={format} onValueChange={handleFormatChange}>
                <SelectTrigger id="image-format" className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jpg">JPG</SelectItem>
                  <SelectItem value="png">PNG</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <label htmlFor="image-file-name" className="text-sm whitespace-nowrap">
                  {t('export.saveDialog.fileName')}
                </label>
                <div className="flex items-center flex-1 gap-1">
                  <Input
                    id="image-file-name"
                    {...register('fileName')}
                    className={`flex-1 ${errors.fileName ? 'border-destructive' : ''}`}
                  />
                  <span className="text-sm text-muted-foreground">.{format}</span>
                </div>
              </div>
              {errors.fileName && <p className="text-sm text-destructive">{getErrorMessage()}</p>}
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              {t('actions.cancel')}
            </Button>
            <Button type="submit" disabled={!isValid}>
              {t('export.saveDialog.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
})
