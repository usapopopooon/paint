import { memo, type ReactNode } from 'react'

type ToolbarProps = {
  readonly children: ReactNode
}

/**
 * ツールバーのレイアウトコンポーネント
 * 子要素をflexboxで配置する
 */
export const Toolbar = memo(function Toolbar({ children }: ToolbarProps) {
  return <div className="flex items-center gap-2">{children}</div>
})
