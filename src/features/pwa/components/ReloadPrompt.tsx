import { useEffect, useState } from 'react'
import { useTranslation } from '@bf-i18n/react'
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
import { showActionToast } from '@/components/ui/sonner'
import { usePwaUpdate } from '../context'

/**
 * PWA更新通知コンポーネント
 * 新しいバージョンが利用可能な場合にsonnerトーストで通知
 * 更新ボタンクリック時は確認ダイアログを表示
 */
export const ReloadPrompt = () => {
  const { t } = useTranslation()
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const { needRefresh, updateApp, dismissUpdate } = usePwaUpdate()

  const handleReloadClick = () => {
    setShowConfirmDialog(true)
  }

  const handleConfirmReload = () => {
    setShowConfirmDialog(false)
    updateApp()
  }

  const handleCancelReload = () => {
    setShowConfirmDialog(false)
  }

  useEffect(() => {
    if (needRefresh) {
      showActionToast({
        title: t('pwa.newVersionAvailable'),
        actionLabel: t('pwa.reload'),
        onAction: handleReloadClick,
        onDismiss: dismissUpdate,
      })
    }
  }, [needRefresh, t, dismissUpdate])

  return (
    <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('pwa.confirmReload.title')}</AlertDialogTitle>
          <AlertDialogDescription>{t('pwa.confirmReload.description')}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancelReload}>
            {t('pwa.confirmReload.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirmReload}>
            {t('pwa.confirmReload.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
