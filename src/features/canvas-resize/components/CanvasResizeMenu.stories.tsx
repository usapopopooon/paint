import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn, expect, userEvent, within } from 'storybook/test'
import { CanvasResizeMenu } from './CanvasResizeMenu'

/**
 * CanvasResizeMenuコンポーネント
 *
 * 注意: propsのwidth/heightは内部値（2倍）で渡されますが、
 * UI上ではtoDisplayValue()により1/2の値で表示されます。
 * 例: width=1600 → UI表示は800
 */
const meta = {
  title: 'Features/CanvasResize/CanvasResizeMenu',
  component: CanvasResizeMenu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    // 内部値: 1600x1200 → UI表示: 800x600
    width: 1600,
    height: 1200,
    anchor: 'center',
    onWidthChange: fn(),
    onHeightChange: fn(),
    onAnchorChange: fn(),
  },
} satisfies Meta<typeof CanvasResizeMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // メニューボタンが存在することを確認
    const menuButton = canvas.getByRole('button')
    await expect(menuButton).toBeInTheDocument()
  },
}

export const OpenMenu: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const menuButton = canvas.getByRole('button')

    await userEvent.click(menuButton)

    // ポップオーバーが開いたことを確認（Portalでbodyにレンダリングされる）
    const body = within(document.body)
    const widthInput = await body.findByDisplayValue('800')
    const heightInput = await body.findByDisplayValue('600')
    await expect(widthInput).toBeInTheDocument()
    await expect(heightInput).toBeInTheDocument()
  },
}

export const WithTopLeftAnchor: Story = {
  args: {
    anchor: 'top-left',
  },
}

export const WithBottomRightAnchor: Story = {
  args: {
    anchor: 'bottom-right',
  },
}

export const SmallSize: Story = {
  args: {
    // 内部値: 800x600 → UI表示: 400x300
    width: 800,
    height: 600,
  },
}

export const LargeSize: Story = {
  args: {
    // 内部値: 3840x2160 → UI表示: 1920x1080
    width: 3840,
    height: 2160,
  },
}

export const ChangeWidth: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const menuButton = canvas.getByRole('button')

    await userEvent.click(menuButton)

    const body = within(document.body)
    // UI表示800をクリアして1024を入力
    const widthInput = await body.findByDisplayValue('800')
    await userEvent.clear(widthInput)
    await userEvent.type(widthInput, '1024')
    // blurで値を確定
    await userEvent.tab()

    // 内部値2048（表示値1024 * 2）でコールバックが呼ばれる
    await expect(args.onWidthChange).toHaveBeenCalledWith(2048)
  },
}

export const ChangeHeight: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const menuButton = canvas.getByRole('button')

    await userEvent.click(menuButton)

    const body = within(document.body)
    // UI表示600をクリアして768を入力
    const heightInput = await body.findByDisplayValue('600')
    await userEvent.clear(heightInput)
    await userEvent.type(heightInput, '768')
    // blurで値を確定
    await userEvent.tab()

    // 内部値1536（表示値768 * 2）でコールバックが呼ばれる
    await expect(args.onHeightChange).toHaveBeenCalledWith(1536)
  },
}

export const ChangeAnchor: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const menuButton = canvas.getByRole('button')

    await userEvent.click(menuButton)

    // top-left アンカーボタンをクリック（Portalでbodyにレンダリングされる）
    const body = within(document.body)
    const topLeftButton = await body.findByLabelText('top-left')
    await userEvent.click(topLeftButton)

    await expect(args.onAnchorChange).toHaveBeenCalledWith('top-left')
  },
}

export const ShowTooltipOnHover: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const menuButton = canvas.getByRole('button')

    // ホバーしてツールチップが表示されることを確認
    await userEvent.hover(menuButton)

    const body = within(document.body)
    const tooltip = await body.findByRole('tooltip')
    await expect(tooltip).toBeInTheDocument()
  },
}

/**
 * 空文字入力後にblurすると元の値に戻ることを確認
 */
export const EmptyInputRevert: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const menuButton = canvas.getByRole('button')

    await userEvent.click(menuButton)

    const body = within(document.body)
    const widthInput = await body.findByDisplayValue('800')
    await userEvent.clear(widthInput)
    // 空のままblur
    await userEvent.tab()

    // 元の値800に戻る
    await expect(body.getByDisplayValue('800')).toBeInTheDocument()
  },
}
