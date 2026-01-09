import type { Meta, StoryObj } from '@storybook/react-vite'
import { SelectionOverlay } from './SelectionOverlay'
import type { SelectionRegion } from '../types'

const meta = {
  title: 'Features/Selection/SelectionOverlay',
  component: SelectionOverlay,
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
} satisfies Meta<typeof SelectionOverlay>

export default meta
type Story = StoryObj<typeof SelectionOverlay>

const rectangleRegion: SelectionRegion = {
  id: 'selection-1',
  shape: {
    type: 'rectangle',
    bounds: {
      x: 50,
      y: 50,
      width: 200,
      height: 150,
    },
  },
  layerId: 'layer-1' as SelectionRegion['layerId'],
  imageData: null,
  offset: { x: 0, y: 0 },
}

const lassoRegion: SelectionRegion = {
  id: 'selection-2',
  shape: {
    type: 'lasso',
    points: [
      { x: 100, y: 50 },
      { x: 200, y: 80 },
      { x: 250, y: 150 },
      { x: 180, y: 220 },
      { x: 80, y: 200 },
      { x: 50, y: 120 },
    ],
  },
  layerId: 'layer-1' as SelectionRegion['layerId'],
  imageData: null,
  offset: { x: 0, y: 0 },
}

export const NoSelection: Story = {
  args: {
    width: 400,
    height: 300,
    region: null,
    selectionPoints: [],
    toolType: 'select-rectangle',
    isSelecting: false,
  },
}

export const RectangleSelection: Story = {
  args: {
    width: 400,
    height: 300,
    region: rectangleRegion,
    selectionPoints: [],
    toolType: 'select-rectangle',
    isSelecting: false,
  },
}

export const LassoSelection: Story = {
  args: {
    width: 400,
    height: 300,
    region: lassoRegion,
    selectionPoints: [],
    toolType: 'select-lasso',
    isSelecting: false,
  },
}

export const SelectingRectangle: Story = {
  args: {
    width: 400,
    height: 300,
    region: null,
    selectionPoints: [
      { x: 100, y: 80 },
      { x: 280, y: 200 },
    ],
    toolType: 'select-rectangle',
    isSelecting: true,
  },
}

export const SelectingLasso: Story = {
  args: {
    width: 400,
    height: 300,
    region: null,
    selectionPoints: [
      { x: 100, y: 50 },
      { x: 150, y: 60 },
      { x: 200, y: 80 },
      { x: 220, y: 120 },
      { x: 200, y: 160 },
    ],
    toolType: 'select-lasso',
    isSelecting: true,
  },
}

export const Scaled: Story = {
  args: {
    width: 400,
    height: 300,
    region: rectangleRegion,
    selectionPoints: [],
    toolType: 'select-rectangle',
    isSelecting: false,
    scale: 1.5,
  },
}

export const WithOffset: Story = {
  args: {
    width: 400,
    height: 300,
    region: rectangleRegion,
    selectionPoints: [],
    toolType: 'select-rectangle',
    isSelecting: false,
    offset: { x: 20, y: 20 },
  },
}
