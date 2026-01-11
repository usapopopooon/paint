import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { ConfirmNewCanvasDialog } from './ConfirmNewCanvasDialog'
import { i18nEn } from '@/test/i18n'

const meta = {
  title: 'Features/CanvasResize/ConfirmNewCanvasDialog',
  component: ConfirmNewCanvasDialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ConfirmNewCanvasDialog>

export default meta
type Story = StoryObj<typeof ConfirmNewCanvasDialog>

const onOpenChangeFn = fn()
const onConfirmFn = fn()

export const Default: Story = {
  args: {
    open: true,
    onOpenChange: onOpenChangeFn,
    onConfirm: onConfirmFn,
  },
  play: async () => {
    const body = within(document.body)

    // ダイアログが表示されていることを確認
    const dialog = body.getByRole('alertdialog')
    await expect(dialog).toBeVisible()

    // タイトルが表示されていることを確認
    const title = body.getByText(i18nEn.t('canvas.confirmNew.title'))
    await expect(title).toBeVisible()

    // 説明文が表示されていることを確認
    const description = body.getByText(i18nEn.t('canvas.confirmNew.description'))
    await expect(description).toBeVisible()

    // キャンセルボタンが表示されていることを確認
    const cancelButton = body.getByRole('button', {
      name: i18nEn.t('actions.cancel'),
    })
    await expect(cancelButton).toBeEnabled()

    // 確認ボタンが表示されていることを確認
    const confirmButton = body.getByRole('button', {
      name: i18nEn.t('canvas.confirmNew.confirm'),
    })
    await expect(confirmButton).toBeEnabled()
  },
}

export const ClickConfirm: Story = {
  args: {
    open: true,
    onOpenChange: fn(),
    onConfirm: fn(),
  },
  play: async ({ args }) => {
    const body = within(document.body)

    // 確認ボタンをクリック
    const confirmButton = body.getByRole('button', {
      name: i18nEn.t('canvas.confirmNew.confirm'),
    })
    await userEvent.click(confirmButton)

    // onConfirmが呼ばれたことを確認
    await expect(args.onConfirm).toHaveBeenCalledTimes(1)
  },
}

export const ClickCancel: Story = {
  args: {
    open: true,
    onOpenChange: fn(),
    onConfirm: fn(),
  },
  play: async ({ args }) => {
    const body = within(document.body)

    // キャンセルボタンをクリック
    const cancelButton = body.getByRole('button', {
      name: i18nEn.t('actions.cancel'),
    })
    await userEvent.click(cancelButton)

    // onOpenChangeがfalseで呼ばれたことを確認
    await expect(args.onOpenChange).toHaveBeenCalledWith(false)
  },
}

export const Closed: Story = {
  args: {
    open: false,
    onOpenChange: onOpenChangeFn,
    onConfirm: onConfirmFn,
  },
}
