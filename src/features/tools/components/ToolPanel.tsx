import { memo, type ReactNode } from 'react'

type ToolPanelProps = {
  readonly children: ReactNode
}

/**
 * ツールパネルのレイアウトコンポーネント
 * 子要素を縦に配置する
 */
export const ToolPanel = memo(function ToolPanel({ children }: ToolPanelProps) {
  return (
    <aside className="w-[232px] p-4 border-r border-zinc-300 dark:border-border bg-zinc-200 dark:bg-background flex flex-col gap-6">
      {children}
    </aside>
  )
})
