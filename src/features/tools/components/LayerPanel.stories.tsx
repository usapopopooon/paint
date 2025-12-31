import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { LayerPanel } from './LayerPanel'
import type { Layer } from '@/features/layer'
import { BACKGROUND_LAYER_ID } from '@/features/layer'

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
  title: 'Features/Tools/LayerPanel',
  component: LayerPanel,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    layers: sampleLayers,
    onLayerSelect: fn(),
    onLayerVisibilityChange: fn(),
  },
} satisfies Meta<typeof LayerPanel>

export default meta
type Story = StoryObj<typeof LayerPanel>

export const Default: Story = {
  args: {
    activeLayerId: 'layer-1',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByText('Layers')).toBeInTheDocument()
    await expect(canvas.getByText('Layer 1')).toBeInTheDocument()
    await expect(canvas.getByText('Layer 2')).toBeInTheDocument()
    await expect(canvas.getByText('Layer 3')).toBeInTheDocument()
  },
}

export const Layer2Active: Story = {
  args: {
    activeLayerId: 'layer-2',
  },
}

export const Layer3Active: Story = {
  args: {
    activeLayerId: 'layer-3',
  },
}

export const WithHiddenLayer: Story = {
  args: {
    layers: [{ ...sampleLayers[0]!, isVisible: false }, sampleLayers[1]!, sampleLayers[2]!],
    activeLayerId: 'layer-1',
  },
}

const onLayerSelectFn = fn()
export const SelectLayer: Story = {
  args: {
    activeLayerId: 'layer-1',
    onLayerSelect: onLayerSelectFn,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const layer2 = canvas.getByText('Layer 2')

    await userEvent.click(layer2)
    await expect(onLayerSelectFn).toHaveBeenCalledWith('layer-2')
  },
}

const onVisibilityChangeFn = fn()
export const ToggleVisibility: Story = {
  args: {
    activeLayerId: 'layer-1',
    onLayerVisibilityChange: onVisibilityChangeFn,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const visibilityButtons = canvas.getAllByRole('button', { name: 'Visible' })

    await userEvent.click(visibilityButtons[0]!)
    await expect(onVisibilityChangeFn).toHaveBeenCalledWith('layer-3', false)
  },
}

export const SingleLayer: Story = {
  args: {
    layers: [sampleLayers[0]!],
    activeLayerId: 'layer-1',
  },
}

/**
 * 背景レイヤーはUI上から非表示になることを確認
 */
const layersWithBackground: readonly Layer[] = [
  {
    id: BACKGROUND_LAYER_ID,
    name: 'Background',
    type: 'background',
    isVisible: false,
    isLocked: true,
    opacity: 1,
    blendMode: 'normal',
    drawables: [],
  },
  ...sampleLayers,
]

export const WithBackgroundLayer: Story = {
  args: {
    layers: layersWithBackground,
    activeLayerId: 'layer-1',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // 描画レイヤーは表示される
    await expect(canvas.getByText('Layer 1')).toBeInTheDocument()
    await expect(canvas.getByText('Layer 2')).toBeInTheDocument()
    await expect(canvas.getByText('Layer 3')).toBeInTheDocument()

    // 背景レイヤーはUI上に表示されない
    await expect(canvas.queryByText('Background')).not.toBeInTheDocument()
  },
}
