import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { ToolPanel } from './ToolPanel'
import type { Layer } from '@/features/layer'

const sampleLayers: readonly Layer[] = [
  {
    id: 'layer-1',
    name: 'Layer 1',
    type: 'drawing',
    isVisible: true,
    isLocked: false,
    opacity: 1,
    blendMode: 'normal',
    drawables: [],
  },
  {
    id: 'layer-2',
    name: 'Layer 2',
    type: 'drawing',
    isVisible: true,
    isLocked: false,
    opacity: 1,
    blendMode: 'normal',
    drawables: [],
  },
  {
    id: 'layer-3',
    name: 'Layer 3',
    type: 'drawing',
    isVisible: true,
    isLocked: false,
    opacity: 1,
    blendMode: 'normal',
    drawables: [],
  },
]

const mockT = (key: string) => {
  const translations: Record<string, string> = {
    'tools.pen': 'Pen',
    'tools.eraser': 'Eraser',
    'layers.title': 'Layers',
    'layers.visible': 'Visible',
    'layers.hidden': 'Hidden',
    'color.copy': 'Copy',
    'color.paste': 'Paste',
  }
  return translations[key] ?? key
}

const meta = {
  title: 'Features/Tools/ToolPanel',
  component: ToolPanel,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    currentType: 'pen',
    penConfig: { type: 'pen', color: '#000000', width: 3 },
    eraserConfig: { type: 'eraser', width: 20 },
    onToolTypeChange: fn(),
    onPenWidthChange: fn(),
    onPenColorChange: fn(),
    onEraserWidthChange: fn(),
    layers: sampleLayers,
    activeLayerId: 'layer-1',
    onLayerSelect: fn(),
    onLayerVisibilityChange: fn(),
    t: mockT,
  },
} satisfies Meta<typeof ToolPanel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const EraserSelected: Story = {
  args: {
    currentType: 'eraser',
  },
}

export const Layer2Active: Story = {
  args: {
    activeLayerId: 'layer-2',
  },
}

export const LayerHidden: Story = {
  args: {
    layers: [{ ...sampleLayers[0]!, isVisible: false }, sampleLayers[1]!, sampleLayers[2]!],
  },
}

export const CustomPenSettings: Story = {
  args: {
    penConfig: { type: 'pen', color: '#ff0000', width: 10 },
  },
}

export const LargeEraser: Story = {
  args: {
    currentType: 'eraser',
    eraserConfig: { type: 'eraser', width: 100 },
  },
}
