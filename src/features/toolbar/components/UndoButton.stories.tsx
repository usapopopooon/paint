import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { UndoButton } from './UndoButton'

const meta = {
  title: 'Features/Toolbar/UndoButton',
  component: UndoButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof UndoButton>

export default meta
type Story = StoryObj<typeof UndoButton>

export const Disabled: Story = {
  args: {
    disabled: true,
    onClick: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: 'Undo' })

    await expect(button).toBeDisabled()
  },
}

const onClickFn = fn()
export const Enabled: Story = {
  args: {
    disabled: false,
    onClick: onClickFn,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: 'Undo' })

    await expect(button).toBeEnabled()
    await userEvent.click(button)
    await expect(onClickFn).toHaveBeenCalledTimes(1)
  },
}
