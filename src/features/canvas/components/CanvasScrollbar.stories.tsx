import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { CanvasScrollbar } from './CanvasScrollbar'

const meta = {
  title: 'Features/Canvas/CanvasScrollbar',
  component: CanvasScrollbar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div
        style={{
          position: 'relative',
          width: 400,
          height: 300,
          backgroundColor: '#f0f0f0',
          border: '1px solid #ccc',
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CanvasScrollbar>

export default meta
type Story = StoryObj<typeof CanvasScrollbar>

export const Horizontal: Story = {
  args: {
    orientation: 'horizontal',
    viewportSize: 400,
    contentSize: 800,
    scrollPosition: 0,
    onScroll: () => {},
  },
}

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
    viewportSize: 300,
    contentSize: 600,
    scrollPosition: 0,
    onScroll: () => {},
  },
}

export const HorizontalScrolled: Story = {
  args: {
    orientation: 'horizontal',
    viewportSize: 400,
    contentSize: 800,
    scrollPosition: -200,
    onScroll: () => {},
  },
}

export const VerticalScrolled: Story = {
  args: {
    orientation: 'vertical',
    viewportSize: 300,
    contentSize: 600,
    scrollPosition: -150,
    onScroll: () => {},
  },
}

const InteractiveScrollbar = ({
  orientation,
  viewportSize,
  contentSize,
}: {
  orientation: 'horizontal' | 'vertical'
  viewportSize: number
  contentSize: number
}) => {
  const [scrollPosition, setScrollPosition] = useState(0)
  return (
    <div>
      <CanvasScrollbar
        orientation={orientation}
        viewportSize={viewportSize}
        contentSize={contentSize}
        scrollPosition={scrollPosition}
        onScroll={setScrollPosition}
      />
      <div style={{ position: 'absolute', top: 10, left: 10, fontSize: 12 }}>
        Position: {scrollPosition.toFixed(0)}
      </div>
    </div>
  )
}

export const InteractiveHorizontal: Story = {
  render: () => (
    <InteractiveScrollbar orientation="horizontal" viewportSize={400} contentSize={800} />
  ),
}

export const InteractiveVertical: Story = {
  render: () => (
    <InteractiveScrollbar orientation="vertical" viewportSize={300} contentSize={600} />
  ),
}

export const NotNeeded: Story = {
  args: {
    orientation: 'horizontal',
    viewportSize: 400,
    contentSize: 300,
    scrollPosition: 0,
    onScroll: () => {},
  },
}
