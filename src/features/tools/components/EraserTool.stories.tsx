import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { EraserTool } from './EraserTool'

const meta = {
  title: 'Features/Tools/EraserTool',
  component: EraserTool,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    onSelect: fn(),
    onWidthChange: fn(),
  },
} satisfies Meta<typeof EraserTool>

export default meta
type Story = StoryObj<typeof EraserTool>

export const Active: Story = {
  args: {
    isActive: true,
    width: 20,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: 'Eraser' })

    await expect(button).toBeInTheDocument()
  },
}

export const Inactive: Story = {
  args: {
    isActive: false,
    width: 20,
  },
}

const onSelectFn = fn()
export const ClickToSelect: Story = {
  args: {
    isActive: false,
    width: 20,
    onSelect: onSelectFn,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: 'Eraser' })

    await userEvent.click(button)
    await expect(onSelectFn).toHaveBeenCalledTimes(1)
  },
}

export const SmallWidth: Story = {
  args: {
    isActive: true,
    width: 5,
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
