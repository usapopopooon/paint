import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { RightPanel } from './RightPanel'
import { LayerPanel } from './LayerPanel'
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
  title: 'Features/Tools/RightPanel',
  component: RightPanel,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof RightPanel>

export default meta
type Story = StoryObj<typeof RightPanel>

export const Default: Story = {
  args: {
    children: null,
  },
  render: () => (
    <RightPanel>
      <LayerPanel
        layers={sampleLayers}
        activeLayerId="layer-1"
        drawingLayerCount={3}
        onLayerSelect={fn()}
        onLayerVisibilityChange={fn()}
        onLayerAdd={fn()}
        onLayerDelete={fn()}
        onLayerNameChange={fn()}
        onLayerBlendModeChange={fn()}
        onLayerOpacityChange={fn()}
        onLayerMove={fn()}
      />
    </RightPanel>
  ),
}

export const WithManyLayers: Story = {
  args: {
    children: null,
  },
  render: () => (
    <RightPanel>
      <LayerPanel
        layers={[
          ...sampleLayers,
          {
            id: 'layer-4',
            name: 'Layer 4',
            type: 'drawing',
            isVisible: true,
            isLocked: false,
            opacity: 0.8,
            blendMode: 'multiply',
            drawables: [],
          },
          {
            id: 'layer-5',
            name: 'Layer 5',
            type: 'drawing',
            isVisible: false,
            isLocked: false,
            opacity: 1,
            blendMode: 'normal',
            drawables: [],
          },
        ]}
        activeLayerId="layer-2"
        drawingLayerCount={5}
        onLayerSelect={fn()}
        onLayerVisibilityChange={fn()}
        onLayerAdd={fn()}
        onLayerDelete={fn()}
        onLayerNameChange={fn()}
        onLayerBlendModeChange={fn()}
        onLayerOpacityChange={fn()}
        onLayerMove={fn()}
      />
    </RightPanel>
  ),
}
