import { memo } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Square, Lasso } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useTranslation } from '@/features/i18n'
import type { SelectionToolType } from '../types'

type SelectionToolButtonProps = {
  /** 選択ツールタイプ */
  readonly toolType: SelectionToolType
  /** アクティブかどうか */
  readonly isActive: boolean
  /** 選択時のコールバック */
  readonly onSelect: () => void
}

const TOOL_CONFIG: Record<
  SelectionToolType,
  { icon: LucideIcon; translationKey: string; shortcut: string }
> = {
  'select-rectangle': {
    icon: Square,
    translationKey: 'tools.selectRectangle',
    shortcut: 'M',
  },
  'select-lasso': {
    icon: Lasso,
    translationKey: 'tools.selectLasso',
    shortcut: 'L',
  },
}

/**
 * 選択ツールボタンコンポーネント
 */
export const SelectionToolButton = memo(function SelectionToolButton({
  toolType,
  isActive,
  onSelect,
}: SelectionToolButtonProps) {
  const { t } = useTranslation()
  const config = TOOL_CONFIG[toolType]
  const Icon = config.icon

  return (
    <div className="flex items-center gap-1.5">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isActive ? 'default' : 'secondary'}
            size="icon"
            className="size-6"
            onClick={onSelect}
            aria-label={t(config.translationKey)}
          >
            <Icon className="size-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          {t(config.translationKey)} ({config.shortcut})
        </TooltipContent>
      </Tooltip>
      <span className="text-sm text-muted-foreground flex-1">{t(config.translationKey)}</span>
    </div>
  )
})
