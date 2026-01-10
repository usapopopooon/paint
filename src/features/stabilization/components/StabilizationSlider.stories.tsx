import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { StabilizationSlider } from './StabilizationSlider'

const meta = {
  title: 'Features/Stabilization/StabilizationSlider',
  component: StabilizationSlider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    stabilization: 0,
    onStabilizationChange: fn(),
  },
} satisfies Meta<typeof StabilizationSlider>

export default meta
type Story = StoryObj<typeof StabilizationSlider>

/** デフォルト状態（0%） - アイコンは非アクティブ色 */
export const Default: Story = {
  args: {
    stabilization: 0,
  },
}

/** 補正あり（50%）- 内部値0.1 - アイコンはアクティブ色 */
export const HalfStabilization: Story = {
  args: {
    stabilization: 0.1,
  },
}

/** 最大補正（100%）- 内部値0.2 - アイコンはアクティブ色 */
export const MaxStabilization: Story = {
  args: {
    stabilization: 0.2,
  },
}

/** 無効状態 */
export const Disabled: Story = {
  args: {
    stabilization: 0.1,
    disabled: true,
  },
}

/** ボタンクリックでポップオーバーが開く */
export const OpenPopover: Story = {
  args: {
    stabilization: 0.1,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')

    await userEvent.click(button)

    // ポップオーバーはbodyにレンダリングされるため、document全体から検索
    const body = within(document.body)
    await expect(body.getByRole('slider')).toBeInTheDocument()
  },
}

/** スライダーの値が正しく表示される（内部値0.15→UI上75%） */
export const VerifySliderValue: Story = {
  args: {
    stabilization: 0.15,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')

    await userEvent.click(button)

    // ポップオーバーはbodyにレンダリングされるため、document全体から検索
    const body = within(document.body)
    const slider = body.getByRole('slider')
    await expect(slider).toHaveAttribute('aria-valuenow', '75')
  },
}

/** 低い補正値（25%）- 内部値0.05 */
export const LowStabilization: Story = {
  args: {
    stabilization: 0.05,
  },
}

/** アイコンがアクティブ色になることを確認 */
export const ActiveIconColor: Story = {
  args: {
    stabilization: 0.1,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')
    const icon = button.querySelector('svg')

    await expect(icon).toHaveClass('text-primary')
  },
}

/** アイコンが非アクティブ色になることを確認 */
export const InactiveIconColor: Story = {
  args: {
    stabilization: 0,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')
    const icon = button.querySelector('svg')

    await expect(icon).not.toHaveClass('text-primary')
  },
}
