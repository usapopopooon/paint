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

type ConfirmLoadProjectDialogProps = {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onConfirm: () => void
}

/**
 * プロジェクト読み込み確認ダイアログ
 * 編集内容がある場合に、破棄して新しいプロジェクトを読み込むかを確認する
 */
export const ConfirmLoadProjectDialog = memo(function ConfirmLoadProjectDialog({
  open,
  onOpenChange,
  onConfirm,
}: ConfirmLoadProjectDialogProps) {
  const { t } = useTranslation()

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('project.confirmLoad.title')}</AlertDialogTitle>
          <AlertDialogDescription>{t('project.confirmLoad.description')}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('actions.cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {t('project.confirmLoad.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
})
