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

type RecoveryDialogProps = {
  readonly open: boolean
  readonly savedAt: number | null
  /** ツール状態が含まれているかどうか */
  readonly hasToolState: boolean
  readonly onRestore: (restoreToolState: boolean) => void
  readonly onDiscard: () => void
}

/**
 * 作業データ復元ダイアログ
 * 前回のセッションから復元可能なデータがある場合に表示
 */
export const RecoveryDialog = memo(function RecoveryDialog({
  open,
  savedAt,
  hasToolState,
  onRestore,
  onDiscard,
}: RecoveryDialogProps) {
  const { t, locale } = useTranslation()
  const [restoreToolState, setRestoreToolState] = useState(true)

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString(locale === 'ja' ? 'ja-JP' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleRestore = () => {
    onRestore(restoreToolState && hasToolState)
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
        {hasToolState && (
          <div className="flex items-center justify-between py-2">
            <span className="text-sm">{t('recovery.restoreToolSettings')}</span>
            <Switch checked={restoreToolState} onCheckedChange={setRestoreToolState} />
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onDiscard}>{t('recovery.discard')}</AlertDialogCancel>
          <AlertDialogAction onClick={handleRestore} autoFocus>
            {t('recovery.restore')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
})
