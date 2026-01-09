import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within, waitFor } from 'storybook/test'
import { ReloadPrompt } from './ReloadPrompt'
import { Toaster } from './sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './alert-dialog'

/**
 * ReloadPromptは、PWAの新しいバージョンが利用可能な場合に
 * トースト通知を表示し、ユーザーに更新を促すコンポーネントです。
 *
 * トーストの「更新」ボタンをクリックすると、確認ダイアログが表示され、
 * 保存していないデータが失われる可能性があることを警告します。
 */
const meta = {
  title: 'UI/ReloadPrompt',
  component: ReloadPrompt,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="min-h-[400px] p-4">
        <Toaster position="bottom-right" />
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ReloadPrompt>

export default meta
type Story = StoryObj<typeof meta>

/**
 * 通常状態 - 新しいバージョンがない場合は何も表示されません。
 */
export const Default: Story = {}

/**
 * 確認ダイアログ - 更新前の確認ダイアログを単独で表示します。
 * 保存していないデータが失われる警告を表示します。
 */
export const ConfirmDialog: Story = {
  render: () => (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="text-center text-muted-foreground">
        <p>確認ダイアログはトーストの「更新」ボタンをクリックすると表示されます。</p>
        <p className="mt-2 text-sm">
          実際の動作は、PWAの新しいバージョンが検出された時に
          <br />
          画面右下にトースト通知が表示されます。
        </p>
      </div>
    </div>
  ),
}

/**
 * AlertDialogコンポーネントのプレビュー
 */
export const AlertDialogPreview: Story = {
  render: () => (
    <AlertDialog open={true}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>アプリを更新しますか？</AlertDialogTitle>
          <AlertDialogDescription>
            保存していない作業内容は失われます。更新する前にプロジェクトを保存してください。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>キャンセル</AlertDialogCancel>
          <AlertDialogAction>更新する</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await waitFor(() => {
      expect(canvas.getByText('アプリを更新しますか？')).toBeInTheDocument()
    })

    expect(
      canvas.getByText(
        '保存していない作業内容は失われます。更新する前にプロジェクトを保存してください。'
      )
    ).toBeInTheDocument()
    expect(canvas.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument()
    expect(canvas.getByRole('button', { name: '更新する' })).toBeInTheDocument()
  },
}

const DialogCancelInteractionComponent = () => {
  const [open, setOpen] = useState(true)

  return (
    <>
      <div className="mb-4 p-4 bg-muted rounded">
        ダイアログ状態: {open ? '開いている' : '閉じている'}
      </div>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>アプリを更新しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              保存していない作業内容は失われます。更新する前にプロジェクトを保存してください。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction>更新する</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

/**
 * ダイアログのインタラクションテスト - キャンセルボタンのクリック
 */
export const DialogCancelInteraction: Story = {
  render: () => <DialogCancelInteractionComponent />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // ダイアログが開いていることを確認
    await waitFor(() => {
      expect(canvas.getByText('ダイアログ状態: 開いている')).toBeInTheDocument()
    })

    // キャンセルボタンをクリック
    const cancelButton = canvas.getByRole('button', { name: 'キャンセル' })
    await userEvent.click(cancelButton)

    // ダイアログが閉じたことを確認
    await waitFor(() => {
      expect(canvas.getByText('ダイアログ状態: 閉じている')).toBeInTheDocument()
    })
  },
}
