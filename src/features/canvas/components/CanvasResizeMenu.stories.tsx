import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn, expect, userEvent, within } from 'storybook/test'
import { CanvasResizeMenu } from './CanvasResizeMenu'

const meta = {
  title: 'Features/Canvas/CanvasResizeMenu',
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

    await expect(args.onWidthChange).toHaveBeenCalled()
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

    await expect(args.onHeightChange).toHaveBeenCalled()
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
