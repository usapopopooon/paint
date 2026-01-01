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

    await expect(toggle).toHaveTextContent('日あ')
    await expect(toggle).toHaveTextContent('Aa')
  },
}

export const ToggleLocale: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const toggle = canvas.getByRole('switch')

    // 初期状態を確認
    const initialChecked = toggle.getAttribute('aria-checked')

    // クリックしてトグル
    await userEvent.click(toggle)

    // 状態が変わったことを確認
    const newChecked = toggle.getAttribute('aria-checked')
    await expect(newChecked).not.toBe(initialChecked)

    // もう一度クリックして元に戻る
    await userEvent.click(toggle)
    await expect(toggle.getAttribute('aria-checked')).toBe(initialChecked)
  },
}
