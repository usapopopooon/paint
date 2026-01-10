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
import { AnchorSelector } from './AnchorSelector'
import type { ResizeAnchor } from '../types'
import { MIN_CANVAS_SIZE, MAX_CANVAS_SIZE } from '../constants'

type CanvasResizeDialogContentProps = {
  readonly width: number
  readonly height: number
  readonly anchor: ResizeAnchor
  readonly onResize: (width: number, height: number, anchor: ResizeAnchor) => void
  readonly onCancel: () => void
}

/**
 * ダイアログの内容部分（keyでリセットされる）
 */
const CanvasResizeDialogContent = memo(function CanvasResizeDialogContent({
  width,
  height,
  anchor,
  onResize,
  onCancel,
}: CanvasResizeDialogContentProps) {
  const { t } = useTranslation()

  // ローカルステート（ダイアログ内での編集用）
  const [localWidth, setLocalWidth] = useState(String(width))
  const [localHeight, setLocalHeight] = useState(String(height))
  const [localAnchor, setLocalAnchor] = useState<ResizeAnchor>(anchor)
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

      onResize(newWidth, newHeight, localAnchor)
    },
    [localWidth, localHeight, localAnchor, validateWidth, validateHeight, onResize]
  )

  const isValid = !widthError && !heightError && localWidth !== '' && localHeight !== ''

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t('canvas.resize')}</DialogTitle>
        <DialogDescription className="sr-only">{t('canvas.resizeDescription')}</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4">
          {/* サイズ入力 */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="canvas-width" className="text-sm text-muted-foreground">
                {t('canvas.width')}
              </label>
              <div className="flex items-center gap-1">
                <input
                  id="canvas-width"
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
              <label htmlFor="canvas-height" className="text-sm text-muted-foreground">
                {t('canvas.height')}
              </label>
              <div className="flex items-center gap-1">
                <input
                  id="canvas-height"
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

          {/* アンカーセレクター */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t('canvas.anchor')}</span>
            <div className="flex items-center gap-1">
              <AnchorSelector value={localAnchor} onChange={setLocalAnchor} />
              {/* pxラベルと揃えるためのスペーサー */}
              <span className="text-sm text-muted-foreground invisible">px</span>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={onCancel}>
            {t('actions.cancel')}
          </Button>
          <Button type="submit" disabled={!isValid}>
            {t('actions.ok')}
          </Button>
        </DialogFooter>
      </form>
    </>
  )
})

type CanvasResizeDialogProps = {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly width: number
  readonly height: number
  readonly anchor: ResizeAnchor
  readonly onResize: (width: number, height: number, anchor: ResizeAnchor) => void
}

/**
 * キャンバスリサイズダイアログコンポーネント
 */
export const CanvasResizeDialog = memo(function CanvasResizeDialog({
  open,
  onOpenChange,
  width,
  height,
  anchor,
  onResize,
}: CanvasResizeDialogProps) {
  const handleResize = useCallback(
    (w: number, h: number, a: ResizeAnchor) => {
      onResize(w, h, a)
      onOpenChange(false)
    },
    [onResize, onOpenChange]
  )

  const handleCancel = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[320px]">
        {open && (
          <CanvasResizeDialogContent
            key={`${width}-${height}-${anchor}`}
            width={width}
            height={height}
            anchor={anchor}
            onResize={handleResize}
            onCancel={handleCancel}
          />
        )}
      </DialogContent>
    </Dialog>
  )
})
