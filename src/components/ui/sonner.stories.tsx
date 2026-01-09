import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within, waitFor } from 'storybook/test'
import { toast } from 'sonner'
import { Toaster, showActionToast } from './sonner'
import { Button } from './button'

/**
 * Toasterはsonnerを使用したトースト通知コンポーネントです。
 * 様々な種類の通知（成功、エラー、情報、警告、ローディング）を表示できます。
 */
const meta = {
  title: 'UI/Sonner',
  component: Toaster,
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
} satisfies Meta<typeof Toaster>

export default meta
type Story = StoryObj<typeof meta>

/**
 * 基本的なトースト通知
 */
export const Default: Story = {
  render: () => (
    <div className="flex items-center justify-center min-h-[300px]">
      <Button onClick={() => toast('メッセージ')}>トーストを表示</Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: 'トーストを表示' })
    await userEvent.click(button)

    await waitFor(() => {
      expect(canvas.getByText('メッセージ')).toBeInTheDocument()
    })
  },
}

/**
 * 説明付きトースト
 */
export const WithDescription: Story = {
  render: () => (
    <div className="flex items-center justify-center min-h-[300px]">
      <Button
        onClick={() =>
          toast('タイトル', {
            description: '詳細な説明文をここに表示します。',
          })
        }
      >
        説明付きトーストを表示
      </Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: '説明付きトーストを表示' })
    await userEvent.click(button)

    await waitFor(() => {
      expect(canvas.getByText('タイトル')).toBeInTheDocument()
    })
    expect(canvas.getByText('詳細な説明文をここに表示します。')).toBeInTheDocument()
  },
}

/**
 * 成功トースト
 */
export const Success: Story = {
  render: () => (
    <div className="flex items-center justify-center min-h-[300px]">
      <Button onClick={() => toast.success('保存しました')}>成功トーストを表示</Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: '成功トーストを表示' })
    await userEvent.click(button)

    await waitFor(() => {
      expect(canvas.getByText('保存しました')).toBeInTheDocument()
    })
  },
}

/**
 * エラートースト
 */
export const Error: Story = {
  render: () => (
    <div className="flex items-center justify-center min-h-[300px]">
      <Button onClick={() => toast.error('エラーが発生しました')}>エラートーストを表示</Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: 'エラートーストを表示' })
    await userEvent.click(button)

    await waitFor(() => {
      expect(canvas.getByText('エラーが発生しました')).toBeInTheDocument()
    })
  },
}

/**
 * 情報トースト
 */
export const Info: Story = {
  render: () => (
    <div className="flex items-center justify-center min-h-[300px]">
      <Button onClick={() => toast.info('お知らせがあります')}>情報トーストを表示</Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: '情報トーストを表示' })
    await userEvent.click(button)

    await waitFor(() => {
      expect(canvas.getByText('お知らせがあります')).toBeInTheDocument()
    })
  },
}

/**
 * 警告トースト
 */
export const Warning: Story = {
  render: () => (
    <div className="flex items-center justify-center min-h-[300px]">
      <Button onClick={() => toast.warning('注意が必要です')}>警告トーストを表示</Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: '警告トーストを表示' })
    await userEvent.click(button)

    await waitFor(() => {
      expect(canvas.getByText('注意が必要です')).toBeInTheDocument()
    })
  },
}

/**
 * アクションボタン付きトースト
 * PWA更新通知などに使用される、アクションボタンを持つトーストです。
 */
export const ActionToast: Story = {
  render: () => (
    <div className="flex items-center justify-center min-h-[300px]">
      <Button
        onClick={() =>
          showActionToast({
            title: '新しいバージョンが利用可能です',
            description: 'アプリを更新して最新機能をご利用ください。',
            actionLabel: '更新',
            onAction: () => {
              toast.success('更新を開始しました')
            },
          })
        }
      >
        アクション付きトーストを表示
      </Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: 'アクション付きトーストを表示' })
    await userEvent.click(button)

    await waitFor(() => {
      expect(canvas.getByText('新しいバージョンが利用可能です')).toBeInTheDocument()
    })
    expect(canvas.getByText('アプリを更新して最新機能をご利用ください。')).toBeInTheDocument()
    expect(canvas.getByRole('button', { name: '更新' })).toBeInTheDocument()
  },
}

/**
 * アクションボタンのクリックテスト
 */
export const ActionToastInteraction: Story = {
  render: () => (
    <div className="flex items-center justify-center min-h-[300px]">
      <Button
        onClick={() =>
          showActionToast({
            title: '新しいバージョンが利用可能です',
            actionLabel: '更新',
            onAction: () => {
              toast.success('更新しました')
            },
          })
        }
      >
        トーストを表示
      </Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // トーストを表示
    const showButton = canvas.getByRole('button', { name: 'トーストを表示' })
    await userEvent.click(showButton)

    // トーストが表示されるまで待機
    await waitFor(() => {
      expect(canvas.getByText('新しいバージョンが利用可能です')).toBeInTheDocument()
    })

    // アクションボタンをクリック
    const actionButton = canvas.getByRole('button', { name: '更新' })
    await userEvent.click(actionButton)

    // 成功トーストが表示されることを確認
    await waitFor(() => {
      expect(canvas.getByText('更新しました')).toBeInTheDocument()
    })
  },
}
