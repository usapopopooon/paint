import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, within, userEvent } from 'storybook/test'
import { RecoveryDialog } from './RecoveryDialog'
import { i18nEn } from '@/test/i18n'

const meta = {
  title: 'Features/Project/RecoveryDialog',
  component: RecoveryDialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof RecoveryDialog>

export default meta
type Story = StoryObj<typeof RecoveryDialog>

const onRestoreFn = fn()
const onDiscardFn = fn()

export const Default: Story = {
  args: {
    open: true,
    savedAt: Date.now() - 1000 * 60 * 5, // 5分前
    onRestore: onRestoreFn,
    onDiscard: onDiscardFn,
  },
  play: async () => {
    const body = within(document.body)

    // ダイアログが表示されていることを確認
    const dialog = body.getByRole('alertdialog')
    await expect(dialog).toBeVisible()

    // タイトルが表示されていることを確認
    const title = body.getByText(i18nEn.t('recovery.title'))
    await expect(title).toBeVisible()

    // 説明が表示されていることを確認
    const description = body.getByText(i18nEn.t('recovery.description'))
    await expect(description).toBeVisible()

    // 復元ボタンが表示されていることを確認
    const restoreButton = body.getByRole('button', {
      name: i18nEn.t('recovery.restore'),
    })
    await expect(restoreButton).toBeEnabled()

    // 復元ボタンがフォーカスされていることを確認（autoFocus）
    await expect(restoreButton).toHaveFocus()

    // 破棄ボタンが表示されていることを確認
    const discardButton = body.getByRole('button', {
      name: i18nEn.t('recovery.discard'),
    })
    await expect(discardButton).toBeEnabled()
  },
}

export const WithSavedAtDate: Story = {
  args: {
    open: true,
    savedAt: new Date('2024-01-15T10:30:00').getTime(),
    onRestore: onRestoreFn,
    onDiscard: onDiscardFn,
  },
  play: async () => {
    const body = within(document.body)

    // 保存日時が表示されていることを確認
    const dialog = body.getByRole('alertdialog')
    await expect(dialog).toHaveTextContent(/Saved at/)
  },
}

export const RestoreClick: Story = {
  args: {
    open: true,
    savedAt: Date.now(),
    onRestore: onRestoreFn,
    onDiscard: onDiscardFn,
  },
  play: async () => {
    const body = within(document.body)

    // 復元ボタンをクリック
    const restoreButton = body.getByRole('button', {
      name: i18nEn.t('recovery.restore'),
    })
    await userEvent.click(restoreButton)

    // onRestoreが呼ばれたことを確認
    await expect(onRestoreFn).toHaveBeenCalled()
  },
}

export const DiscardClick: Story = {
  args: {
    open: true,
    savedAt: Date.now(),
    onRestore: onRestoreFn,
    onDiscard: onDiscardFn,
  },
  play: async () => {
    const body = within(document.body)

    // 破棄ボタンをクリック
    const discardButton = body.getByRole('button', {
      name: i18nEn.t('recovery.discard'),
    })
    await userEvent.click(discardButton)

    // onDiscardが呼ばれたことを確認
    await expect(onDiscardFn).toHaveBeenCalled()
  },
}

export const WithoutSavedAt: Story = {
  args: {
    open: true,
    savedAt: null,
    onRestore: onRestoreFn,
    onDiscard: onDiscardFn,
  },
  play: async () => {
    const body = within(document.body)

    // 保存日時が表示されていないことを確認
    const dialog = body.getByRole('alertdialog')
    await expect(dialog).not.toHaveTextContent(/Saved at/)
  },
}

export const Closed: Story = {
  args: {
    open: false,
    savedAt: null,
    onRestore: onRestoreFn,
    onDiscard: onDiscardFn,
  },
}
