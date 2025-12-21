import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn } from 'storybook/test'
import { Canvas } from './Canvas'
import type { Stroke } from '../types'

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

const sampleStrokes: readonly Stroke[] = [
  {
    points: [
      { x: 100, y: 100 },
      { x: 150, y: 120 },
      { x: 200, y: 100 },
      { x: 250, y: 150 },
    ],
    width: 3,
    color: '#000000',
  },
  {
    points: [
      { x: 300, y: 200 },
      { x: 350, y: 250 },
      { x: 400, y: 200 },
    ],
    width: 5,
    color: '#ff0000',
  },
]

export const Empty: Story = {
  args: {
    strokes: [],
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('canvas')).toBeInTheDocument()
  },
}

export const WithStrokes: Story = {
  args: {
    strokes: sampleStrokes,
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('canvas')).toBeInTheDocument()
  },
}

export const SmallSize: Story = {
  args: {
    strokes: [],
    width: 400,
    height: 300,
  },
  play: async ({ canvasElement }) => {
    const canvas = canvasElement.querySelector('canvas')
    await expect(canvas).toHaveAttribute('width', '400')
    await expect(canvas).toHaveAttribute('height', '300')
  },
}

export const CustomBackground: Story = {
  args: {
    strokes: sampleStrokes,
    backgroundColor: '#f0f0f0',
  },
}

export const WithStrokeWidth: Story = {
  args: {
    strokes: [],
    strokeWidth: 10,
    strokeColor: '#ff0000',
  },
  play: async ({ canvasElement }) => {
    const canvas = canvasElement.querySelector('canvas')
    await expect(canvas).toBeInTheDocument()
  },
}

export const EraserMode: Story = {
  args: {
    strokes: sampleStrokes,
    strokeWidth: 20,
    strokeColor: '#ffffff',
    isEraser: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = canvasElement.querySelector('canvas')
    await expect(canvas).toBeInTheDocument()
  },
}

export const MouseInteraction: Story = {
  args: {
    strokes: [],
  },
  play: async ({ canvasElement, args }) => {
    const canvas = canvasElement.querySelector('canvas')
    await expect(canvas).toBeInTheDocument()

    if (canvas) {
      const rect = canvas.getBoundingClientRect()

      // Simulate mouse down
      const mouseDownEvent = new MouseEvent('mousedown', {
        bubbles: true,
        clientX: rect.left + 100,
        clientY: rect.top + 100,
      })
      canvas.dispatchEvent(mouseDownEvent)
      await expect(args.onStartStroke).toHaveBeenCalled()

      // Simulate mouse up
      const mouseUpEvent = new MouseEvent('mouseup', {
        bubbles: true,
        clientX: rect.left + 150,
        clientY: rect.top + 150,
      })
      canvas.dispatchEvent(mouseUpEvent)
      await expect(args.onEndStroke).toHaveBeenCalled()
    }
  },
}
