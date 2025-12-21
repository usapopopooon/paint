import type { Meta, StoryObj } from '@storybook/react'
import { BrushCursor } from './BrushCursor'

const meta = {
  title: 'Features/Canvas/BrushCursor',
  component: BrushCursor,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', width: 200, height: 200, backgroundColor: '#333' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BrushCursor>

export default meta
type Story = StoryObj<typeof meta>

export const Small: Story = {
  args: {
    x: 100,
    y: 100,
    size: 10,
    color: '#ff0000',
  },
}

export const Medium: Story = {
  args: {
    x: 100,
    y: 100,
    size: 30,
    color: '#00ff00',
  },
}

export const Large: Story = {
  args: {
    x: 100,
    y: 100,
    size: 100,
    color: '#0000ff',
  },
}

export const Eraser: Story = {
  args: {
    x: 100,
    y: 100,
    size: 50,
    color: '#888888',
  },
}
