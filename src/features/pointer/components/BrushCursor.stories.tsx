import type { Meta, StoryObj } from '@storybook/react'
import { useEffect, useRef } from 'react'
import { BrushCursor, type BrushCursorHandle } from './BrushCursor'

/**
 * BrushCursorをラップして命令的ハンドルで位置を設定するコンポーネント
 */
const BrushCursorWithPosition = ({
  x,
  y,
  size,
  color,
  outline,
}: {
  x: number
  y: number
  size: number
  color: string
  outline?: string
}) => {
  const ref = useRef<BrushCursorHandle>(null)

  useEffect(() => {
    ref.current?.updatePosition(x, y)
    ref.current?.show()
  }, [x, y])

  return <BrushCursor ref={ref} size={size} color={color} outline={outline} />
}

const meta = {
  title: 'Features/Pointer/BrushCursor',
  component: BrushCursorWithPosition,
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
} satisfies Meta<typeof BrushCursorWithPosition>

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
