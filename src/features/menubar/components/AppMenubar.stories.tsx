import { useRef } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn, expect, userEvent, within } from 'storybook/test'
import { AppMenubar, type AppMenubarProps } from './AppMenubar'
import { i18nEn } from '@/test/i18n'

/**
 * ラッパーコンポーネント（RefObjectを内部で管理）
 */
const AppMenubarWrapper = (props: Omit<AppMenubarProps, 'projectInputRef' | 'importInputRef'>) => {
  const projectInputRef = useRef<HTMLInputElement>(null)
  const importInputRef = useRef<HTMLInputElement>(null)
  return <AppMenubar {...props} projectInputRef={projectInputRef} importInputRef={importInputRef} />
}

/**
 * AppMenubarコンポーネント
 * アプリケーションのメニューバー（File, Edit, View, Settings）
 */
const meta = {
  title: 'Features/Menubar/AppMenubar',
  component: AppMenubarWrapper,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  args: {
    // File menu
    onNewCanvas: fn(),
    onOpenProject: fn(),
    onProjectFileChange: fn(),
    onSaveProject: fn(),
    onImport: fn(),
    onImportFileChange: fn(),
    onExport: fn(),
    isCanvasCreated: true,
    // Edit menu
    canUndo: false,
    canRedo: false,
    onUndo: fn(),
    onRedo: fn(),
    onClear: fn(),
    onFlipHorizontal: fn(),
    onFlipVertical: fn(),
    onCanvasSize: fn(),
    // Selection
    hasSelection: false,
    hasClipboard: false,
    onSelectAll: fn(),
    onDeselect: fn(),
    onCut: fn(),
    onCopy: fn(),
    onPaste: fn(),
    onDelete: fn(),
    // View menu
    onZoomIn: fn(),
    onZoomOut: fn(),
    onZoomReset: fn(),
    onCenterCanvas: fn(),
  },
} satisfies Meta<typeof AppMenubarWrapper>

export default meta
type Story = StoryObj<typeof meta>

/**
 * デフォルト状態
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // メニュートリガーが存在することを確認
    await expect(canvas.getByText(i18nEn.t('menu.file'))).toBeInTheDocument()
    await expect(canvas.getByText(i18nEn.t('menu.edit'))).toBeInTheDocument()
    await expect(canvas.getByText(i18nEn.t('menu.view'))).toBeInTheDocument()
    await expect(canvas.getByText(i18nEn.t('menu.settings'))).toBeInTheDocument()
    await expect(canvas.getByText(i18nEn.t('menu.help'))).toBeInTheDocument()
  },
}

/**
 * Fileメニューを開く
 */
export const OpenFileMenu: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const fileMenu = canvas.getByText(i18nEn.t('menu.file'))

    await userEvent.click(fileMenu)

    // メニューアイテムが表示されることを確認
    const body = within(document.body)
    await expect(body.getByText(i18nEn.t('menu.newCanvas'))).toBeInTheDocument()
    await expect(body.getByText(i18nEn.t('menu.openProject'))).toBeInTheDocument()
    await expect(body.getByText(i18nEn.t('menu.saveProject'))).toBeInTheDocument()
    await expect(body.getByText(i18nEn.t('menu.importImage'))).toBeInTheDocument()
    await expect(body.getByText(i18nEn.t('menu.exportImage'))).toBeInTheDocument()
  },
}

/**
 * 新規キャンバスをクリック
 */
export const ClickNewCanvas: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const fileMenu = canvas.getByText(i18nEn.t('menu.file'))

    await userEvent.click(fileMenu)

    const body = within(document.body)
    const newCanvasItem = body.getByText(i18nEn.t('menu.newCanvas'))
    await userEvent.click(newCanvasItem)

    await expect(args.onNewCanvas).toHaveBeenCalled()
  },
}

/**
 * Editメニューを開く
 */
export const OpenEditMenu: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const editMenu = canvas.getByText(i18nEn.t('menu.edit'))

    await userEvent.click(editMenu)

    // メニューアイテムが表示されることを確認
    const body = within(document.body)
    await expect(body.getByText(i18nEn.t('menu.undo'))).toBeInTheDocument()
    await expect(body.getByText(i18nEn.t('menu.redo'))).toBeInTheDocument()
    await expect(body.getByText(i18nEn.t('menu.clear'))).toBeInTheDocument()
    await expect(body.getByText(i18nEn.t('menu.flipHorizontal'))).toBeInTheDocument()
    await expect(body.getByText(i18nEn.t('menu.canvasSize'))).toBeInTheDocument()
    await expect(body.getByText(i18nEn.t('menu.selectAll'))).toBeInTheDocument()
    await expect(body.getByText(i18nEn.t('menu.deselect'))).toBeInTheDocument()
    await expect(body.getByText(i18nEn.t('menu.cut'))).toBeInTheDocument()
    await expect(body.getByText(i18nEn.t('menu.copy'))).toBeInTheDocument()
    await expect(body.getByText(i18nEn.t('menu.paste'))).toBeInTheDocument()
    await expect(body.getByText(i18nEn.t('menu.delete'))).toBeInTheDocument()
  },
}

/**
 * Viewメニューを開く
 */
export const OpenViewMenu: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const viewMenu = canvas.getByText(i18nEn.t('menu.view'))

    await userEvent.click(viewMenu)

    // メニューアイテムが表示されることを確認
    const body = within(document.body)
    await expect(body.getByText(i18nEn.t('menu.zoomIn'))).toBeInTheDocument()
    await expect(body.getByText(i18nEn.t('menu.zoomOut'))).toBeInTheDocument()
    await expect(body.getByText(i18nEn.t('menu.zoomReset'))).toBeInTheDocument()
    await expect(body.getByText(i18nEn.t('menu.centerCanvas'))).toBeInTheDocument()
  },
}

/**
 * Settingsメニューを開く
 */
export const OpenSettingsMenu: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const settingsMenu = canvas.getByText(i18nEn.t('menu.settings'))

    await userEvent.click(settingsMenu)

    // サブメニューのトリガーが表示されることを確認
    const body = within(document.body)
    await expect(body.getByText(i18nEn.t('menu.language'))).toBeInTheDocument()
    await expect(body.getByText(i18nEn.t('menu.theme'))).toBeInTheDocument()
  },
}

/**
 * Undo/Redoが有効な状態
 */
export const WithUndoRedoEnabled: Story = {
  args: {
    canUndo: true,
    canRedo: true,
  },
}

/**
 * 選択がある状態
 */
export const WithSelection: Story = {
  args: {
    hasSelection: true,
    hasClipboard: true,
  },
}

/**
 * Undoをクリック
 */
export const ClickUndo: Story = {
  args: {
    canUndo: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const editMenu = canvas.getByText(i18nEn.t('menu.edit'))

    await userEvent.click(editMenu)

    const body = within(document.body)
    const undoItem = body.getByText(i18nEn.t('menu.undo'))
    await userEvent.click(undoItem)

    await expect(args.onUndo).toHaveBeenCalled()
  },
}

/**
 * Redoをクリック
 */
export const ClickRedo: Story = {
  args: {
    canRedo: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const editMenu = canvas.getByText(i18nEn.t('menu.edit'))

    await userEvent.click(editMenu)

    const body = within(document.body)
    const redoItem = body.getByText(i18nEn.t('menu.redo'))
    await userEvent.click(redoItem)

    await expect(args.onRedo).toHaveBeenCalled()
  },
}

/**
 * Exportをクリック
 */
export const ClickExport: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const fileMenu = canvas.getByText(i18nEn.t('menu.file'))

    await userEvent.click(fileMenu)

    const body = within(document.body)
    const exportItem = body.getByText(i18nEn.t('menu.exportImage'))
    await userEvent.click(exportItem)

    await expect(args.onExport).toHaveBeenCalled()
  },
}

/**
 * Zoom Inをクリック
 */
export const ClickZoomIn: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const viewMenu = canvas.getByText(i18nEn.t('menu.view'))

    await userEvent.click(viewMenu)

    const body = within(document.body)
    const zoomInItem = body.getByText(i18nEn.t('menu.zoomIn'))
    await userEvent.click(zoomInItem)

    await expect(args.onZoomIn).toHaveBeenCalled()
  },
}

/**
 * Select Allをクリック
 */
export const ClickSelectAll: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const editMenu = canvas.getByText(i18nEn.t('menu.edit'))

    await userEvent.click(editMenu)

    const body = within(document.body)
    const selectAllItem = body.getByText(i18nEn.t('menu.selectAll'))
    await userEvent.click(selectAllItem)

    await expect(args.onSelectAll).toHaveBeenCalled()
  },
}

/**
 * Cutをクリック（選択がある状態）
 */
export const ClickCut: Story = {
  args: {
    hasSelection: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const editMenu = canvas.getByText(i18nEn.t('menu.edit'))

    await userEvent.click(editMenu)

    const body = within(document.body)
    const cutItem = body.getByText(i18nEn.t('menu.cut'))
    await userEvent.click(cutItem)

    await expect(args.onCut).toHaveBeenCalled()
  },
}

/**
 * Pasteをクリック（クリップボードがある状態）
 */
export const ClickPaste: Story = {
  args: {
    hasClipboard: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const editMenu = canvas.getByText(i18nEn.t('menu.edit'))

    await userEvent.click(editMenu)

    const body = within(document.body)
    const pasteItem = body.getByText(i18nEn.t('menu.paste'))
    await userEvent.click(pasteItem)

    await expect(args.onPaste).toHaveBeenCalled()
  },
}

/**
 * 塗りつぶしメニューあり
 */
export const WithFillSelection: Story = {
  args: {
    hasSelection: true,
    onFillSelection: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const editMenu = canvas.getByText(i18nEn.t('menu.edit'))

    await userEvent.click(editMenu)

    const body = within(document.body)
    await expect(body.getByText(i18nEn.t('menu.fillSelection'))).toBeInTheDocument()
  },
}

/**
 * 塗りつぶしをクリック（選択がある状態）
 */
export const ClickFillSelection: Story = {
  args: {
    hasSelection: true,
    onFillSelection: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const editMenu = canvas.getByText(i18nEn.t('menu.edit'))

    await userEvent.click(editMenu)

    const body = within(document.body)
    const fillItem = body.getByText(i18nEn.t('menu.fillSelection'))
    await userEvent.click(fillItem)

    await expect(args.onFillSelection).toHaveBeenCalled()
  },
}

/**
 * 切り抜きメニューあり（矩形選択時）
 */
export const WithCropToSelection: Story = {
  args: {
    hasSelection: true,
    isRectangleSelection: true,
    onCropToSelection: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const editMenu = canvas.getByText(i18nEn.t('menu.edit'))

    await userEvent.click(editMenu)

    const body = within(document.body)
    await expect(body.getByText(i18nEn.t('menu.cropToSelection'))).toBeInTheDocument()
  },
}

/**
 * 切り抜きをクリック（矩形選択時）
 */
export const ClickCropToSelection: Story = {
  args: {
    hasSelection: true,
    isRectangleSelection: true,
    onCropToSelection: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const editMenu = canvas.getByText(i18nEn.t('menu.edit'))

    await userEvent.click(editMenu)

    const body = within(document.body)
    const cropItem = body.getByText(i18nEn.t('menu.cropToSelection'))
    await userEvent.click(cropItem)

    await expect(args.onCropToSelection).toHaveBeenCalled()
  },
}

/**
 * キャンバス未作成状態（編集・保存系メニューが無効化）
 */
export const NoCanvasCreated: Story = {
  args: {
    isCanvasCreated: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Fileメニューを開いて保存・エクスポートが無効化されていることを確認
    const fileMenu = canvas.getByText(i18nEn.t('menu.file'))
    await userEvent.click(fileMenu)

    const body = within(document.body)
    const saveItem = body.getByText(i18nEn.t('menu.saveProject'))
    const exportItem = body.getByText(i18nEn.t('menu.exportImage'))

    await expect(saveItem).toHaveAttribute('data-disabled')
    await expect(exportItem).toHaveAttribute('data-disabled')
  },
}

/**
 * Helpメニューを開く
 */
export const OpenHelpMenu: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const helpMenu = canvas.getByText(i18nEn.t('menu.help'))

    await userEvent.click(helpMenu)

    // メニューアイテムが表示されることを確認
    const body = within(document.body)
    await expect(body.getByText(i18nEn.t('menu.checkForUpdates'))).toBeInTheDocument()
  },
}

/**
 * 更新を確認をクリック（更新なしダイアログ表示）
 */
export const ClickCheckForUpdatesNoUpdate: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const helpMenu = canvas.getByText(i18nEn.t('menu.help'))

    await userEvent.click(helpMenu)

    const body = within(document.body)
    const checkForUpdatesItem = body.getByText(i18nEn.t('menu.checkForUpdates'))
    await userEvent.click(checkForUpdatesItem)

    // 更新なしダイアログが表示される
    await expect(body.getByText(i18nEn.t('pwa.noUpdate.title'))).toBeInTheDocument()
    await expect(body.getByText(i18nEn.t('pwa.noUpdate.description'))).toBeInTheDocument()
  },
}
