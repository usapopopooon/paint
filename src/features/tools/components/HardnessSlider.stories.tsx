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
    isBlurEnabled: true,
    onBlurEnabledChange: fn(),
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
    isBlurEnabled: true,
  },
}

/** ぼかし無効状態 */
export const BlurDisabled: Story = {
  args: {
    hardness: 0.5,
    isBlurEnabled: false,
  },
}

/** 低いぼかし（20%） */
export const LowBlur: Story = {
  args: {
    hardness: 0.2,
    isBlurEnabled: true,
  },
}

/** 最大ぼかし（100%） */
export const FullBlur: Story = {
  args: {
    hardness: 1,
    isBlurEnabled: true,
  },
}

/** コンポーネント全体が無効 */
export const Disabled: Story = {
  args: {
    hardness: 0.5,
    isBlurEnabled: true,
    disabled: true,
  },
}

/** ぼかし無効状態でコンポーネント全体も無効 */
export const DisabledWithBlurOff: Story = {
  args: {
    hardness: 0.5,
    isBlurEnabled: false,
    disabled: true,
  },
}

/** トグルボタンをクリックしてぼかしを無効にする */
const onToggleOffFn = fn()
export const ToggleBlurOff: Story = {
  args: {
    hardness: 0.5,
    isBlurEnabled: true,
    onBlurEnabledChange: onToggleOffFn,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const toggleButton = canvas.getByRole('button')

    await userEvent.click(toggleButton)
    await expect(onToggleOffFn).toHaveBeenCalledWith(false)
  },
}

/** トグルボタンをクリックしてぼかしを有効にする */
const onToggleOnFn = fn()
export const ToggleBlurOn: Story = {
  args: {
    hardness: 0.5,
    isBlurEnabled: false,
    onBlurEnabledChange: onToggleOnFn,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const toggleButton = canvas.getByRole('button')

    await userEvent.click(toggleButton)
    await expect(onToggleOnFn).toHaveBeenCalledWith(true)
  },
}

/** トグルボタンにホバーしてツールチップを表示 */
export const ShowTooltipOnHover: Story = {
  args: {
    hardness: 0.5,
    isBlurEnabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const toggleButton = canvas.getByRole('button')

    await userEvent.hover(toggleButton)
  },
}

/** ぼかし無効でもスライダー値は保持される（スイッチとスライダーは独立） */
export const IndependentSliderAndSwitch: Story = {
  args: {
    hardness: 0.8,
    isBlurEnabled: false,
  },
}

/** 最小hardnessでもぼかし有効状態を維持できる */
export const MinHardnessWithBlurEnabled: Story = {
  args: {
    hardness: 0,
    isBlurEnabled: true,
  },
}

/** 最大hardnessでぼかし無効状態 */
export const MaxHardnessWithBlurDisabled: Story = {
  args: {
    hardness: 1,
    isBlurEnabled: false,
  },
}
