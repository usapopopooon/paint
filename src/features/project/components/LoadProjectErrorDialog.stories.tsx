import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, within } from 'storybook/test'
import { z } from 'zod'
import { LoadProjectErrorDialog } from './LoadProjectErrorDialog'
import { getTranslation } from '@/features/i18n/infrastructure/locales/getTranslation'

const meta = {
  title: 'Features/Project/LoadProjectErrorDialog',
  component: LoadProjectErrorDialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof LoadProjectErrorDialog>

export default meta
type Story = StoryObj<typeof LoadProjectErrorDialog>

const onOpenChangeFn = fn()

export const ParseError: Story = {
  args: {
    open: true,
    onOpenChange: onOpenChangeFn,
    error: { type: 'parse_error' },
  },
  play: async () => {
    const body = within(document.body)

    // ダイアログが表示されていることを確認
    const dialog = body.getByRole('alertdialog')
    await expect(dialog).toBeVisible()

    // タイトルが表示されていることを確認
    const title = body.getByText(getTranslation('en', 'project.loadError.title'))
    await expect(title).toBeVisible()

    // エラーメッセージが表示されていることを確認
    const description = body.getByText(getTranslation('en', 'project.loadError.parseError'))
    await expect(description).toBeVisible()

    // OKボタンが表示されていることを確認
    const okButton = body.getByRole('button', {
      name: getTranslation('en', 'actions.ok'),
    })
    await expect(okButton).toBeEnabled()
  },
}

export const UnsupportedVersion: Story = {
  args: {
    open: true,
    onOpenChange: onOpenChangeFn,
    error: { type: 'unsupported_version', fileVersion: 2 },
  },
  play: async () => {
    const body = within(document.body)

    // エラーメッセージが表示されていることを確認
    const description = body.getByText(getTranslation('en', 'project.loadError.unsupportedVersion'))
    await expect(description).toBeVisible()

    // バージョン情報が表示されていることを確認
    const versionInfo = body.getByText('File version: 2')
    await expect(versionInfo).toBeVisible()
  },
}

// Zodエラーを作成するヘルパー
const createZodError = (): z.ZodError => {
  const schema = z.object({
    version: z.number(),
    name: z.string().min(1),
  })
  const result = schema.safeParse({ version: 'invalid', name: '' })
  if (!result.success) {
    return result.error
  }
  throw new Error('Expected validation to fail')
}

export const InvalidFormat: Story = {
  args: {
    open: true,
    onOpenChange: onOpenChangeFn,
    error: { type: 'invalid_format', zodError: createZodError() },
  },
  play: async () => {
    const body = within(document.body)

    // エラーメッセージが表示されていることを確認
    const description = body.getByText(getTranslation('en', 'project.loadError.invalidFormat'))
    await expect(description).toBeVisible()

    // Zodエラー詳細がpre要素に表示されていることを確認
    const dialog = body.getByRole('alertdialog')
    const details = dialog.querySelector('pre')
    await expect(details).toBeInTheDocument()
  },
}

export const Closed: Story = {
  args: {
    open: false,
    onOpenChange: onOpenChangeFn,
    error: null,
  },
}
