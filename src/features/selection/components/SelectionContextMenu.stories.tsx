import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn, expect, userEvent, within } from 'storybook/test'
import { SelectionContextMenu } from './SelectionContextMenu'
import { i18nEn } from '@/test/i18n'

/**
 * SelectionContextMenuコンポーネント
 * 選択領域に対するコンテキストメニュー（右クリックメニュー）
 */
const meta = {
  title: 'Features/Selection/SelectionContextMenu',
  component: SelectionContextMenu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    hasSelection: false,
    hasClipboard: false,
    onCut: fn(),
    onCopy: fn(),
    onPaste: fn(),
    onDelete: fn(),
    onDeselect: fn(),
    onSelectAll: fn(),
    showContextMenu: true,
    children: (
      <div
        style={{
          width: 200,
          height: 200,
          backgroundColor: '#eee',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px dashed #999',
        }}
      >
        Right-click here
      </div>
    ),
  },
} satisfies Meta<typeof SelectionContextMenu>

export default meta
type Story = StoryObj<typeof meta>

/**
 * デフォルト状態（選択なし）
 */
export const Default: Story = {}

/**
 * 選択領域がある状態
 */
export const WithSelection: Story = {
  args: {
    hasSelection: true,
  },
}

/**
 * クリップボードにデータがある状態
 */
export const WithClipboard: Story = {
  args: {
    hasClipboard: true,
  },
}

/**
 * 選択とクリップボード両方ある状態
 */
export const WithSelectionAndClipboard: Story = {
  args: {
    hasSelection: true,
    hasClipboard: true,
  },
}

/**
 * コンテキストメニューを開く
 */
export const OpenContextMenu: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByText('Right-click here')

    await userEvent.pointer({ keys: '[MouseRight]', target: trigger })

    const body = within(document.body)
    await expect(body.getByText(i18nEn.t('menu.cut'))).toBeInTheDocument()
    await expect(body.getByText(i18nEn.t('menu.copy'))).toBeInTheDocument()
    await expect(body.getByText(i18nEn.t('menu.paste'))).toBeInTheDocument()
    await expect(body.getByText(i18nEn.t('menu.delete'))).toBeInTheDocument()
    await expect(body.getByText(i18nEn.t('menu.selectAll'))).toBeInTheDocument()
    await expect(body.getByText(i18nEn.t('menu.deselect'))).toBeInTheDocument()
  },
}

/**
 * 全選択をクリック
 */
export const ClickSelectAll: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByText('Right-click here')

    await userEvent.pointer({ keys: '[MouseRight]', target: trigger })

    const body = within(document.body)
    const selectAllItem = body.getByText(i18nEn.t('menu.selectAll'))
    await userEvent.click(selectAllItem)

    await expect(args.onSelectAll).toHaveBeenCalled()
  },
}

/**
 * 切り取りをクリック（選択あり）
 */
export const ClickCut: Story = {
  args: {
    hasSelection: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByText('Right-click here')

    await userEvent.pointer({ keys: '[MouseRight]', target: trigger })

    const body = within(document.body)
    const cutItem = body.getByText(i18nEn.t('menu.cut'))
    await userEvent.click(cutItem)

    await expect(args.onCut).toHaveBeenCalled()
  },
}

/**
 * コピーをクリック（選択あり）
 */
export const ClickCopy: Story = {
  args: {
    hasSelection: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByText('Right-click here')

    await userEvent.pointer({ keys: '[MouseRight]', target: trigger })

    const body = within(document.body)
    const copyItem = body.getByText(i18nEn.t('menu.copy'))
    await userEvent.click(copyItem)

    await expect(args.onCopy).toHaveBeenCalled()
  },
}

/**
 * 貼り付けをクリック（クリップボードあり）
 */
export const ClickPaste: Story = {
  args: {
    hasClipboard: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByText('Right-click here')

    await userEvent.pointer({ keys: '[MouseRight]', target: trigger })

    const body = within(document.body)
    const pasteItem = body.getByText(i18nEn.t('menu.paste'))
    await userEvent.click(pasteItem)

    await expect(args.onPaste).toHaveBeenCalled()
  },
}

/**
 * 削除をクリック（選択あり）
 */
export const ClickDelete: Story = {
  args: {
    hasSelection: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByText('Right-click here')

    await userEvent.pointer({ keys: '[MouseRight]', target: trigger })

    const body = within(document.body)
    const deleteItem = body.getByText(i18nEn.t('menu.delete'))
    await userEvent.click(deleteItem)

    await expect(args.onDelete).toHaveBeenCalled()
  },
}

/**
 * 選択解除をクリック（選択あり）
 */
export const ClickDeselect: Story = {
  args: {
    hasSelection: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByText('Right-click here')

    await userEvent.pointer({ keys: '[MouseRight]', target: trigger })

    const body = within(document.body)
    const deselectItem = body.getByText(i18nEn.t('menu.deselect'))
    await userEvent.click(deselectItem)

    await expect(args.onDeselect).toHaveBeenCalled()
  },
}

/**
 * コンテキストメニューを表示しない（showContextMenu=false）
 */
export const HiddenContextMenu: Story = {
  args: {
    showContextMenu: false,
  },
}

/**
 * 矩形選択時の切り抜きメニュー
 */
export const WithCropToSelection: Story = {
  args: {
    hasSelection: true,
    isRectangleSelection: true,
    onCropToSelection: fn(),
  },
}

/**
 * 切り抜きをクリック（矩形選択あり）
 */
export const ClickCropToSelection: Story = {
  args: {
    hasSelection: true,
    isRectangleSelection: true,
    onCropToSelection: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByText('Right-click here')

    await userEvent.pointer({ keys: '[MouseRight]', target: trigger })

    const body = within(document.body)
    const cropItem = body.getByText(i18nEn.t('menu.cropToSelection'))
    await userEvent.click(cropItem)

    await expect(args.onCropToSelection).toHaveBeenCalled()
  },
}

/**
 * Lasso選択時は切り抜きが無効
 */
export const CropDisabledForLasso: Story = {
  args: {
    hasSelection: true,
    isRectangleSelection: false,
    onCropToSelection: fn(),
  },
}
