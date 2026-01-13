import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn, expect, userEvent, within } from 'storybook/test'
import { SaveImageDialog } from './SaveImageDialog'
import { i18nEn } from '@/test/i18n'

/**
 * SaveImageDialogコンポーネント
 * 画像保存時のファイル名・フォーマット・オプション設定ダイアログ
 */
const meta = {
  title: 'Features/Export/SaveImageDialog',
  component: SaveImageDialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    open: true,
    onOpenChange: fn(),
    onSave: fn(),
  },
} satisfies Meta<typeof SaveImageDialog>

export default meta
type Story = StoryObj<typeof meta>

/**
 * デフォルト状態（PNG形式）
 */
export const Default: Story = {
  play: async () => {
    const body = within(document.body)
    // ダイアログタイトルが表示されることを確認
    await expect(body.getByText(i18nEn.t('export.saveDialog.title'))).toBeInTheDocument()
    // フォーマット選択が表示されることを確認
    await expect(body.getByText(i18nEn.t('export.saveDialog.format'))).toBeInTheDocument()
    // スケール選択が表示されることを確認
    await expect(body.getByText(i18nEn.t('export.saveDialog.scale'))).toBeInTheDocument()
    // 背景オプションが表示されることを確認（PNGのため）
    await expect(
      body.getByText(i18nEn.t('export.saveDialog.includeBackground'))
    ).toBeInTheDocument()
  },
}

/**
 * JPG形式を選択
 */
export const JpgFormat: Story = {
  play: async () => {
    const body = within(document.body)

    // フォーマットセレクトを開いてJPGを選択
    const formatTrigger = document.getElementById('image-format') as HTMLButtonElement
    await userEvent.click(formatTrigger)

    const jpgOption = body.getByRole('option', { name: 'JPG' })
    await userEvent.click(jpgOption)

    // 品質スライダーが表示されることを確認（JPGのため）
    await expect(body.getByText(i18nEn.t('export.saveDialog.quality'))).toBeInTheDocument()
  },
}

/**
 * 保存ボタンをクリック
 */
export const ClickSave: Story = {
  play: async ({ args }) => {
    const body = within(document.body)

    const saveButton = body.getByText(i18nEn.t('export.saveDialog.save'))
    await userEvent.click(saveButton)

    await expect(args.onSave).toHaveBeenCalledWith({
      fileName: i18nEn.t('export.saveDialog.defaultFileName'),
      format: 'png',
      scale: '100',
      includeBackground: false,
      jpegQuality: 92,
    })
  },
}

/**
 * キャンセルボタンをクリック
 */
export const ClickCancel: Story = {
  play: async ({ args }) => {
    const body = within(document.body)

    const cancelButton = body.getByText(i18nEn.t('actions.cancel'))
    await userEvent.click(cancelButton)

    await expect(args.onOpenChange).toHaveBeenCalledWith(false)
  },
}

/**
 * ファイル名を変更
 */
export const ChangeFileName: Story = {
  play: async ({ args }) => {
    const body = within(document.body)

    // ファイル名入力欄をクリアしてから入力
    const fileNameInput = document.getElementById('image-file-name') as HTMLInputElement
    await userEvent.clear(fileNameInput)
    await userEvent.type(fileNameInput, 'my-artwork', { delay: 10 })

    const saveButton = body.getByText(i18nEn.t('export.saveDialog.save'))
    await userEvent.click(saveButton)

    await expect(args.onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        fileName: 'my-artwork',
      })
    )
  },
}

/**
 * スケールを50%に変更
 */
export const ChangeScale: Story = {
  play: async ({ args }) => {
    const body = within(document.body)

    // スケールセレクトを開いて50%を選択
    const scaleTrigger = document.getElementById('image-scale') as HTMLButtonElement
    await userEvent.click(scaleTrigger)

    const scale50Option = body.getByRole('option', { name: '50%' })
    await userEvent.click(scale50Option)

    const saveButton = body.getByText(i18nEn.t('export.saveDialog.save'))
    await userEvent.click(saveButton)

    await expect(args.onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        scale: '50',
      })
    )
  },
}

/**
 * PNG形式で背景を含める
 */
export const PngWithBackground: Story = {
  play: async ({ args }) => {
    const body = within(document.body)

    // 背景スイッチをオンにする
    const backgroundSwitch = body.getByRole('switch')
    await userEvent.click(backgroundSwitch)

    const saveButton = body.getByText(i18nEn.t('export.saveDialog.save'))
    await userEvent.click(saveButton)

    await expect(args.onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        format: 'png',
        includeBackground: true,
      })
    )
  },
}

/**
 * JPG形式で品質を変更
 */
export const JpgWithQuality: Story = {
  play: async ({ args }) => {
    const body = within(document.body)

    // フォーマットセレクトを開いてJPGを選択
    const formatTrigger = document.getElementById('image-format') as HTMLButtonElement
    await userEvent.click(formatTrigger)

    const jpgOption = body.getByRole('option', { name: 'JPG' })
    await userEvent.click(jpgOption)

    // 品質スライダーが表示されることを確認
    await expect(body.getByText(i18nEn.t('export.saveDialog.quality'))).toBeInTheDocument()

    // 保存ボタンをクリック
    const saveButton = body.getByText(i18nEn.t('export.saveDialog.save'))
    await userEvent.click(saveButton)

    await expect(args.onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        format: 'jpg',
        jpegQuality: 92, // デフォルト値
      })
    )
  },
}

/**
 * ダイアログが閉じている状態
 */
export const Closed: Story = {
  args: {
    open: false,
  },
}
