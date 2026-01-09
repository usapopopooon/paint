import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { SelectionToolButton } from './SelectionToolButton'

const meta = {
  title: 'Features/Selection/SelectionToolButton',
  component: SelectionToolButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SelectionToolButton>

export default meta
type Story = StoryObj<typeof SelectionToolButton>

export const RectangleInactive: Story = {
  args: {
    toolType: 'select-rectangle',
    isActive: false,
    onSelect: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')

    await expect(button).toBeEnabled()
  },
}

const onSelectRectangleFn = fn()
export const RectangleActive: Story = {
  args: {
    toolType: 'select-rectangle',
    isActive: true,
    onSelect: onSelectRectangleFn,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')

    await expect(button).toBeEnabled()
    await userEvent.click(button)
    await expect(onSelectRectangleFn).toHaveBeenCalledTimes(1)
  },
}

export const LassoInactive: Story = {
  args: {
    toolType: 'select-lasso',
    isActive: false,
    onSelect: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')

    await expect(button).toBeEnabled()
  },
}

const onSelectLassoFn = fn()
export const LassoActive: Story = {
  args: {
    toolType: 'select-lasso',
    isActive: true,
    onSelect: onSelectLassoFn,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')

    await expect(button).toBeEnabled()
    await userEvent.click(button)
    await expect(onSelectLassoFn).toHaveBeenCalledTimes(1)
  },
}
