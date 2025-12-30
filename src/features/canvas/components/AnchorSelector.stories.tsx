import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn, expect, userEvent, within } from 'storybook/test'
import { AnchorSelector } from './AnchorSelector'

const meta = {
  title: 'Features/Canvas/AnchorSelector',
  component: AnchorSelector,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    value: 'center',
    onChange: fn(),
  },
} satisfies Meta<typeof AnchorSelector>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // 9つのボタンがあることを確認
    const buttons = canvas.getAllByRole('button')
    await expect(buttons).toHaveLength(9)
  },
}

export const CenterSelected: Story = {
  args: {
    value: 'center',
  },
}

export const TopLeftSelected: Story = {
  args: {
    value: 'top-left',
  },
}

export const TopSelected: Story = {
  args: {
    value: 'top',
  },
}

export const TopRightSelected: Story = {
  args: {
    value: 'top-right',
  },
}

export const LeftSelected: Story = {
  args: {
    value: 'left',
  },
}

export const RightSelected: Story = {
  args: {
    value: 'right',
  },
}

export const BottomLeftSelected: Story = {
  args: {
    value: 'bottom-left',
  },
}

export const BottomSelected: Story = {
  args: {
    value: 'bottom',
  },
}

export const BottomRightSelected: Story = {
  args: {
    value: 'bottom-right',
  },
}

export const ClickToChange: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const topLeftButton = canvas.getByLabelText('top-left')

    await userEvent.click(topLeftButton)

    await expect(args.onChange).toHaveBeenCalledWith('top-left')
  },
}
