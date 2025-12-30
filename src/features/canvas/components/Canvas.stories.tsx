import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, waitFor } from 'storybook/test'
import { Canvas } from './Canvas'
import type { StrokeDrawable } from '@/features/drawable'
import { createStrokeDrawable } from '@/features/drawable'
import { createSolidBrushTip } from '@/features/brush'

/**
 * PixiJSの非同期初期化を待ってからキャンバス要素を取得
 */
const waitForCanvas = async (canvasElement: HTMLElement): Promise<HTMLCanvasElement | null> => {
  let canvas: HTMLCanvasElement | null = null
  await waitFor(
    () => {
      canvas = canvasElement.querySelector('canvas')
      if (!canvas) throw new Error('Canvas not found')
      return canvas
    },
    { timeout: 3000 }
  )
  return canvas
}

const meta = {
  title: 'Features/Canvas/Canvas',
  component: Canvas,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    onStartStroke: fn(),
    onAddPoint: fn(),
    onEndStroke: fn(),
    cursor: { size: 3, color: '#000000' },
  },
  argTypes: {
    width: {
      control: 'number',
    },
    height: {
      control: 'number',
    },
    backgroundColor: {
      control: 'color',
    },
  },
} satisfies Meta<typeof Canvas>

export default meta
type Story = StoryObj<typeof meta>

const sampleDrawables: readonly StrokeDrawable[] = [
  createStrokeDrawable(
    [
      { x: 100, y: 100 },
      { x: 150, y: 120 },
      { x: 200, y: 100 },
      { x: 250, y: 150 },
    ],
    {
      color: '#000000',
      brushTip: createSolidBrushTip(3),
      blendMode: 'normal',
    }
  ),
  createStrokeDrawable(
    [
      { x: 300, y: 200 },
      { x: 350, y: 250 },
      { x: 400, y: 200 },
    ],
    {
      color: '#ff0000',
      brushTip: createSolidBrushTip(5),
      blendMode: 'normal',
    }
  ),
]

export const Empty: Story = {
  args: {
    drawables: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = await waitForCanvas(canvasElement)
    await expect(canvas).toBeInTheDocument()
  },
}

export const WithDrawables: Story = {
  args: {
    drawables: sampleDrawables,
  },
  play: async ({ canvasElement }) => {
    const canvas = await waitForCanvas(canvasElement)
    await expect(canvas).toBeInTheDocument()
  },
}

export const SmallSize: Story = {
  args: {
    drawables: [],
    width: 400,
    height: 300,
  },
  play: async ({ canvasElement }) => {
    const canvas = await waitForCanvas(canvasElement)
    await expect(canvas).toHaveAttribute('width', '400')
    await expect(canvas).toHaveAttribute('height', '300')
  },
}

export const CustomBackground: Story = {
  args: {
    drawables: sampleDrawables,
    backgroundColor: '#f0f0f0',
  },
}

export const WithStrokeWidth: Story = {
  args: {
    drawables: [],
    cursor: { size: 10, color: '#ff0000' },
  },
  play: async ({ canvasElement }) => {
    const canvas = await waitForCanvas(canvasElement)
    await expect(canvas).toBeInTheDocument()
  },
}

export const EraserMode: Story = {
  args: {
    drawables: sampleDrawables,
    cursor: { size: 20, color: '#ffffff' },
  },
  play: async ({ canvasElement }) => {
    const canvas = await waitForCanvas(canvasElement)
    await expect(canvas).toBeInTheDocument()
  },
}

export const PointerInteraction: Story = {
  args: {
    drawables: [],
  },
  play: async ({ canvasElement, args }) => {
    const canvas = await waitForCanvas(canvasElement)
    await expect(canvas).toBeInTheDocument()

    if (canvas) {
      const rect = canvas.getBoundingClientRect()

      // Simulate pointer down
      const pointerDownEvent = new PointerEvent('pointerdown', {
        bubbles: true,
        clientX: rect.left + 100,
        clientY: rect.top + 100,
        pointerId: 1,
        pointerType: 'mouse',
      })
      canvas.dispatchEvent(pointerDownEvent)
      await expect(args.onStartStroke).toHaveBeenCalled()

      // Simulate pointer up
      const pointerUpEvent = new PointerEvent('pointerup', {
        bubbles: true,
        clientX: rect.left + 150,
        clientY: rect.top + 150,
        pointerId: 1,
        pointerType: 'mouse',
      })
      canvas.dispatchEvent(pointerUpEvent)
      await expect(args.onEndStroke).toHaveBeenCalled()
    }
  },
}
