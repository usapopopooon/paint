import { memo, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useTranslation } from '@/features/i18n'
import {
  DEFAULT_CANVAS_WIDTH,
  DEFAULT_CANVAS_HEIGHT,
  MIN_CANVAS_SIZE,
  MAX_CANVAS_SIZE,
} from '../constants'

type NewCanvasDialogContentProps = {
  readonly onCreate: (width: number, height: number, projectName: string | null) => void
  readonly onCancel: () => void
}

/**
 * ダイアログの内容部分（keyでリセットされる）
 */
const NewCanvasDialogContent = memo(function NewCanvasDialogContent({
  onCreate,
  onCancel,
}: NewCanvasDialogContentProps) {
  const { t } = useTranslation()
  const defaultProjectName = t('app.untitledProject')

  // ローカルステート（ダイアログ内での編集用）
  const [localProjectName, setLocalProjectName] = useState(defaultProjectName)
  const [localWidth, setLocalWidth] = useState(String(DEFAULT_CANVAS_WIDTH))
  const [localHeight, setLocalHeight] = useState(String(DEFAULT_CANVAS_HEIGHT))
  const [widthError, setWidthError] = useState<string | null>(null)
  const [heightError, setHeightError] = useState<string | null>(null)

  const validateWidth = useCallback(
    (value: string): string | null => {
      const num = parseInt(value, 10)
      if (isNaN(num)) {
        return t('canvas.invalidSize')
      }
      if (num < MIN_CANVAS_SIZE) {
        return t('canvas.sizeTooSmall', { min: MIN_CANVAS_SIZE })
      }
      if (num > MAX_CANVAS_SIZE) {
        return t('canvas.sizeTooLarge', { max: MAX_CANVAS_SIZE })
      }
      return null
    },
    [t]
  )

  const validateHeight = useCallback(
    (value: string): string | null => {
      const num = parseInt(value, 10)
      if (isNaN(num)) {
        return t('canvas.invalidSize')
      }
      if (num < MIN_CANVAS_SIZE) {
        return t('canvas.sizeTooSmall', { min: MIN_CANVAS_SIZE })
      }
      if (num > MAX_CANVAS_SIZE) {
        return t('canvas.sizeTooLarge', { max: MAX_CANVAS_SIZE })
      }
      return null
    },
    [t]
  )

  const handleWidthChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setLocalWidth(value)
      setWidthError(validateWidth(value))
    },
    [validateWidth]
  )

  const handleHeightChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setLocalHeight(value)
      setHeightError(validateHeight(value))
    },
    [validateHeight]
  )

  const handleProjectNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalProjectName(e.target.value)
  }, [])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()

      const wErr = validateWidth(localWidth)
      const hErr = validateHeight(localHeight)

      if (wErr) {
        setWidthError(wErr)
        toast.error(wErr)
        return
      }
      if (hErr) {
        setHeightError(hErr)
        toast.error(hErr)
        return
      }

      const newWidth = parseInt(localWidth, 10)
      const newHeight = parseInt(localHeight, 10)
      // 空文字またはデフォルト名と同じならnullを返す
      const trimmedName = localProjectName.trim()
      const projectName = trimmedName === '' ? null : trimmedName

      onCreate(newWidth, newHeight, projectName)
    },
    [localWidth, localHeight, localProjectName, validateWidth, validateHeight, onCreate]
  )

  const isValid = !widthError && !heightError && localWidth !== '' && localHeight !== ''

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t('canvas.new')}</DialogTitle>
        <DialogDescription className="sr-only">{t('canvas.newDescription')}</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4">
          {/* プロジェクト名入力 */}
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="new-canvas-project-name" className="text-sm text-muted-foreground">
              {t('canvas.projectName')}
            </label>
            <input
              id="new-canvas-project-name"
              type="text"
              value={localProjectName}
              onChange={handleProjectNameChange}
              className="w-36 px-2 py-1.5 rounded border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* サイズ入力 */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="new-canvas-width" className="text-sm text-muted-foreground">
                {t('canvas.width')}
              </label>
              <div className="flex items-center gap-1">
                <input
                  id="new-canvas-width"
                  type="number"
                  value={localWidth}
                  onChange={handleWidthChange}
                  min={MIN_CANVAS_SIZE}
                  max={MAX_CANVAS_SIZE}
                  className={`w-24 px-2 py-1.5 rounded border bg-background text-foreground text-center focus:outline-none focus:ring-1 focus:ring-ring ${
                    widthError ? 'border-destructive' : 'border-input'
                  }`}
                />
                <span className="text-sm text-muted-foreground">px</span>
              </div>
            </div>
            {widthError && <p className="text-sm text-destructive">{widthError}</p>}

            <div className="flex items-center justify-between gap-2">
              <label htmlFor="new-canvas-height" className="text-sm text-muted-foreground">
                {t('canvas.height')}
              </label>
              <div className="flex items-center gap-1">
                <input
                  id="new-canvas-height"
                  type="number"
                  value={localHeight}
                  onChange={handleHeightChange}
                  min={MIN_CANVAS_SIZE}
                  max={MAX_CANVAS_SIZE}
                  className={`w-24 px-2 py-1.5 rounded border bg-background text-foreground text-center focus:outline-none focus:ring-1 focus:ring-ring ${
                    heightError ? 'border-destructive' : 'border-input'
                  }`}
                />
                <span className="text-sm text-muted-foreground">px</span>
              </div>
            </div>
            {heightError && <p className="text-sm text-destructive">{heightError}</p>}
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={onCancel}>
            {t('actions.cancel')}
          </Button>
          <Button type="submit" disabled={!isValid}>
            {t('canvas.create')}
          </Button>
        </DialogFooter>
      </form>
    </>
  )
})

type NewCanvasDialogProps = {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onCreate: (width: number, height: number, projectName: string | null) => void
}

/**
 * 新規キャンバス作成ダイアログコンポーネント
 */
export const NewCanvasDialog = memo(function NewCanvasDialog({
  open,
  onOpenChange,
  onCreate,
}: NewCanvasDialogProps) {
  const handleCreate = useCallback(
    (w: number, h: number, projectName: string | null) => {
      onCreate(w, h, projectName)
      onOpenChange(false)
    },
    [onCreate, onOpenChange]
  )

  const handleCancel = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[320px]">
        {open && (
          <NewCanvasDialogContent
            key={open.toString()}
            onCreate={handleCreate}
            onCancel={handleCancel}
          />
        )}
      </DialogContent>
    </Dialog>
  )
})
