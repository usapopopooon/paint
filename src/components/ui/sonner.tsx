import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react'
import { toast, Toaster as Sonner, type ToasterProps } from 'sonner'
import { useTheme } from '@/features/theme'

const Toaster = ({ ...props }: ToasterProps) => {
  const { isDark } = useTheme()

  return (
    <Sonner
      theme={isDark ? 'dark' : 'light'}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--border-radius': 'var(--radius)',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

type ActionToastOptions = {
  title: string
  description?: string
  actionLabel: string
  onAction: () => void
  onDismiss?: () => void
  duration?: number
}

/**
 * アクションボタン付きトースト
 * PWA更新通知などに使用
 */
const showActionToast = ({
  title,
  description,
  actionLabel,
  onAction,
  onDismiss,
  duration = Infinity,
}: ActionToastOptions) => {
  toast(title, {
    description,
    duration,
    action: {
      label: actionLabel,
      onClick: onAction,
    },
    onDismiss,
  })
}

export { Toaster, showActionToast }
