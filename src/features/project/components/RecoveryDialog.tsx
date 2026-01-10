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

type RecoveryDialogProps = {
  readonly open: boolean
  readonly savedAt: number | null
  readonly onRestore: () => void
  readonly onDiscard: () => void
}

/**
 * 作業データ復元ダイアログ
 * 前回のセッションから復元可能なデータがある場合に表示
 */
export const RecoveryDialog = memo(function RecoveryDialog({
  open,
  savedAt,
  onRestore,
  onDiscard,
}: RecoveryDialogProps) {
  const { t, locale } = useTranslation()

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString(locale === 'ja' ? 'ja-JP' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('recovery.title')}</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <span className="block">{t('recovery.description')}</span>
            {savedAt && (
              <span className="block text-sm text-muted-foreground">
                {t('recovery.savedAt', { date: formatDate(savedAt) })}
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onDiscard}>{t('recovery.discard')}</AlertDialogCancel>
          <AlertDialogAction onClick={onRestore}>{t('recovery.restore')}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
})
