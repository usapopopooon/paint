import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { BrushTool } from './BrushTool'

const meta = {
  title: 'Features/Tools/BrushTool',
  component: BrushTool,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    opacity: 1,
    onSelect: fn(),
    onWidthChange: fn(),
    onOpacityChange: fn(),
  },
} satisfies Meta<typeof BrushTool>

export default meta
type Story = StoryObj<typeof BrushTool>

export const Active: Story = {
  args: {
    isActive: true,
    width: 10,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: 'Brush' })

    await expect(button).toBeInTheDocument()
  },
}

export const Inactive: Story = {
  args: {
    isActive: false,
    width: 10,
  },
}

const onSelectFn = fn()
export const ClickToSelect: Story = {
  args: {
    isActive: false,
    width: 10,
    onSelect: onSelectFn,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: 'Brush' })

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

const onSliderSelectFn = fn()
export const SliderClickToSelect: Story = {
  args: {
    isActive: false,
    width: 50,
    onSelect: onSliderSelectFn,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const slider = canvas.getByRole('slider')

    await userEvent.click(slider)
    await expect(onSliderSelectFn).toHaveBeenCalled()
  },
}
