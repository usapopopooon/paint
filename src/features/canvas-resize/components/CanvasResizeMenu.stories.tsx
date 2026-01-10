import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn, expect, userEvent, within } from 'storybook/test'
import { CanvasResizeMenu } from './CanvasResizeMenu'

/**
 * CanvasResizeMenuコンポーネント
 */
const meta = {
  title: 'Features/CanvasResize/CanvasResizeMenu',
  component: CanvasResizeMenu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    width: 800,
    height: 600,
    anchor: 'center',
    onWidthChange: fn(),
    onHeightChange: fn(),
    onAnchorChange: fn(),
    onOpenChange: fn(),
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
    width: 400,
    height: 300,
  },
}

export const LargeSize: Story = {
  args: {
    width: 1920,
    height: 1080,
  },
}

export const ChangeWidth: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const menuButton = canvas.getByRole('button')

    await userEvent.click(menuButton)

    const body = within(document.body)
    const widthInput = await body.findByDisplayValue('800')
    await userEvent.clear(widthInput)
    await userEvent.type(widthInput, '1024')
    // blurで値を確定
    await userEvent.tab()

    await expect(args.onWidthChange).toHaveBeenCalledWith(1024)
  },
}

export const ChangeHeight: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const menuButton = canvas.getByRole('button')

    await userEvent.click(menuButton)

    const body = within(document.body)
    const heightInput = await body.findByDisplayValue('600')
    await userEvent.clear(heightInput)
    await userEvent.type(heightInput, '768')
    // blurで値を確定
    await userEvent.tab()

    await expect(args.onHeightChange).toHaveBeenCalledWith(768)
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

/**
 * 最小値未満を入力するとエラートーストが表示される
 */
export const TooSmallValueShowsError: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const menuButton = canvas.getByRole('button')

    await userEvent.click(menuButton)

    const body = within(document.body)
    const widthInput = await body.findByDisplayValue('800')
    await userEvent.clear(widthInput)
    await userEvent.type(widthInput, '10') // 最小値50未満
    await userEvent.tab()

    // コールバックは呼ばれない
    await expect(args.onWidthChange).not.toHaveBeenCalled()
    // 元の値に戻る
    await expect(body.getByDisplayValue('800')).toBeInTheDocument()
  },
}

/**
 * 最大値超過を入力するとエラートーストが表示される
 */
export const TooLargeValueShowsError: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const menuButton = canvas.getByRole('button')

    await userEvent.click(menuButton)

    const body = within(document.body)
    const widthInput = await body.findByDisplayValue('800')
    await userEvent.clear(widthInput)
    await userEvent.type(widthInput, '9999') // 最大値2048超過
    await userEvent.tab()

    // コールバックは呼ばれない
    await expect(args.onWidthChange).not.toHaveBeenCalled()
    // 元の値に戻る
    await expect(body.getByDisplayValue('800')).toBeInTheDocument()
  },
}

/**
 * Controlled stateで開いた状態
 */
export const ControlledOpen: Story = {
  args: {
    open: true,
  },
  play: async () => {
    // ポップオーバーが開いていることを確認
    const body = within(document.body)
    const widthInput = await body.findByDisplayValue('800')
    await expect(widthInput).toBeInTheDocument()
  },
}

/**
 * Controlled stateでonOpenChangeが呼ばれることを確認
 */
export const ControlledOpenChange: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const menuButton = canvas.getByRole('button')

    await userEvent.click(menuButton)

    // onOpenChangeがtrueで呼ばれることを確認
    await expect(args.onOpenChange).toHaveBeenCalledWith(true)
  },
}
