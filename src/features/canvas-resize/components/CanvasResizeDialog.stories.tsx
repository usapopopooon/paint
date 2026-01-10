import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { CanvasResizeDialog } from './CanvasResizeDialog'

const meta = {
  title: 'Features/CanvasResize/CanvasResizeDialog',
  component: CanvasResizeDialog,
  parameters: {
    layout: 'centered',
  },
  args: {
    open: true,
    onOpenChange: fn(),
    width: 800,
    height: 600,
    anchor: 'center',
    onResize: fn(),
  },
} satisfies Meta<typeof CanvasResizeDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const TopLeft: Story = {
  args: {
    anchor: 'top-left',
  },
}

export const BottomRight: Story = {
  args: {
    anchor: 'bottom-right',
  },
}

export const SmallCanvas: Story = {
  args: {
    width: 100,
    height: 100,
  },
}

export const LargeCanvas: Story = {
  args: {
    width: 4000,
    height: 3000,
  },
}
