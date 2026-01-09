import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { useTranslation } from '@bf-i18n/react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './alert-dialog'

/**
 * PWA更新通知コンポーネント
 * 新しいバージョンが利用可能な場合にsonnerトーストで通知
 * 更新ボタンクリック時は確認ダイアログを表示
 */
export const ReloadPrompt = () => {
  const { t } = useTranslation()
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(error) {
      console.error('SW registration error:', error)
    },
  })

  const handleReloadClick = () => {
    setShowConfirmDialog(true)
  }

  const handleConfirmReload = () => {
    setShowConfirmDialog(false)
    updateServiceWorker(true)
  }

  const handleCancelReload = () => {
    setShowConfirmDialog(false)
  }

  useEffect(() => {
    if (needRefresh) {
      toast(t('pwa.newVersionAvailable'), {
        duration: Infinity,
        action: {
          label: t('pwa.reload'),
          onClick: handleReloadClick,
        },
        onDismiss: () => setNeedRefresh(false),
      })
    }
  }, [needRefresh, t, setNeedRefresh])

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
