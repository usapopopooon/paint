import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { FlipHorizontalButton } from './FlipHorizontalButton'
import { i18nEn } from '@/test/i18n'

const meta = {
  title: 'Features/Toolbar/FlipHorizontalButton',
  component: FlipHorizontalButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FlipHorizontalButton>

export default meta
type Story = StoryObj<typeof FlipHorizontalButton>

const onClickFn = fn()
export const Default: Story = {
  args: {
    onClick: onClickFn,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', {
      name: i18nEn.t('canvas.flipHorizontal'),
    })

    await expect(button).toBeEnabled()
    await userEvent.click(button)
    await expect(onClickFn).toHaveBeenCalledTimes(1)
  },
}
