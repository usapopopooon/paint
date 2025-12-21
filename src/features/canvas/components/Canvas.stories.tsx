import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, within } from 'storybook/test'
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
    const canvas = within(canvasElement)
    const canvasEl = canvas.getByRole('img', { hidden: true }) as HTMLCanvasElement | null

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
