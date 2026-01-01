import { memo, useMemo } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useLocale } from '@/features/i18n'
import type { LoadProjectError } from '../utils/loadProject'

type LoadProjectErrorDialogProps = {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly error: LoadProjectError | null
}

/**
 * プロジェクト読み込みエラーダイアログ
 */
export const LoadProjectErrorDialog = memo(function LoadProjectErrorDialog({
  open,
  onOpenChange,
  error,
}: LoadProjectErrorDialogProps) {
  const { t } = useLocale()

  const { title, description, details } = useMemo(() => {
    if (!error) {
      return { title: '', description: '', details: null }
    }

    switch (error.type) {
      case 'parse_error':
        return {
          title: t('project.loadError.title'),
          description: t('project.loadError.parseError'),
          details: null,
        }
      case 'unsupported_version':
        return {
          title: t('project.loadError.title'),
          description: t('project.loadError.unsupportedVersion'),
          details: `File version: ${error.fileVersion}`,
        }
      case 'invalid_format':
        return {
          title: t('project.loadError.title'),
          description: t('project.loadError.invalidFormat'),
          details: error.zodError.issues
            .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
            .join('\n'),
        }
    }
  }, [error, t])

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {details && (
          <pre className="max-h-40 overflow-auto rounded bg-muted p-2 text-xs">{details}</pre>
        )}
        <AlertDialogFooter>
          <AlertDialogAction>{t('actions.ok')}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
})
