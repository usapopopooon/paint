import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { ZoomOutButton } from './ZoomOutButton'

const meta = {
  title: 'Features/Zoom/ZoomOutButton',
  component: ZoomOutButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ZoomOutButton>

export default meta
type Story = StoryObj<typeof ZoomOutButton>

export const Inactive: Story = {
  args: {
    isActive: false,
    onClick: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')

    await expect(button).toBeEnabled()
  },
}

const onClickFn = fn()
export const Active: Story = {
  args: {
    isActive: true,
    onClick: onClickFn,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')

    await expect(button).toBeEnabled()
    await userEvent.click(button)
    await expect(onClickFn).toHaveBeenCalledTimes(1)
  },
}
