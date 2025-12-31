import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { SaveButton } from './SaveButton'
import { getTranslation } from '@/features/i18n/infrastructure/locales/getTranslation'

const meta = {
  title: 'Features/Export/SaveButton',
  component: SaveButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SaveButton>

export default meta
type Story = StoryObj<typeof SaveButton>

const onSaveFn = fn()
export const Default: Story = {
  args: {
    onSave: onSaveFn,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', {
      name: getTranslation('en', 'toolbar.save'),
    })

    await expect(button).toBeEnabled()
    await userEvent.click(button)
    await expect(onSaveFn).toHaveBeenCalledTimes(1)
  },
}
