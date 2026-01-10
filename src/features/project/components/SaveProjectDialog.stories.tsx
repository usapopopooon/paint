import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { SaveProjectDialog } from './SaveProjectDialog'
import { i18nEn } from '@/test/i18n'

const meta = {
  title: 'Features/Project/SaveProjectDialog',
  component: SaveProjectDialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SaveProjectDialog>

export default meta
type Story = StoryObj<typeof SaveProjectDialog>

const onOpenChangeFn = fn()
const onSaveFn = fn()

export const Default: Story = {
  args: {
    open: true,
    onOpenChange: onOpenChangeFn,
    onSave: onSaveFn,
  },
  play: async () => {
    const body = within(document.body)

    // ダイアログが表示されていることを確認
    const dialog = body.getByRole('dialog')
    await expect(dialog).toBeVisible()

    // タイトルが表示されていることを確認
    const title = body.getByText(i18nEn.t('project.saveDialog.title'))
    await expect(title).toBeVisible()

    // ファイル名入力フィールドが表示されていることを確認
    const input = body.getByRole('textbox')
    await expect(input).toBeVisible()
    await expect(input).toHaveValue(i18nEn.t('project.saveDialog.defaultFileName'))

    // 拡張子が表示されていることを確認
    const extension = body.getByText('.usapo')
    await expect(extension).toBeVisible()

    // 保存ボタンが表示されていることを確認
    const saveButton = body.getByRole('button', {
      name: i18nEn.t('project.saveDialog.save'),
    })
    await expect(saveButton).toBeEnabled()

    // キャンセルボタンが表示されていることを確認
    const cancelButton = body.getByRole('button', {
      name: i18nEn.t('actions.cancel'),
    })
    await expect(cancelButton).toBeEnabled()
  },
}

export const SaveWithCustomName: Story = {
  args: {
    open: true,
    onOpenChange: onOpenChangeFn,
    onSave: fn(),
  },
  play: async ({ args }) => {
    const body = within(document.body)

    // ダイアログのアニメーション完了を待つ
    await new Promise((r) => setTimeout(r, 150))

    // ファイル名を変更
    const input = body.getByRole('textbox')
    // トリプルクリックで全選択してから入力
    await userEvent.tripleClick(input)
    await userEvent.keyboard('my-project')

    // 保存ボタンをクリック
    const saveButton = body.getByRole('button', {
      name: i18nEn.t('project.saveDialog.save'),
    })
    await userEvent.click(saveButton)

    // onSaveが呼ばれたことを確認
    await expect(args.onSave).toHaveBeenCalledWith('my-project')
  },
}

export const Closed: Story = {
  args: {
    open: false,
    onOpenChange: onOpenChangeFn,
    onSave: onSaveFn,
  },
}
