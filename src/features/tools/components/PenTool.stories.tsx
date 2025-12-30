import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { PenTool } from './PenTool'

const meta = {
  title: 'Features/Tools/PenTool',
  component: PenTool,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    onSelect: fn(),
    onWidthChange: fn(),
  },
} satisfies Meta<typeof PenTool>

export default meta
type Story = StoryObj<typeof PenTool>

export const Active: Story = {
  args: {
    isActive: true,
    width: 3,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: 'Pen' })

    await expect(button).toBeInTheDocument()
  },
}

export const Inactive: Story = {
  args: {
    isActive: false,
    width: 3,
  },
}

const onSelectFn = fn()
export const ClickToSelect: Story = {
  args: {
    isActive: false,
    width: 3,
    onSelect: onSelectFn,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: 'Pen' })

    await userEvent.click(button)
    await expect(onSelectFn).toHaveBeenCalledTimes(1)
  },
}

export const SmallWidth: Story = {
  args: {
    isActive: true,
    width: 1,
  },
}

export const LargeWidth: Story = {
  args: {
    isActive: true,
    width: 100,
  },
}

export const MaxWidth: Story = {
  args: {
    isActive: true,
    width: 300,
  },
}
