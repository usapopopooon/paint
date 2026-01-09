import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within, waitFor } from 'storybook/test'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

/**
 * ReloadPromptは、PWAの新しいバージョンが利用可能な場合に
 * トースト通知を表示し、ユーザーに更新を促すコンポーネントです。
 *
 * トーストの「更新」ボタンをクリックすると、確認ダイアログが表示され、
 * 保存していないデータが失われる可能性があることを警告します。
 */
const meta = {
  title: 'Features/PWA/ReloadPrompt',
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
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/**
 * トースト通知のプレビュー
 * ボタンをクリックするとPWA更新通知と同じスタイルのトーストが表示されます。
 */
export const ToastPreview: Story = {
  render: () => {
    const showToast = () => {
      toast('新しいバージョンが利用可能です', {
        description: 'アプリを更新して最新機能をご利用ください。',
        duration: Infinity,
        action: {
          label: '更新',
          onClick: () => {
            // トーストを閉じるだけ
          },
        },
        onDismiss: () => {
          // 閉じた時の処理
        },
      })
    }

    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Button onClick={showToast}>トーストを表示</Button>
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // ボタンをクリックしてトーストを表示
    const button = canvas.getByRole('button', { name: 'トーストを表示' })
    await userEvent.click(button)

    // トーストが表示されることを確認
    await waitFor(() => {
      expect(canvas.getByText('新しいバージョンが利用可能です')).toBeInTheDocument()
    })

    expect(canvas.getByText('アプリを更新して最新機能をご利用ください。')).toBeInTheDocument()
    expect(canvas.getByRole('button', { name: '更新' })).toBeInTheDocument()
  },
}

/**
 * 確認ダイアログのプレビュー
 * ボタンをクリックしてダイアログを開閉できます。
 */
export const ConfirmDialogPreview: Story = {
  render: () => (
    <div className="flex items-center justify-center min-h-[300px]">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button>ダイアログを開く</Button>
        </AlertDialogTrigger>
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
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // トリガーボタンをクリックしてダイアログを開く
    const triggerButton = canvas.getByRole('button', { name: 'ダイアログを開く' })
    await userEvent.click(triggerButton)

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
  const [open, setOpen] = useState(false)

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
      <div className="p-4 bg-muted rounded">
        ダイアログ状態: {open ? '開いている' : '閉じている'}
      </div>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button>ダイアログを開く</Button>
        </AlertDialogTrigger>
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
    </div>
  )
}

/**
 * ダイアログのインタラクションテスト - キャンセルボタンのクリック
 * ボタンをクリックしてダイアログを開き、キャンセルで閉じることができます。
 */
export const DialogCancelInteraction: Story = {
  render: () => <DialogCancelInteractionComponent />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // 初期状態ではダイアログが閉じている
    expect(canvas.getByText('ダイアログ状態: 閉じている')).toBeInTheDocument()

    // トリガーボタンをクリックしてダイアログを開く
    const triggerButton = canvas.getByRole('button', { name: 'ダイアログを開く' })
    await userEvent.click(triggerButton)

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
