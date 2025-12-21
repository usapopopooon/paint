import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { Toolbar } from './Toolbar'

const meta = {
  title: 'Features/Canvas/Toolbar',
  component: Toolbar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    onUndo: fn(),
    onRedo: fn(),
    onClear: fn(),
  },
  argTypes: {
    canUndo: {
      control: 'boolean',
    },
    canRedo: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Toolbar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    canUndo: false,
    canRedo: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByRole('button', { name: 'Undo' })).toBeDisabled()
    await expect(canvas.getByRole('button', { name: 'Redo' })).toBeDisabled()
    await expect(canvas.getByRole('button', { name: 'Clear' })).toBeInTheDocument()
  },
}

export const WithUndoEnabled: Story = {
  args: {
    canUndo: true,
    canRedo: false,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const undoButton = canvas.getByRole('button', { name: 'Undo' })

    await expect(undoButton).toBeEnabled()
    await expect(canvas.getByRole('button', { name: 'Redo' })).toBeDisabled()

    await userEvent.click(undoButton)
    await expect(args.onUndo).toHaveBeenCalledTimes(1)
  },
}

export const WithRedoEnabled: Story = {
  args: {
    canUndo: false,
    canRedo: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const redoButton = canvas.getByRole('button', { name: 'Redo' })

    await expect(canvas.getByRole('button', { name: 'Undo' })).toBeDisabled()
    await expect(redoButton).toBeEnabled()

    await userEvent.click(redoButton)
    await expect(args.onRedo).toHaveBeenCalledTimes(1)
  },
}

export const WithBothEnabled: Story = {
  args: {
    canUndo: true,
    canRedo: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByRole('button', { name: 'Undo' })).toBeEnabled()
    await expect(canvas.getByRole('button', { name: 'Redo' })).toBeEnabled()
  },
}

export const ClearButton: Story = {
  args: {
    canUndo: false,
    canRedo: false,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const clearButton = canvas.getByRole('button', { name: 'Clear' })

    await userEvent.click(clearButton)
    await expect(args.onClear).toHaveBeenCalledTimes(1)
  },
}

export const Interactive: Story = {
  args: {
    canUndo: true,
    canRedo: true,
  },
}
