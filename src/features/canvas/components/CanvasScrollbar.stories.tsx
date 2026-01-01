import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'
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

/**
 * サムをポインターでドラッグしてスクロールするケース
 */
export const DragThumb: Story = {
  render: () => (
    <InteractiveScrollbar orientation="horizontal" viewportSize={400} contentSize={800} />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // 初期位置を確認
    const positionText = canvas.getByText(/Position:/)
    await expect(positionText).toHaveTextContent('Position: 0')

    // サム要素を取得（grabカーソルを持つ要素）
    const thumb = canvasElement.querySelector('[style*="cursor: grab"]') as HTMLElement
    await expect(thumb).toBeInTheDocument()

    // サムをドラッグ
    await userEvent.pointer([
      { keys: '[MouseLeft>]', target: thumb },
      { coords: { x: 100, y: 0 } },
      { keys: '[/MouseLeft]' },
    ])

    // スクロール位置が変更されたことを確認（0以外になっている）
    await expect(positionText).not.toHaveTextContent('Position: 0')
  },
}
