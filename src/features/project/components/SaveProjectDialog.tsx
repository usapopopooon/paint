import { memo, useState, useCallback, useRef, useEffect } from 'react'
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
  const [fileName, setFileName] = useState('untitled')
  const inputRef = useRef<HTMLInputElement>(null)

  // ダイアログが開いたときにinputにフォーカス
  useEffect(() => {
    if (open) {
      // 少し遅延させてフォーカス（ダイアログのアニメーション後）
      const timer = setTimeout(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [open])

  const handleSave = useCallback(() => {
    if (fileName.trim()) {
      onSave(fileName.trim())
      onOpenChange(false)
    }
  }, [fileName, onSave, onOpenChange])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleSave()
      }
    },
    [handleSave]
  )

  const handleCancel = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[350px]">
        <DialogHeader>
          <DialogTitle>{t('project.saveDialog.title')}</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <label htmlFor="project-file-name" className="text-sm whitespace-nowrap">
            {t('project.saveDialog.fileName')}
          </label>
          <div className="flex items-center flex-1 gap-1">
            <Input
              id="project-file-name"
              ref={inputRef}
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground">.usapo</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            {t('actions.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={!fileName.trim()}>
            {t('project.saveDialog.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})
