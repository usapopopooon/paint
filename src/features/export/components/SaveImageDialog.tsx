import { memo, useCallback, useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
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
import type { ExportOptions, ImageFormat, ExportScale } from '../types'
import { DEFAULT_JPEG_QUALITY, MIN_JPEG_QUALITY, MAX_JPEG_QUALITY } from '../types'

const MAX_FILE_NAME_LENGTH = 100

const fileNameSchema = z
  .string()
  .min(1, 'too_small')
  .max(MAX_FILE_NAME_LENGTH, 'too_big')
  .refine((value) => !/[<>:"/\\|?*]/.test(value), 'invalidCharacters')

const formSchema = z.object({
  fileName: fileNameSchema,
  format: z.enum(['jpg', 'png']),
  scale: z.enum(['100', '50', '25']),
  includeBackground: z.boolean(),
  jpegQuality: z.number().min(MIN_JPEG_QUALITY).max(MAX_JPEG_QUALITY),
})

type FormData = z.infer<typeof formSchema>

type SaveImageDialogProps = {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onSave: (options: ExportOptions) => void
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
    setValue,
    control,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fileName: 'untitled',
      format: 'png',
      scale: '100',
      includeBackground: false,
      jpegQuality: DEFAULT_JPEG_QUALITY,
    },
    mode: 'onChange',
  })

  const format = useWatch({ control, name: 'format' })
  const scale = useWatch({ control, name: 'scale' })
  const includeBackground = useWatch({ control, name: 'includeBackground' })
  const jpegQuality = useWatch({ control, name: 'jpegQuality' })

  // ダイアログが開いたときにinputにフォーカス
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        setFocus('fileName', { shouldSelect: true })
      }, 50)
      return () => clearTimeout(timer)
    } else {
      reset({
        fileName: 'untitled',
        format: 'png',
        scale: '100',
        includeBackground: false,
        jpegQuality: DEFAULT_JPEG_QUALITY,
      })
    }
  }, [open, setFocus, reset])

  const onSubmit = useCallback(
    (data: FormData) => {
      onSave({
        fileName: data.fileName.trim(),
        format: data.format,
        scale: data.scale,
        includeBackground: data.includeBackground,
        jpegQuality: data.jpegQuality,
      })
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

  const handleScaleChange = useCallback(
    (value: string) => {
      setValue('scale', value as ExportScale)
    },
    [setValue]
  )

  const handleIncludeBackgroundChange = useCallback(
    (checked: boolean) => {
      setValue('includeBackground', checked)
    },
    [setValue]
  )

  const handleJpegQualityChange = useCallback(
    (value: number[]) => {
      setValue('jpegQuality', value[0])
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
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{t('export.saveDialog.title')}</DialogTitle>
          <DialogDescription className="sr-only">
            {t('export.saveDialog.description')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-4">
            {/* Format */}
            <div className="flex items-center gap-2">
              <label htmlFor="image-format" className="text-sm whitespace-nowrap w-24">
                {t('export.saveDialog.format')}
              </label>
              <Select value={format} onValueChange={handleFormatChange}>
                <SelectTrigger id="image-format" className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="jpg">JPG</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* File Name */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <label htmlFor="image-file-name" className="text-sm whitespace-nowrap w-24">
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
              {errors.fileName && (
                <p className="text-sm text-destructive ml-26">{getErrorMessage()}</p>
              )}
            </div>

            {/* Scale */}
            <div className="flex items-center gap-2">
              <label htmlFor="image-scale" className="text-sm whitespace-nowrap w-24">
                {t('export.saveDialog.scale')}
              </label>
              <Select value={scale} onValueChange={handleScaleChange}>
                <SelectTrigger id="image-scale" className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="100">100%</SelectItem>
                  <SelectItem value="50">50%</SelectItem>
                  <SelectItem value="25">25%</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* PNG: Include Background */}
            {format === 'png' && (
              <div className="flex items-center gap-2">
                <label htmlFor="include-background" className="text-sm whitespace-nowrap w-24">
                  {t('export.saveDialog.includeBackground')}
                </label>
                <Switch
                  id="include-background"
                  checked={includeBackground}
                  onCheckedChange={handleIncludeBackgroundChange}
                />
              </div>
            )}

            {/* JPG: Quality */}
            {format === 'jpg' && (
              <div className="flex items-center gap-2">
                <label htmlFor="jpeg-quality" className="text-sm whitespace-nowrap w-24">
                  {t('export.saveDialog.quality')}
                </label>
                <div className="flex items-center flex-1 gap-2">
                  <Slider
                    id="jpeg-quality"
                    value={[jpegQuality]}
                    onValueChange={handleJpegQualityChange}
                    min={MIN_JPEG_QUALITY}
                    max={MAX_JPEG_QUALITY}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground w-10 text-right">
                    {jpegQuality}%
                  </span>
                </div>
              </div>
            )}
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
