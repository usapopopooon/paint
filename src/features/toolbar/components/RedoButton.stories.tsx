import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { RedoButton } from './RedoButton'
import { mockT } from '@/test/mocks'

const meta = {
  title: 'Features/Toolbar/RedoButton',
  component: RedoButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    t: mockT,
  },
} satisfies Meta<typeof RedoButton>

export default meta
type Story = StoryObj<typeof RedoButton>

export const Disabled: Story = {
  args: {
    disabled: true,
    onClick: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: 'Redo' })

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
    const button = canvas.getByRole('button', { name: 'Redo' })

    await expect(button).toBeEnabled()
    await userEvent.click(button)
    await expect(onClickFn).toHaveBeenCalledTimes(1)
  },
}
