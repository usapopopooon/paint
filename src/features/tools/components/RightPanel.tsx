import { memo, type ReactNode } from 'react'

type RightPanelProps = {
  readonly children: ReactNode
}

export const RightPanel = memo(function RightPanel({ children }: RightPanelProps) {
  return (
    <aside className="w-[232px] h-full p-4 border-l border-zinc-200 dark:border-zinc-700 bg-panel text-zinc-800 dark:text-zinc-100 flex flex-col gap-1 overflow-hidden">
      {children}
    </aside>
  )
})
