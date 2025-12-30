import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { LocaleToggle } from './LocaleToggle'

const meta = {
  title: 'Features/I18n/LocaleToggle',
  component: LocaleToggle,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof LocaleToggle>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const toggle = canvas.getByRole('switch')

    await expect(toggle).toHaveTextContent('日本語')
    await expect(toggle).toHaveTextContent('English')
  },
}

export const ClickToToggle: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const toggle = canvas.getByRole('switch')

    await userEvent.click(toggle)
  },
}
