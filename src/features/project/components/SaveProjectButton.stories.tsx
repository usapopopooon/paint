import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { SaveProjectButton } from './SaveProjectButton'
import { i18nEn } from '@/test/i18n'

const meta = {
  title: 'Features/Project/SaveProjectButton',
  component: SaveProjectButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SaveProjectButton>

export default meta
type Story = StoryObj<typeof SaveProjectButton>

const onSaveFn = fn()
export const Default: Story = {
  args: {
    onSave: onSaveFn,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', {
      name: i18nEn.t('toolbar.saveProject'),
    })

    await expect(button).toBeEnabled()
    await userEvent.click(button)
    await expect(onSaveFn).toHaveBeenCalledTimes(1)
  },
}
