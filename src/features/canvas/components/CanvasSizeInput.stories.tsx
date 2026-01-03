import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn, expect, userEvent, within } from 'storybook/test'
import { CanvasSizeInput } from './CanvasSizeInput'

/**
 * CanvasSizeInputコンポーネント
 */
const meta = {
  title: 'Features/Canvas/CanvasSizeInput',
  component: CanvasSizeInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    width: 800,
    height: 600,
    onWidthChange: fn(),
    onHeightChange: fn(),
  },
} satisfies Meta<typeof CanvasSizeInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const widthInput = canvas.getByDisplayValue('800')
    const heightInput = canvas.getByDisplayValue('600')

    await expect(widthInput).toBeInTheDocument()
    await expect(heightInput).toBeInTheDocument()
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

export const MinimumSize: Story = {
  args: {
    width: 50,
    height: 50,
  },
}

export const MaximumSize: Story = {
  args: {
    width: 2048,
    height: 2048,
  },
}

export const WidthChange: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const widthInput = canvas.getByDisplayValue('800')

    await userEvent.clear(widthInput)
    await userEvent.type(widthInput, '1024')
    // blurで値を確定
    await userEvent.tab()

    await expect(args.onWidthChange).toHaveBeenCalledWith(1024)
  },
}

export const HeightChange: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const heightInput = canvas.getByDisplayValue('600')

    await userEvent.clear(heightInput)
    await userEvent.type(heightInput, '768')
    // blurで値を確定
    await userEvent.tab()

    await expect(args.onHeightChange).toHaveBeenCalledWith(768)
  },
}

/**
 * 空文字入力後にblurすると元の値に戻ることを確認
 */
export const EmptyInputRevert: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const widthInput = canvas.getByDisplayValue('800')

    await userEvent.clear(widthInput)
    // 空のままblur
    await userEvent.tab()

    // 元の値800に戻る
    await expect(canvas.getByDisplayValue('800')).toBeInTheDocument()
  },
}
