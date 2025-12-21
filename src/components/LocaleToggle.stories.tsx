import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { LocaleToggle } from './LocaleToggle'
import type { TranslationKey } from '@/hooks/useLocale'

// Mock translation function for stories
const mockT = (key: TranslationKey): string => {
  const translations: Record<TranslationKey, string> = {
    pen: 'Pen',
    eraser: 'Eraser',
    undo: 'Undo',
    redo: 'Redo',
    clear: 'Clear',
    lightMode: 'Light mode',
    darkMode: 'Dark mode',
    switchLanguage: 'Switch language',
  }
  return translations[key]
}

const meta = {
  title: 'Components/LocaleToggle',
  component: LocaleToggle,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    onToggle: fn(),
    t: mockT,
  },
  argTypes: {
    locale: {
      control: 'radio',
      options: ['en', 'ja'],
    },
  },
} satisfies Meta<typeof LocaleToggle>

export default meta
type Story = StoryObj<typeof meta>

export const English: Story = {
  args: {
    locale: 'en',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')

    await expect(button).toHaveTextContent('EN')
  },
}

export const Japanese: Story = {
  args: {
    locale: 'ja',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')

    await expect(button).toHaveTextContent('JA')
  },
}

export const ClickToToggle: Story = {
  args: {
    locale: 'en',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')

    await userEvent.click(button)
    await expect(args.onToggle).toHaveBeenCalledTimes(1)
  },
}
