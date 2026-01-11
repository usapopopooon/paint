import { memo, useState } from 'react'
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
import { Switch } from '@/components/ui/switch'
import { useTranslation } from '@/features/i18n'

type LoadToolStateDialogProps = {
  readonly open: boolean
  readonly onConfirm: (restoreToolState: boolean) => void
  readonly onSkip: () => void
}

/**
 * プロジェクト読み込み時のツール設定復元確認ダイアログ
 */
export const LoadToolStateDialog = memo(function LoadToolStateDialog({
  open,
  onConfirm,
  onSkip,
}: LoadToolStateDialogProps) {
  const { t } = useTranslation()
  const [restoreToolState, setRestoreToolState] = useState(true)

  const handleConfirm = () => {
    onConfirm(restoreToolState)
  }

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('project.loadToolState.title')}</AlertDialogTitle>
          <AlertDialogDescription>{t('project.loadToolState.description')}</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex items-center justify-between py-2">
          <span className="text-sm">{t('project.loadToolState.restoreToolSettings')}</span>
          <Switch checked={restoreToolState} onCheckedChange={setRestoreToolState} />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onSkip}>{t('project.loadToolState.skip')}</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} autoFocus>
            {t('project.loadToolState.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
})
