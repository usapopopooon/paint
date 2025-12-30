import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { Toolbar } from './Toolbar'
import { UndoButton } from './UndoButton'
import { RedoButton } from './RedoButton'
import { ClearButton } from './ClearButton'
import { ToolbarDivider } from './ToolbarDivider'
import { mockT } from '@/test/mocks'

const meta = {
  title: 'Features/Toolbar/Toolbar',
  component: Toolbar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Toolbar>

export default meta
type Story = StoryObj<typeof Toolbar>

export const Default: Story = {
  args: {
    children: null,
  },
  render: () => (
    <Toolbar>
      <UndoButton disabled={true} onClick={fn()} t={mockT} />
      <RedoButton disabled={true} onClick={fn()} t={mockT} />
      <ToolbarDivider />
      <ClearButton onClick={fn()} t={mockT} />
    </Toolbar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByRole('button', { name: 'Undo' })).toBeDisabled()
    await expect(canvas.getByRole('button', { name: 'Redo' })).toBeDisabled()
    await expect(canvas.getByRole('button', { name: 'Clear' })).toBeInTheDocument()
  },
}

const onUndoFn = fn()
export const WithUndoEnabled: Story = {
  args: {
    children: null,
  },
  render: () => (
    <Toolbar>
      <UndoButton disabled={false} onClick={onUndoFn} t={mockT} />
      <RedoButton disabled={true} onClick={fn()} t={mockT} />
      <ToolbarDivider />
      <ClearButton onClick={fn()} t={mockT} />
    </Toolbar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const undoButton = canvas.getByRole('button', { name: 'Undo' })

    await expect(undoButton).toBeEnabled()
    await expect(canvas.getByRole('button', { name: 'Redo' })).toBeDisabled()

    await userEvent.click(undoButton)
    await expect(onUndoFn).toHaveBeenCalledTimes(1)
  },
}

const onRedoFn = fn()
export const WithRedoEnabled: Story = {
  args: {
    children: null,
  },
  render: () => (
    <Toolbar>
      <UndoButton disabled={true} onClick={fn()} t={mockT} />
      <RedoButton disabled={false} onClick={onRedoFn} t={mockT} />
      <ToolbarDivider />
      <ClearButton onClick={fn()} t={mockT} />
    </Toolbar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const redoButton = canvas.getByRole('button', { name: 'Redo' })

    await expect(canvas.getByRole('button', { name: 'Undo' })).toBeDisabled()
    await expect(redoButton).toBeEnabled()

    await userEvent.click(redoButton)
    await expect(onRedoFn).toHaveBeenCalledTimes(1)
  },
}

export const WithBothEnabled: Story = {
  args: {
    children: null,
  },
  render: () => (
    <Toolbar>
      <UndoButton disabled={false} onClick={fn()} t={mockT} />
      <RedoButton disabled={false} onClick={fn()} t={mockT} />
      <ToolbarDivider />
      <ClearButton onClick={fn()} t={mockT} />
    </Toolbar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByRole('button', { name: 'Undo' })).toBeEnabled()
    await expect(canvas.getByRole('button', { name: 'Redo' })).toBeEnabled()
  },
}

const onClearFn = fn()
export const ClearButtonStory: Story = {
  args: {
    children: null,
  },
  render: () => (
    <Toolbar>
      <UndoButton disabled={true} onClick={fn()} t={mockT} />
      <RedoButton disabled={true} onClick={fn()} t={mockT} />
      <ToolbarDivider />
      <ClearButton onClick={onClearFn} t={mockT} />
    </Toolbar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const clearButton = canvas.getByRole('button', { name: 'Clear' })

    await userEvent.click(clearButton)
    await expect(onClearFn).toHaveBeenCalledTimes(1)
  },
}

export const Interactive: Story = {
  args: {
    children: null,
  },
  render: () => (
    <Toolbar>
      <UndoButton disabled={false} onClick={fn()} t={mockT} />
      <RedoButton disabled={false} onClick={fn()} t={mockT} />
      <ToolbarDivider />
      <ClearButton onClick={fn()} t={mockT} />
    </Toolbar>
  ),
}
