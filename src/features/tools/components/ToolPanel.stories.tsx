import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { ToolPanel } from './ToolPanel'
import { PenTool } from './PenTool'
import { EraserTool } from './EraserTool'
import { LayerPanel } from './LayerPanel'
import { ColorWheel } from '@/features/color'
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

const meta = {
  title: 'Features/Tools/ToolPanel',
  component: ToolPanel,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ToolPanel>

export default meta
type Story = StoryObj<typeof ToolPanel>

export const Default: Story = {
  args: {
    children: null,
  },
  render: () => (
    <ToolPanel>
      <ColorWheel color="#000000" onChange={fn()} />
      <PenTool isActive={true} width={3} onSelect={fn()} onWidthChange={fn()} />
      <EraserTool isActive={false} width={20} onSelect={fn()} onWidthChange={fn()} />
      <LayerPanel
        layers={sampleLayers}
        activeLayerId="layer-1"
        onLayerSelect={fn()}
        onLayerVisibilityChange={fn()}
      />
    </ToolPanel>
  ),
}

export const EraserSelected: Story = {
  args: {
    children: null,
  },
  render: () => (
    <ToolPanel>
      <ColorWheel color="#000000" onChange={fn()} />
      <PenTool isActive={false} width={3} onSelect={fn()} onWidthChange={fn()} />
      <EraserTool isActive={true} width={20} onSelect={fn()} onWidthChange={fn()} />
      <LayerPanel
        layers={sampleLayers}
        activeLayerId="layer-1"
        onLayerSelect={fn()}
        onLayerVisibilityChange={fn()}
      />
    </ToolPanel>
  ),
}

export const Layer2Active: Story = {
  args: {
    children: null,
  },
  render: () => (
    <ToolPanel>
      <ColorWheel color="#000000" onChange={fn()} />
      <PenTool isActive={true} width={3} onSelect={fn()} onWidthChange={fn()} />
      <EraserTool isActive={false} width={20} onSelect={fn()} onWidthChange={fn()} />
      <LayerPanel
        layers={sampleLayers}
        activeLayerId="layer-2"
        onLayerSelect={fn()}
        onLayerVisibilityChange={fn()}
      />
    </ToolPanel>
  ),
}

export const LayerHidden: Story = {
  args: {
    children: null,
  },
  render: () => (
    <ToolPanel>
      <ColorWheel color="#000000" onChange={fn()} />
      <PenTool isActive={true} width={3} onSelect={fn()} onWidthChange={fn()} />
      <EraserTool isActive={false} width={20} onSelect={fn()} onWidthChange={fn()} />
      <LayerPanel
        layers={[{ ...sampleLayers[0]!, isVisible: false }, sampleLayers[1]!, sampleLayers[2]!]}
        activeLayerId="layer-1"
        onLayerSelect={fn()}
        onLayerVisibilityChange={fn()}
      />
    </ToolPanel>
  ),
}

export const CustomPenSettings: Story = {
  args: {
    children: null,
  },
  render: () => (
    <ToolPanel>
      <ColorWheel color="#ff0000" onChange={fn()} />
      <PenTool isActive={true} width={10} onSelect={fn()} onWidthChange={fn()} />
      <EraserTool isActive={false} width={20} onSelect={fn()} onWidthChange={fn()} />
      <LayerPanel
        layers={sampleLayers}
        activeLayerId="layer-1"
        onLayerSelect={fn()}
        onLayerVisibilityChange={fn()}
      />
    </ToolPanel>
  ),
}

export const LargeEraser: Story = {
  args: {
    children: null,
  },
  render: () => (
    <ToolPanel>
      <ColorWheel color="#000000" onChange={fn()} />
      <PenTool isActive={false} width={3} onSelect={fn()} onWidthChange={fn()} />
      <EraserTool isActive={true} width={100} onSelect={fn()} onWidthChange={fn()} />
      <LayerPanel
        layers={sampleLayers}
        activeLayerId="layer-1"
        onLayerSelect={fn()}
        onLayerVisibilityChange={fn()}
      />
    </ToolPanel>
  ),
}
