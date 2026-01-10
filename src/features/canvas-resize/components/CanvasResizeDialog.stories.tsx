import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within, fireEvent } from 'storybook/test'
import { CanvasResizeDialog } from './CanvasResizeDialog'
import { i18nEn } from '@/test/i18n'
import { MIN_CANVAS_SIZE, MAX_CANVAS_SIZE } from '../constants'

const meta = {
  title: 'Features/CanvasResize/CanvasResizeDialog',
  component: CanvasResizeDialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    open: true,
    onOpenChange: fn(),
    width: 800,
    height: 600,
    anchor: 'center',
    onResize: fn(),
  },
} satisfies Meta<typeof CanvasResizeDialog>

export default meta
type Story = StoryObj<typeof meta>

/**
 * デフォルト表示
 */
export const Default: Story = {
  play: async () => {
    const body = within(document.body)

    // ダイアログが表示されていることを確認
    const dialog = body.getByRole('dialog')
    await expect(dialog).toBeVisible()

    // タイトルが表示されていることを確認
    const title = body.getByText(i18nEn.t('canvas.resize'))
    await expect(title).toBeVisible()

    // 幅・高さ入力フィールドが表示されていることを確認
    const widthInput = body.getByDisplayValue('800')
    const heightInput = body.getByDisplayValue('600')
    await expect(widthInput).toBeVisible()
    await expect(heightInput).toBeVisible()

    // OKボタンとキャンセルボタンが表示されていることを確認
    const okButton = body.getByRole('button', { name: i18nEn.t('actions.ok') })
    const cancelButton = body.getByRole('button', { name: i18nEn.t('actions.cancel') })
    await expect(okButton).toBeEnabled()
    await expect(cancelButton).toBeEnabled()
  },
}

/**
 * サイズを変更してOKボタンをクリック
 */
export const SubmitWithNewSize: Story = {
  args: {
    onResize: fn(),
  },
  play: async ({ args }) => {
    const body = within(document.body)

    // 幅を変更
    const widthInput = body.getByDisplayValue('800')
    await userEvent.clear(widthInput)
    await userEvent.type(widthInput, '1024')

    // 高さを変更
    const heightInput = body.getByDisplayValue('600')
    await userEvent.clear(heightInput)
    await userEvent.type(heightInput, '768')

    // OKボタンをクリック
    const okButton = body.getByRole('button', { name: i18nEn.t('actions.ok') })
    await userEvent.click(okButton)

    // onResizeが正しい値で呼ばれることを確認
    await expect(args.onResize).toHaveBeenCalledWith(1024, 768, 'center')
  },
}

/**
 * キャンセルボタンをクリック
 */
export const Cancel: Story = {
  args: {
    onOpenChange: fn(),
  },
  play: async ({ args }) => {
    const body = within(document.body)

    // キャンセルボタンをクリック
    const cancelButton = body.getByRole('button', { name: i18nEn.t('actions.cancel') })
    await userEvent.click(cancelButton)

    // onOpenChangeがfalseで呼ばれることを確認
    await expect(args.onOpenChange).toHaveBeenCalledWith(false)
  },
}

/**
 * アンカーを変更してリサイズ
 */
export const ChangeAnchor: Story = {
  args: {
    onResize: fn(),
  },
  play: async ({ args }) => {
    const body = within(document.body)

    // top-leftアンカーをクリック
    const topLeftButton = body.getByLabelText('top-left')
    await userEvent.click(topLeftButton)

    // OKボタンをクリック
    const okButton = body.getByRole('button', { name: i18nEn.t('actions.ok') })
    await userEvent.click(okButton)

    // onResizeがtop-leftアンカーで呼ばれることを確認
    await expect(args.onResize).toHaveBeenCalledWith(800, 600, 'top-left')
  },
}

/**
 * 最小値未満のエラー
 */
export const ValidationErrorTooSmall: Story = {
  play: async () => {
    const body = within(document.body)

    // 幅を最小値未満に変更
    const widthInput = body.getByDisplayValue('800')
    await userEvent.clear(widthInput)
    await userEvent.type(widthInput, '10')

    // エラーメッセージが表示されることを確認
    const errorMessage = await body.findByText(
      i18nEn.t('canvas.sizeTooSmall', { min: MIN_CANVAS_SIZE })
    )
    await expect(errorMessage).toBeVisible()

    // OKボタンが無効になることを確認
    const okButton = body.getByRole('button', { name: i18nEn.t('actions.ok') })
    await expect(okButton).toBeDisabled()
  },
}

/**
 * 最大値超過のエラー
 */
export const ValidationErrorTooLarge: Story = {
  play: async () => {
    const body = within(document.body)

    // 幅を最大値超過に変更（fireEventを使用してonChangeを確実に発火）
    const widthInput = body.getByDisplayValue('800') as HTMLInputElement
    fireEvent.change(widthInput, { target: { value: '5000' } })

    // エラーメッセージが表示されることを確認
    const errorMessage = await body.findByText(
      i18nEn.t('canvas.sizeTooLarge', { max: MAX_CANVAS_SIZE })
    )
    await expect(errorMessage).toBeVisible()

    // OKボタンが無効になることを確認
    const okButton = body.getByRole('button', { name: i18nEn.t('actions.ok') })
    await expect(okButton).toBeDisabled()
  },
}

/**
 * 空入力でOKボタンが無効
 */
export const EmptyInputDisablesSubmit: Story = {
  play: async () => {
    const body = within(document.body)

    // 幅を空にする
    const widthInput = body.getByDisplayValue('800')
    await userEvent.clear(widthInput)

    // OKボタンが無効になることを確認
    const okButton = body.getByRole('button', { name: i18nEn.t('actions.ok') })
    await expect(okButton).toBeDisabled()
  },
}

/**
 * top-leftアンカー
 */
export const TopLeft: Story = {
  args: {
    anchor: 'top-left',
  },
}

/**
 * bottom-rightアンカー
 */
export const BottomRight: Story = {
  args: {
    anchor: 'bottom-right',
  },
}

/**
 * 小さいキャンバス
 */
export const SmallCanvas: Story = {
  args: {
    width: 100,
    height: 100,
  },
}

/**
 * 大きいキャンバス
 */
export const LargeCanvas: Story = {
  args: {
    width: 4000,
    height: 3000,
  },
}

/**
 * 閉じた状態
 */
export const Closed: Story = {
  args: {
    open: false,
  },
}
