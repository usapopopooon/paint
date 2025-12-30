import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { CenterCanvasButton } from './CenterCanvasButton'

const meta = {
  title: 'Features/Toolbar/CenterCanvasButton',
  component: CenterCanvasButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CenterCanvasButton>

export default meta
type Story = StoryObj<typeof CenterCanvasButton>

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
