import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { ZoomDisplay } from './ZoomDisplay'

const meta = {
  title: 'Features/Toolbar/ZoomDisplay',
  component: ZoomDisplay,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ZoomDisplay>

export default meta
type Story = StoryObj<typeof ZoomDisplay>

export const Default: Story = {
  args: {
    zoomPercent: 100,
    onZoomChange: fn(),
  },
}

export const ZoomedIn: Story = {
  args: {
    zoomPercent: 200,
    onZoomChange: fn(),
  },
}

export const ZoomedOut: Story = {
  args: {
    zoomPercent: 50,
    onZoomChange: fn(),
  },
}

const onZoomChangeFn = fn()
export const InputChange: Story = {
  args: {
    zoomPercent: 100,
    onZoomChange: onZoomChangeFn,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('spinbutton')

    await expect(input).toHaveValue(100)

    // 値を変更してblur
    await userEvent.clear(input)
    await userEvent.type(input, '150')
    await userEvent.tab()

    await expect(onZoomChangeFn).toHaveBeenCalled()
  },
}
