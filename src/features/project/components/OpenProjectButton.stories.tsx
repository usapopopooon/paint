import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { useRef } from 'react'
import { OpenProjectButton } from './OpenProjectButton'
import { getTranslation } from '@/features/i18n/infrastructure/locales/getTranslation'

const meta = {
  title: 'Features/Project/OpenProjectButton',
  component: OpenProjectButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof OpenProjectButton>

export default meta
type Story = StoryObj<typeof OpenProjectButton>

const onOpenFilePickerFn = fn()
const onFileChangeFn = fn()

const OpenProjectButtonWrapper = () => {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <OpenProjectButton
      inputRef={inputRef}
      onOpenFilePicker={onOpenFilePickerFn}
      onFileChange={onFileChangeFn}
    />
  )
}

export const Default: Story = {
  render: () => <OpenProjectButtonWrapper />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', {
      name: getTranslation('en', 'toolbar.openProject'),
    })

    await expect(button).toBeEnabled()
    await userEvent.click(button)
    await expect(onOpenFilePickerFn).toHaveBeenCalledTimes(1)
  },
}
