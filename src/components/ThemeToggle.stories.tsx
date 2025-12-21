import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { ThemeToggle } from './ThemeToggle'
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
  title: 'Components/ThemeToggle',
  component: ThemeToggle,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    onToggle: fn(),
    t: mockT,
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
    const button = canvas.getByRole('button', { name: 'Light mode' })

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
    const button = canvas.getByRole('button', { name: 'Dark mode' })

    await expect(button).toBeInTheDocument()

    await userEvent.click(button)
    await expect(args.onToggle).toHaveBeenCalledTimes(1)
  },
}
