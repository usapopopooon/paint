import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, within, userEvent } from 'storybook/test'
import { LoadToolStateDialog } from './LoadToolStateDialog'
import { i18nEn } from '@/test/i18n'

const meta = {
  title: 'Features/Project/LoadToolStateDialog',
  component: LoadToolStateDialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof LoadToolStateDialog>

export default meta
type Story = StoryObj<typeof LoadToolStateDialog>

const onConfirmFn = fn()
const onSkipFn = fn()

export const Default: Story = {
  args: {
    open: true,
    onConfirm: onConfirmFn,
    onSkip: onSkipFn,
  },
  play: async () => {
    const body = within(document.body)

    // ダイアログが表示されていることを確認
    const dialog = body.getByRole('alertdialog')
    await expect(dialog).toBeVisible()

    // タイトルが表示されていることを確認
    const title = body.getByText(i18nEn.t('project.loadToolState.title'))
    await expect(title).toBeVisible()

    // 説明が表示されていることを確認
    const description = body.getByText(i18nEn.t('project.loadToolState.description'))
    await expect(description).toBeVisible()

    // ツール設定復元のスイッチが表示されていることを確認
    const switchElement = body.getByRole('switch')
    await expect(switchElement).toBeVisible()

    // スイッチがデフォルトでオンになっていることを確認
    await expect(switchElement).toBeChecked()

    // 読み込みボタンが表示されていることを確認
    const confirmButton = body.getByRole('button', {
      name: i18nEn.t('project.loadToolState.confirm'),
    })
    await expect(confirmButton).toBeEnabled()

    // 読み込みボタンがフォーカスされていることを確認（autoFocus）
    await expect(confirmButton).toHaveFocus()

    // スキップボタンが表示されていることを確認
    const skipButton = body.getByRole('button', {
      name: i18nEn.t('project.loadToolState.skip'),
    })
    await expect(skipButton).toBeEnabled()
  },
}

export const ConfirmWithToolStateEnabled: Story = {
  args: {
    open: true,
    onConfirm: onConfirmFn,
    onSkip: onSkipFn,
  },
  play: async () => {
    const body = within(document.body)

    // 読み込みボタンをクリック（スイッチはデフォルトでオン）
    const confirmButton = body.getByRole('button', {
      name: i18nEn.t('project.loadToolState.confirm'),
    })
    await userEvent.click(confirmButton)

    // onConfirmがtrueで呼ばれたことを確認
    await expect(onConfirmFn).toHaveBeenCalledWith(true)
  },
}

export const ConfirmWithToolStateDisabled: Story = {
  args: {
    open: true,
    onConfirm: onConfirmFn,
    onSkip: onSkipFn,
  },
  play: async () => {
    const body = within(document.body)

    // スイッチをオフにする
    const switchElement = body.getByRole('switch')
    await userEvent.click(switchElement)

    // スイッチがオフになっていることを確認
    await expect(switchElement).not.toBeChecked()

    // 読み込みボタンをクリック
    const confirmButton = body.getByRole('button', {
      name: i18nEn.t('project.loadToolState.confirm'),
    })
    await userEvent.click(confirmButton)

    // onConfirmがfalseで呼ばれたことを確認
    await expect(onConfirmFn).toHaveBeenCalledWith(false)
  },
}

export const SkipClick: Story = {
  args: {
    open: true,
    onConfirm: onConfirmFn,
    onSkip: onSkipFn,
  },
  play: async () => {
    const body = within(document.body)

    // スキップボタンをクリック
    const skipButton = body.getByRole('button', {
      name: i18nEn.t('project.loadToolState.skip'),
    })
    await userEvent.click(skipButton)

    // onSkipが呼ばれたことを確認
    await expect(onSkipFn).toHaveBeenCalled()
  },
}

export const Closed: Story = {
  args: {
    open: false,
    onConfirm: onConfirmFn,
    onSkip: onSkipFn,
  },
}
