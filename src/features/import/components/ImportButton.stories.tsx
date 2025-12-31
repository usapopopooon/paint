import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { useRef } from 'react'
import { ImportButton } from './ImportButton'
import { getTranslation } from '@/features/i18n/infrastructure/locales/getTranslation'

const meta = {
  title: 'Features/Import/ImportButton',
  component: ImportButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ImportButton>

export default meta
type Story = StoryObj<typeof ImportButton>

const onOpenFilePickerFn = fn()
const onFileChangeFn = fn()

const ImportButtonWrapper = () => {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <ImportButton
      inputRef={inputRef}
      onOpenFilePicker={onOpenFilePickerFn}
      onFileChange={onFileChangeFn}
    />
  )
}

export const Default: Story = {
  render: () => <ImportButtonWrapper />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', {
      name: getTranslation('en', 'toolbar.import'),
    })

    await expect(button).toBeEnabled()
    await userEvent.click(button)
    await expect(onOpenFilePickerFn).toHaveBeenCalledTimes(1)
  },
}
