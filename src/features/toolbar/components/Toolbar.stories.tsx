import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { Toolbar } from './Toolbar'
import { UndoButton } from './UndoButton'
import { RedoButton } from './RedoButton'
import { ClearButton } from './ClearButton'
import { ToolbarDivider } from './ToolbarDivider'
import { i18nEn } from '@/test/i18n'

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
      <UndoButton disabled={true} onClick={fn()} />
      <RedoButton disabled={true} onClick={fn()} />
      <ToolbarDivider />
      <ClearButton onClick={fn()} />
    </Toolbar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByRole('button', { name: i18nEn.t('actions.undo') })).toBeDisabled()
    await expect(canvas.getByRole('button', { name: i18nEn.t('actions.redo') })).toBeDisabled()
    await expect(
      canvas.getByRole('button', { name: i18nEn.t('actions.clearLayer') })
    ).toBeInTheDocument()
  },
}

const onUndoFn = fn()
export const WithUndoEnabled: Story = {
  args: {
    children: null,
  },
  render: () => (
    <Toolbar>
      <UndoButton disabled={false} onClick={onUndoFn} />
      <RedoButton disabled={true} onClick={fn()} />
      <ToolbarDivider />
      <ClearButton onClick={fn()} />
    </Toolbar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const undoButton = canvas.getByRole('button', { name: i18nEn.t('actions.undo') })

    await expect(undoButton).toBeEnabled()
    await expect(canvas.getByRole('button', { name: i18nEn.t('actions.redo') })).toBeDisabled()

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
      <UndoButton disabled={true} onClick={fn()} />
      <RedoButton disabled={false} onClick={onRedoFn} />
      <ToolbarDivider />
      <ClearButton onClick={fn()} />
    </Toolbar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const redoButton = canvas.getByRole('button', { name: i18nEn.t('actions.redo') })

    await expect(canvas.getByRole('button', { name: i18nEn.t('actions.undo') })).toBeDisabled()
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
      <UndoButton disabled={false} onClick={fn()} />
      <RedoButton disabled={false} onClick={fn()} />
      <ToolbarDivider />
      <ClearButton onClick={fn()} />
    </Toolbar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByRole('button', { name: i18nEn.t('actions.undo') })).toBeEnabled()
    await expect(canvas.getByRole('button', { name: i18nEn.t('actions.redo') })).toBeEnabled()
  },
}

const onClearFn = fn()
export const ClearButtonStory: Story = {
  args: {
    children: null,
  },
  render: () => (
    <Toolbar>
      <UndoButton disabled={true} onClick={fn()} />
      <RedoButton disabled={true} onClick={fn()} />
      <ToolbarDivider />
      <ClearButton onClick={onClearFn} />
    </Toolbar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const clearButton = canvas.getByRole('button', {
      name: i18nEn.t('actions.clearLayer'),
    })

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
      <UndoButton disabled={false} onClick={fn()} />
      <RedoButton disabled={false} onClick={fn()} />
      <ToolbarDivider />
      <ClearButton onClick={fn()} />
    </Toolbar>
  ),
}
