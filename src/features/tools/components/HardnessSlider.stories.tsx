import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { HardnessSlider } from './HardnessSlider'

const meta = {
  title: 'Features/Tools/HardnessSlider',
  component: HardnessSlider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    hardness: 0.5,
    onHardnessChange: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ width: '200px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof HardnessSlider>

export default meta
type Story = StoryObj<typeof HardnessSlider>

/** デフォルト状態（ぼかし有効、50%） */
export const Default: Story = {
  args: {
    hardness: 0.5,
  },
}

/** ぼかし無効状態（hardness=0） */
export const BlurDisabled: Story = {
  args: {
    hardness: 0,
  },
}

/** 低いぼかし（20%） */
export const LowBlur: Story = {
  args: {
    hardness: 0.2,
  },
}

/** 最大ぼかし（100%） */
export const FullBlur: Story = {
  args: {
    hardness: 1,
  },
}

/** コンポーネント全体が無効 */
export const Disabled: Story = {
  args: {
    hardness: 0.5,
    disabled: true,
  },
}

/** ぼかし無効状態でコンポーネント全体も無効 */
export const DisabledWithBlurOff: Story = {
  args: {
    hardness: 0,
    disabled: true,
  },
}

/** トグルボタンをクリックしてぼかしを無効にする */
const onToggleOffFn = fn()
export const ToggleBlurOff: Story = {
  args: {
    hardness: 0.5,
    onHardnessChange: onToggleOffFn,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const toggleButton = canvas.getByRole('button')

    await userEvent.click(toggleButton)
    await expect(onToggleOffFn).toHaveBeenCalledWith(0)
  },
}

/** トグルボタンをクリックしてぼかしを有効にする */
const onToggleOnFn = fn()
export const ToggleBlurOn: Story = {
  args: {
    hardness: 0,
    onHardnessChange: onToggleOnFn,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const toggleButton = canvas.getByRole('button')

    await userEvent.click(toggleButton)
    // デフォルトのぼかし値（0.5）が復元される
    await expect(onToggleOnFn).toHaveBeenCalledWith(0.5)
  },
}

/** トグルボタンにホバーしてツールチップを表示 */
export const ShowTooltipOnHover: Story = {
  args: {
    hardness: 0.5,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const toggleButton = canvas.getByRole('button')

    await userEvent.hover(toggleButton)
  },
}

/** 最大ぼかしからトグルオフ→オンで100%が復元される */
const onToggleMaxFn = fn()
export const ToggleMaxBlur: Story = {
  args: {
    hardness: 1,
    onHardnessChange: onToggleMaxFn,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const toggleButton = canvas.getByRole('button')

    // トグルオフ
    await userEvent.click(toggleButton)
    await expect(onToggleMaxFn).toHaveBeenCalledWith(0)
  },
}
