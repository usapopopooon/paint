import { memo, useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useLocale } from '@/features/i18n'
import { fileNameSchema, MAX_FILE_NAME_LENGTH } from '../domain'

const formSchema = z.object({
  fileName: fileNameSchema,
})

type FormData = z.infer<typeof formSchema>

type SaveProjectDialogProps = {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onSave: (fileName: string) => void
}

/**
 * プロジェクト保存ダイアログコンポーネント
 */
export const SaveProjectDialog = memo(function SaveProjectDialog({
  open,
  onOpenChange,
  onSave,
}: SaveProjectDialogProps) {
  const { t } = useLocale()

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setFocus,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { fileName: 'untitled' },
    mode: 'onChange',
  })

  // ダイアログが開いたときにinputにフォーカス
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        setFocus('fileName', { shouldSelect: true })
      }, 50)
      return () => clearTimeout(timer)
    } else {
      reset({ fileName: 'untitled' })
    }
  }, [open, setFocus, reset])

  const onSubmit = useCallback(
    (data: FormData) => {
      onSave(data.fileName.trim())
      onOpenChange(false)
    },
    [onSave, onOpenChange]
  )

  const handleCancel = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  const getErrorMessage = (): string | undefined => {
    if (!errors.fileName) return undefined

    const errorType = errors.fileName.type
    const errorMessage = errors.fileName.message

    if (errorType === 'too_small' || errorMessage === 'too_small') {
      return t('project.saveDialog.fileNameRequired')
    }
    if (errorType === 'too_big' || errorMessage === 'too_big') {
      return t('project.saveDialog.fileNameTooLong', { max: MAX_FILE_NAME_LENGTH })
    }
    if (errorMessage === 'invalidCharacters') {
      return t('project.saveDialog.invalidCharacters')
    }
    return t('project.saveDialog.fileNameRequired')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[350px]">
        <DialogHeader>
          <DialogTitle>{t('project.saveDialog.title')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <label htmlFor="project-file-name" className="text-sm whitespace-nowrap">
                {t('project.saveDialog.fileName')}
              </label>
              <div className="flex items-center flex-1 gap-1">
                <Input
                  id="project-file-name"
                  {...register('fileName')}
                  className={`flex-1 ${errors.fileName ? 'border-destructive' : ''}`}
                />
                <span className="text-sm text-muted-foreground">.usapo</span>
              </div>
            </div>
            {errors.fileName && <p className="text-sm text-destructive">{getErrorMessage()}</p>}
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              {t('actions.cancel')}
            </Button>
            <Button type="submit" disabled={!isValid}>
              {t('project.saveDialog.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
})
