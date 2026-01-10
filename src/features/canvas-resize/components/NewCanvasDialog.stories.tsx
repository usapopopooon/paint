import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within, fireEvent } from 'storybook/test'
import { NewCanvasDialog } from './NewCanvasDialog'
import { i18nEn } from '@/test/i18n'
import {
  DEFAULT_CANVAS_WIDTH,
  DEFAULT_CANVAS_HEIGHT,
  MIN_CANVAS_SIZE,
  MAX_CANVAS_SIZE,
} from '../constants'

const meta = {
  title: 'Features/CanvasResize/NewCanvasDialog',
  component: NewCanvasDialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    open: true,
    onOpenChange: fn(),
    onCreate: fn(),
  },
} satisfies Meta<typeof NewCanvasDialog>

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
    const title = body.getByText(i18nEn.t('canvas.new'))
    await expect(title).toBeVisible()

    // 幅・高さ入力フィールドがデフォルト値で表示されていることを確認
    const widthInput = body.getByDisplayValue(String(DEFAULT_CANVAS_WIDTH))
    const heightInput = body.getByDisplayValue(String(DEFAULT_CANVAS_HEIGHT))
    await expect(widthInput).toBeVisible()
    await expect(heightInput).toBeVisible()

    // 作成ボタンとキャンセルボタンが表示されていることを確認
    const createButton = body.getByRole('button', { name: i18nEn.t('canvas.create') })
    const cancelButton = body.getByRole('button', { name: i18nEn.t('actions.cancel') })
    await expect(createButton).toBeEnabled()
    await expect(cancelButton).toBeEnabled()
  },
}

/**
 * サイズを変更して作成ボタンをクリック
 */
export const SubmitWithCustomSize: Story = {
  args: {
    onCreate: fn(),
  },
  play: async ({ args }) => {
    const body = within(document.body)

    // 幅を変更
    const widthInput = body.getByDisplayValue(String(DEFAULT_CANVAS_WIDTH))
    await userEvent.clear(widthInput)
    await userEvent.type(widthInput, '1024')

    // 高さを変更
    const heightInput = body.getByDisplayValue(String(DEFAULT_CANVAS_HEIGHT))
    await userEvent.clear(heightInput)
    await userEvent.type(heightInput, '768')

    // 作成ボタンをクリック
    const createButton = body.getByRole('button', { name: i18nEn.t('canvas.create') })
    await userEvent.click(createButton)

    // onCreateが正しい値で呼ばれることを確認
    await expect(args.onCreate).toHaveBeenCalledWith(1024, 768)
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
 * 最小値未満のエラー
 */
export const ValidationErrorTooSmall: Story = {
  play: async () => {
    const body = within(document.body)

    // 幅を最小値未満に変更
    const widthInput = body.getByDisplayValue(String(DEFAULT_CANVAS_WIDTH))
    await userEvent.clear(widthInput)
    await userEvent.type(widthInput, '10')

    // エラーメッセージが表示されることを確認
    const errorMessage = await body.findByText(
      i18nEn.t('canvas.sizeTooSmall', { min: MIN_CANVAS_SIZE })
    )
    await expect(errorMessage).toBeVisible()

    // 作成ボタンが無効になることを確認
    const createButton = body.getByRole('button', { name: i18nEn.t('canvas.create') })
    await expect(createButton).toBeDisabled()
  },
}

/**
 * 最大値超過のエラー
 */
export const ValidationErrorTooLarge: Story = {
  play: async () => {
    const body = within(document.body)

    // 幅を最大値超過に変更（fireEventを使用してonChangeを確実に発火）
    const widthInput = body.getByDisplayValue(String(DEFAULT_CANVAS_WIDTH)) as HTMLInputElement
    fireEvent.change(widthInput, { target: { value: '5000' } })

    // エラーメッセージが表示されることを確認
    const errorMessage = await body.findByText(
      i18nEn.t('canvas.sizeTooLarge', { max: MAX_CANVAS_SIZE })
    )
    await expect(errorMessage).toBeVisible()

    // 作成ボタンが無効になることを確認
    const createButton = body.getByRole('button', { name: i18nEn.t('canvas.create') })
    await expect(createButton).toBeDisabled()
  },
}

/**
 * 空入力で作成ボタンが無効
 */
export const EmptyInputDisablesSubmit: Story = {
  play: async () => {
    const body = within(document.body)

    // 幅を空にする
    const widthInput = body.getByDisplayValue(String(DEFAULT_CANVAS_WIDTH))
    await userEvent.clear(widthInput)

    // 作成ボタンが無効になることを確認
    const createButton = body.getByRole('button', { name: i18nEn.t('canvas.create') })
    await expect(createButton).toBeDisabled()
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
