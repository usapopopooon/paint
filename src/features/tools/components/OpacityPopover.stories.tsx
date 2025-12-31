import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { OpacityPopover } from './OpacityPopover'

const meta = {
  title: 'Features/Tools/OpacityPopover',
  component: OpacityPopover,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    opacity: 1,
    onOpacityChange: fn(),
    onOpen: fn(),
  },
} satisfies Meta<typeof OpacityPopover>

export default meta
type Story = StoryObj<typeof OpacityPopover>

export const Default: Story = {
  args: {
    opacity: 1,
  },
}

export const HalfOpacity: Story = {
  args: {
    opacity: 0.5,
  },
}

export const LowOpacity: Story = {
  args: {
    opacity: 0.2,
  },
}

export const ZeroOpacity: Story = {
  args: {
    opacity: 0,
  },
}

const onOpenFn = fn()
export const ClickToOpen: Story = {
  args: {
    opacity: 1,
    onOpen: onOpenFn,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')

    await userEvent.click(button)
    await expect(onOpenFn).toHaveBeenCalled()
  },
}

export const ShowTooltipOnHover: Story = {
  args: {
    opacity: 1,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')

    await userEvent.hover(button)
  },
}
