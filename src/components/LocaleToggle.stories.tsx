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
    undoShortcut: 'Ctrl+Z',
    redoShortcut: 'Ctrl+Shift+Z',
    clearShortcut: 'Shift+Delete',
    noUndoHistory: 'No undo history',
    noRedoHistory: 'No redo history',
    copyColor: 'Copy',
    pasteColor: 'Paste',
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
    const toggle = canvas.getByRole('switch')

    await expect(toggle).toHaveTextContent('日本語')
    await expect(toggle).toHaveTextContent('English')
    await expect(toggle).toHaveAttribute('aria-checked', 'false')
  },
}

export const Japanese: Story = {
  args: {
    locale: 'ja',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const toggle = canvas.getByRole('switch')

    await expect(toggle).toHaveTextContent('日本語')
    await expect(toggle).toHaveTextContent('English')
    await expect(toggle).toHaveAttribute('aria-checked', 'true')
  },
}

export const ClickToToggle: Story = {
  args: {
    locale: 'en',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const toggle = canvas.getByRole('switch')

    await userEvent.click(toggle)
    await expect(args.onToggle).toHaveBeenCalledTimes(1)
  },
}
