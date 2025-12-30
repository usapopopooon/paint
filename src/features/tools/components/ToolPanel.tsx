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
    <aside className="w-[232px] p-4 border-r border-zinc-200 dark:border-zinc-700 bg-panel text-zinc-800 dark:text-zinc-100 flex flex-col gap-2">
      {children}
    </aside>
  )
})
