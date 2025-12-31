import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn, expect, userEvent, within } from 'storybook/test'
import { CanvasSizeInput } from './CanvasSizeInput'

/**
 * CanvasSizeInputコンポーネント
 *
 * 注意: propsのwidth/heightは内部値（2倍）で渡されますが、
 * UI上ではtoDisplayValue()により1/2の値で表示されます。
 * 例: width=1600 → UI表示は800
 */
const meta = {
  title: 'Features/Canvas/CanvasSizeInput',
  component: CanvasSizeInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    // 内部値: 1600x1200 → UI表示: 800x600
    width: 1600,
    height: 1200,
    onWidthChange: fn(),
    onHeightChange: fn(),
  },
} satisfies Meta<typeof CanvasSizeInput>

export default meta
type Story = StoryObj<typeof meta>

/**
 * 内部値1600x1200がUI表示800x600として表示されることを確認
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // 内部値1600x1200 → UI表示800x600
    const widthInput = canvas.getByDisplayValue('800')
    const heightInput = canvas.getByDisplayValue('600')

    await expect(widthInput).toBeInTheDocument()
    await expect(heightInput).toBeInTheDocument()
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

export const MinimumSize: Story = {
  args: {
    // 内部値: 100x100 → UI表示: 50x50
    width: 100,
    height: 100,
  },
}

export const MaximumSize: Story = {
  args: {
    // 内部値: 4096x4096 → UI表示: 2048x2048
    width: 4096,
    height: 4096,
  },
}

export const WidthChange: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    // UI表示800をクリアして1024を入力
    const widthInput = canvas.getByDisplayValue('800')

    await userEvent.clear(widthInput)
    await userEvent.type(widthInput, '1024')
    // blurで値を確定
    await userEvent.tab()

    // 内部値2048（表示値1024 * 2）でコールバックが呼ばれる
    await expect(args.onWidthChange).toHaveBeenCalledWith(2048)
  },
}

export const HeightChange: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    // UI表示600をクリアして768を入力
    const heightInput = canvas.getByDisplayValue('600')

    await userEvent.clear(heightInput)
    await userEvent.type(heightInput, '768')
    // blurで値を確定
    await userEvent.tab()

    // 内部値1536（表示値768 * 2）でコールバックが呼ばれる
    await expect(args.onHeightChange).toHaveBeenCalledWith(1536)
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
