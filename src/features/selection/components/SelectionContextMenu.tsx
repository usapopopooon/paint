import { memo, type ReactNode } from 'react'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { useTranslation } from '@/features/i18n'
import { getModifierKey } from '@/lib/platform'

export type SelectionContextMenuProps = {
  /** メニューのトリガーとなる子要素 */
  readonly children: ReactNode
  /** 選択領域があるかどうか */
  readonly hasSelection: boolean
  /** クリップボードにデータがあるかどうか */
  readonly hasClipboard: boolean
  /** 切り取りコールバック */
  readonly onCut: () => void
  /** コピーコールバック */
  readonly onCopy: () => void
  /** 貼り付けコールバック */
  readonly onPaste: () => void
  /** 削除コールバック */
  readonly onDelete: () => void
  /** 選択解除コールバック */
  readonly onDeselect: () => void
  /** 全選択コールバック */
  readonly onSelectAll: () => void
  /** 右クリック時のコールバック（スポイト機能用） */
  readonly onContextMenu?: (e: React.MouseEvent) => void
  /** コンテキストメニューを表示するかどうか（選択ツール使用中のみ） */
  readonly showContextMenu?: boolean
}

/**
 * 選択領域用のコンテキストメニュー
 */
export const SelectionContextMenu = memo(function SelectionContextMenu({
  children,
  hasSelection,
  hasClipboard,
  onCut,
  onCopy,
  onPaste,
  onDelete,
  onDeselect,
  onSelectAll,
  onContextMenu,
  showContextMenu = true,
}: SelectionContextMenuProps) {
  const { t } = useTranslation()
  const modifier = getModifierKey()

  // コンテキストメニューを表示しない場合は子要素をそのまま返す
  if (!showContextMenu) {
    return (
      <div onContextMenu={onContextMenu}>
        {children}
      </div>
    )
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild onContextMenu={onContextMenu}>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={onCut} disabled={!hasSelection}>
          {t('menu.cut')}
          <ContextMenuShortcut>{modifier}+X</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={onCopy} disabled={!hasSelection}>
          {t('menu.copy')}
          <ContextMenuShortcut>{modifier}+C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={onPaste} disabled={!hasClipboard}>
          {t('menu.paste')}
          <ContextMenuShortcut>{modifier}+V</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={onDelete} disabled={!hasSelection}>
          {t('menu.delete')}
          <ContextMenuShortcut>Del</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onSelectAll}>
          {t('menu.selectAll')}
          <ContextMenuShortcut>{modifier}+A</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={onDeselect} disabled={!hasSelection}>
          {t('menu.deselect')}
          <ContextMenuShortcut>{modifier}+D</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
})
