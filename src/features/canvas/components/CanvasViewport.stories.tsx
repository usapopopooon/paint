import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { CanvasViewport } from './CanvasViewport'

const meta = {
  title: 'Features/Canvas/CanvasViewport',
  component: CanvasViewport,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CanvasViewport>

export default meta
type Story = StoryObj<typeof CanvasViewport>

const DemoCanvas = ({ width, height }: { width: number; height: number }) => (
  <div
    style={{
      width,
      height,
      background:
        'conic-gradient(#ccc 90deg, #fff 90deg 180deg, #ccc 180deg 270deg, #fff 270deg) 0 0 / 20px 20px',
      border: '2px solid #333',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 24,
      color: '#666',
    }}
  >
    {width} x {height}
  </div>
)

const InteractiveViewport = ({
  canvasWidth,
  canvasHeight,
  viewportWidth,
  viewportHeight,
}: {
  canvasWidth: number
  canvasHeight: number
  viewportWidth: number
  viewportHeight: number
}) => {
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  return (
    <div style={{ width: viewportWidth, height: viewportHeight, backgroundColor: '#e0e0e0' }}>
      <CanvasViewport
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
        offset={offset}
        onOffsetChange={(x, y) => setOffset({ x, y })}
      >
        <div style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}>
          <DemoCanvas width={canvasWidth} height={canvasHeight} />
        </div>
      </CanvasViewport>
    </div>
  )
}

export const SmallCanvas: Story = {
  render: () => (
    <InteractiveViewport
      canvasWidth={300}
      canvasHeight={200}
      viewportWidth={500}
      viewportHeight={400}
    />
  ),
}

export const LargeCanvas: Story = {
  render: () => (
    <InteractiveViewport
      canvasWidth={800}
      canvasHeight={600}
      viewportWidth={500}
      viewportHeight={400}
    />
  ),
}

export const WideCanvas: Story = {
  render: () => (
    <InteractiveViewport
      canvasWidth={1000}
      canvasHeight={300}
      viewportWidth={500}
      viewportHeight={400}
    />
  ),
}

export const TallCanvas: Story = {
  render: () => (
    <InteractiveViewport
      canvasWidth={300}
      canvasHeight={800}
      viewportWidth={500}
      viewportHeight={400}
    />
  ),
}
