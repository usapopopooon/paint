import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { ZoomOutButton } from './ZoomOutButton'

const meta = {
  title: 'Features/Toolbar/ZoomOutButton',
  component: ZoomOutButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ZoomOutButton>

export default meta
type Story = StoryObj<typeof ZoomOutButton>

const onClickFn = fn()
export const Default: Story = {
  args: {
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
