import type { LucideIcon } from 'lucide-react'
import {
  SquareArrowUpLeft,
  SquareArrowUp,
  SquareArrowUpRight,
  SquareArrowLeft,
  Square,
  SquareArrowRight,
  SquareArrowDownLeft,
  SquareArrowDown,
  SquareArrowDownRight,
} from 'lucide-react'
import type { ResizeAnchor } from '../types'

/**
 * AnchorSelectorコンポーネントのプロパティ
 */
type AnchorSelectorProps = {
  readonly value: ResizeAnchor
  readonly onChange: (anchor: ResizeAnchor) => void
}

/** アンカーごとのアイコンマッピング */
const ANCHOR_ICONS: Record<ResizeAnchor, LucideIcon> = {
  'top-left': SquareArrowUpLeft,
  top: SquareArrowUp,
  'top-right': SquareArrowUpRight,
  left: SquareArrowLeft,
  center: Square,
  right: SquareArrowRight,
  'bottom-left': SquareArrowDownLeft,
  bottom: SquareArrowDown,
  'bottom-right': SquareArrowDownRight,
}

/** アンカーの配置順序（3x3グリッド） */
const ANCHOR_GRID: readonly (readonly ResizeAnchor[])[] = [
  ['top-left', 'top', 'top-right'],
  ['left', 'center', 'right'],
  ['bottom-left', 'bottom', 'bottom-right'],
] as const

/**
 * リサイズ起点選択コンポーネント（3x3グリッド）
 */
export const AnchorSelector = ({ value, onChange }: AnchorSelectorProps) => {
  return (
    <div className="grid grid-cols-3 gap-0.5 p-1 bg-muted rounded">
      {ANCHOR_GRID.flat().map((anchor) => {
        const Icon = ANCHOR_ICONS[anchor]
        return (
          <button
            key={anchor}
            type="button"
            onClick={() => onChange(anchor)}
            className={`
              w-6 h-6 rounded-sm transition-colors flex items-center justify-center
              ${
                value === anchor
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background hover:bg-accent text-muted-foreground hover:text-foreground border border-input'
              }
            `}
            aria-label={anchor}
            aria-pressed={value === anchor}
          >
            <Icon size={14} />
          </button>
        )
      })}
    </div>
  )
}
