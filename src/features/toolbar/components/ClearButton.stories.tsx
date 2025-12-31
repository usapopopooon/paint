import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { ClearButton } from './ClearButton'
import { useLocale } from '@/features/i18n'

const meta = {
  title: 'Features/Toolbar/ClearButton',
  component: ClearButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ClearButton>

export default meta
type Story = StoryObj<typeof ClearButton>

const onClickFn = fn()
export const Default: Story = {
  args: {
    onClick: onClickFn,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const { t } = useLocale()
    const button = canvas.getByRole('button', { name: t('actions.clearLayer', 'en') })

    await expect(button).toBeEnabled()
    await userEvent.click(button)
    await expect(onClickFn).toHaveBeenCalledTimes(1)
  },
}
