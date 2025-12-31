import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { ZoomResetButton } from './ZoomResetButton'

const meta = {
  title: 'Features/Zoom/ZoomResetButton',
  component: ZoomResetButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ZoomResetButton>

export default meta
type Story = StoryObj<typeof ZoomResetButton>

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
