import { memo, type RefObject } from 'react'
import { Check, Circle } from 'lucide-react'
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from '@/components/ui/menubar'
import { useTranslation, useLocale } from '@/features/i18n'
import { useTheme } from '@/features/theme'
import { usePwaUpdate } from '@/features/pwa'
import { getModifierKey } from '@/lib/platform'

export type AppMenubarProps = {
  // File menu
  readonly onNewCanvas: () => void
  readonly projectInputRef: RefObject<HTMLInputElement | null>
  readonly onOpenProject: () => void
  readonly onProjectFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  readonly onSaveProject: () => void
  readonly importInputRef: RefObject<HTMLInputElement | null>
  readonly onImport: () => void
  readonly onImportFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  readonly onExport: () => void
  /** キャンバスが作成されているかどうか（未作成の場合は編集・保存系メニューを無効化） */
  readonly isCanvasCreated: boolean
  // Edit menu
  readonly canUndo: boolean
  readonly canRedo: boolean
  readonly onUndo: () => void
  readonly onRedo: () => void
  readonly onClear: () => void
  readonly onFlipHorizontal: () => void
  readonly onFlipVertical: () => void
  readonly onCanvasSize: () => void
  // Selection
  readonly hasSelection: boolean
  readonly hasClipboard: boolean
  readonly onSelectAll: () => void
  readonly onDeselect: () => void
  readonly onCut: () => void
  readonly onCopy: () => void
  readonly onPaste: () => void
  readonly onDelete: () => void
  // View menu
  readonly onZoomIn: () => void
  readonly onZoomOut: () => void
  readonly onZoomReset: () => void
  readonly onCenterCanvas: () => void
}

/**
 * アプリケーションのメニューバーコンポーネント
 */
export const AppMenubar = memo(function AppMenubar({
  onNewCanvas,
  projectInputRef,
  onOpenProject,
  onProjectFileChange,
  onSaveProject,
  importInputRef,
  onImport,
  onImportFileChange,
  onExport,
  isCanvasCreated,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClear,
  onFlipHorizontal,
  onFlipVertical,
  onCanvasSize,
  hasSelection,
  hasClipboard,
  onSelectAll,
  onDeselect,
  onCut,
  onCopy,
  onPaste,
  onDelete,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onCenterCanvas,
}: AppMenubarProps) {
  const { t } = useTranslation()
  const { locale, setLocale } = useLocale()
  const { isDark, setTheme } = useTheme()
  const { needRefresh, checkForUpdate } = usePwaUpdate()
  const modifier = getModifierKey()

  return (
    <>
      {/* Hidden file inputs */}
      <input
        ref={projectInputRef}
        type="file"
        accept=".paint"
        onChange={onProjectFileChange}
        className="hidden"
        aria-hidden="true"
      />
      <input
        ref={importInputRef}
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp"
        onChange={onImportFileChange}
        className="hidden"
        aria-hidden="true"
      />

      <Menubar className="border-0 rounded-none bg-transparent shadow-none">
        {/* File Menu */}
        <MenubarMenu>
          <MenubarTrigger>{t('menu.file')}</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={onNewCanvas}>
              {t('menu.newCanvas')}
              <MenubarShortcut>{modifier}+N</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={onOpenProject}>{t('menu.openProject')}</MenubarItem>
            <MenubarItem disabled={!isCanvasCreated} onClick={onSaveProject}>
              {t('menu.saveProject')}
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem disabled={!isCanvasCreated} onClick={onImport}>
              {t('menu.importImage')}
            </MenubarItem>
            <MenubarItem disabled={!isCanvasCreated} onClick={onExport}>
              {t('menu.exportImage')}
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        {/* Edit Menu */}
        <MenubarMenu>
          <MenubarTrigger>{t('menu.edit')}</MenubarTrigger>
          <MenubarContent>
            <MenubarItem disabled={!isCanvasCreated || !canUndo} onClick={onUndo}>
              {t('menu.undo')}
              <MenubarShortcut>{modifier}+Z</MenubarShortcut>
            </MenubarItem>
            <MenubarItem disabled={!isCanvasCreated || !canRedo} onClick={onRedo}>
              {t('menu.redo')}
              <MenubarShortcut>{modifier}+Shift+Z</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem disabled={!isCanvasCreated} onClick={onClear}>
              {t('menu.clear')}
              <MenubarShortcut>{modifier}+Del</MenubarShortcut>
            </MenubarItem>
            <MenubarItem disabled={!isCanvasCreated} onClick={onFlipHorizontal}>
              {t('menu.flipHorizontal')}
              <MenubarShortcut>{modifier}+H</MenubarShortcut>
            </MenubarItem>
            <MenubarItem disabled={!isCanvasCreated} onClick={onFlipVertical}>
              {t('menu.flipVertical')}
              <MenubarShortcut>{modifier}+Shift+H</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem disabled={!isCanvasCreated} onClick={onCanvasSize}>
              {t('menu.canvasSize')}
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem disabled={!isCanvasCreated} onClick={onSelectAll}>
              {t('menu.selectAll')}
              <MenubarShortcut>{modifier}+A</MenubarShortcut>
            </MenubarItem>
            <MenubarItem disabled={!isCanvasCreated || !hasSelection} onClick={onDeselect}>
              {t('menu.deselect')}
              <MenubarShortcut>{modifier}+D</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem disabled={!isCanvasCreated || !hasSelection} onClick={onCut}>
              {t('menu.cut')}
              <MenubarShortcut>{modifier}+X</MenubarShortcut>
            </MenubarItem>
            <MenubarItem disabled={!isCanvasCreated || !hasSelection} onClick={onCopy}>
              {t('menu.copy')}
              <MenubarShortcut>{modifier}+C</MenubarShortcut>
            </MenubarItem>
            <MenubarItem disabled={!isCanvasCreated || !hasClipboard} onClick={onPaste}>
              {t('menu.paste')}
              <MenubarShortcut>{modifier}+V</MenubarShortcut>
            </MenubarItem>
            <MenubarItem disabled={!isCanvasCreated || !hasSelection} onClick={onDelete}>
              {t('menu.delete')}
              <MenubarShortcut>Del</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        {/* View Menu */}
        <MenubarMenu>
          <MenubarTrigger>{t('menu.view')}</MenubarTrigger>
          <MenubarContent>
            <MenubarItem disabled={!isCanvasCreated} onClick={onZoomIn}>
              {t('menu.zoomIn')}
              <MenubarShortcut>{modifier}++</MenubarShortcut>
            </MenubarItem>
            <MenubarItem disabled={!isCanvasCreated} onClick={onZoomOut}>
              {t('menu.zoomOut')}
              <MenubarShortcut>{modifier}+-</MenubarShortcut>
            </MenubarItem>
            <MenubarItem disabled={!isCanvasCreated} onClick={onZoomReset}>
              {t('menu.zoomReset')}
              <MenubarShortcut>{modifier}+0</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem disabled={!isCanvasCreated} onClick={onCenterCanvas}>
              {t('menu.centerCanvas')}
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        {/* Settings Menu */}
        <MenubarMenu>
          <MenubarTrigger>{t('menu.settings')}</MenubarTrigger>
          <MenubarContent>
            {/* Language submenu */}
            <MenubarSub>
              <MenubarSubTrigger>{t('menu.language')}</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem onClick={() => setLocale('ja')}>
                  <span className="size-4 mr-2 flex items-center justify-center">
                    {locale === 'ja' && <Check className="size-4" />}
                  </span>
                  {t('menu.japanese')}
                </MenubarItem>
                <MenubarItem onClick={() => setLocale('en')}>
                  <span className="size-4 mr-2 flex items-center justify-center">
                    {locale === 'en' && <Check className="size-4" />}
                  </span>
                  {t('menu.english')}
                </MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
            {/* Theme submenu */}
            <MenubarSub>
              <MenubarSubTrigger>{t('menu.theme')}</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem onClick={() => setTheme('light')}>
                  <span className="size-4 mr-2 flex items-center justify-center">
                    {!isDark && <Check className="size-4" />}
                  </span>
                  {t('menu.light')}
                </MenubarItem>
                <MenubarItem onClick={() => setTheme('dark')}>
                  <span className="size-4 mr-2 flex items-center justify-center">
                    {isDark && <Check className="size-4" />}
                  </span>
                  {t('menu.dark')}
                </MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
          </MenubarContent>
        </MenubarMenu>

        {/* Help Menu */}
        <MenubarMenu>
          <MenubarTrigger className="relative">
            {t('menu.help')}
            {needRefresh && (
              <Circle className="size-2 fill-red-500 text-red-500 absolute -top-0.5 -right-0.5" />
            )}
          </MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={checkForUpdate}>
              {t('menu.checkForUpdates')}
              {needRefresh && (
                <span className="ml-2 text-xs text-red-500">({t('menu.updateAvailable')})</span>
              )}
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </>
  )
})
