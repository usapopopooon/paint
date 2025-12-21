import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { ThemeToggle } from './ThemeToggle'

const meta = {
  title: 'Components/ThemeToggle',
  component: ThemeToggle,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    onToggle: fn(),
  },
  argTypes: {
    isDark: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof ThemeToggle>

export default meta
type Story = StoryObj<typeof meta>

export const Dark: Story = {
  args: {
    isDark: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: 'Switch to light mode' })

    await expect(button).toBeInTheDocument()

    await userEvent.click(button)
    await expect(args.onToggle).toHaveBeenCalledTimes(1)
  },
}

export const Light: Story = {
  args: {
    isDark: false,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: 'Switch to dark mode' })

    await expect(button).toBeInTheDocument()

    await userEvent.click(button)
    await expect(args.onToggle).toHaveBeenCalledTimes(1)
  },
}
