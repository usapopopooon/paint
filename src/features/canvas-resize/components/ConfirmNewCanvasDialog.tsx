import { memo } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useTranslation } from '@/features/i18n'

type ConfirmNewCanvasDialogProps = {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onConfirm: () => void
}

/**
 * 新規キャンバス作成確認ダイアログ
 * 編集内容がある場合に、破棄して新しいキャンバスを作成するかを確認する
 */
export const ConfirmNewCanvasDialog = memo(function ConfirmNewCanvasDialog({
  open,
  onOpenChange,
  onConfirm,
}: ConfirmNewCanvasDialogProps) {
  const { t } = useTranslation()

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('canvas.confirmNew.title')}</AlertDialogTitle>
          <AlertDialogDescription>{t('canvas.confirmNew.description')}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('actions.cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {t('canvas.confirmNew.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
})
