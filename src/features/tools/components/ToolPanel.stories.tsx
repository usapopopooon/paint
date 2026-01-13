import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { ToolPanel } from './ToolPanel'
import { PenTool } from './PenTool'
import { BrushTool } from './BrushTool'
import { EraserTool } from './EraserTool'
import { ColorWheel } from '@/features/color'

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
      <PenTool
        isActive={true}
        width={3}
        opacity={1}
        onSelect={fn()}
        onWidthChange={fn()}
        onOpacityChange={fn()}
      />
      <BrushTool
        isActive={false}
        width={10}
        opacity={1}
        onSelect={fn()}
        onWidthChange={fn()}
        onOpacityChange={fn()}
      />
      <EraserTool
        isActive={false}
        width={20}
        opacity={1}
        onSelect={fn()}
        onWidthChange={fn()}
        onOpacityChange={fn()}
      />
    </ToolPanel>
  ),
}

export const BrushSelected: Story = {
  args: {
    children: null,
  },
  render: () => (
    <ToolPanel>
      <ColorWheel color="#000000" onChange={fn()} />
      <PenTool
        isActive={false}
        width={3}
        opacity={1}
        onSelect={fn()}
        onWidthChange={fn()}
        onOpacityChange={fn()}
      />
      <BrushTool
        isActive={true}
        width={10}
        opacity={1}
        onSelect={fn()}
        onWidthChange={fn()}
        onOpacityChange={fn()}
      />
      <EraserTool
        isActive={false}
        width={20}
        opacity={1}
        onSelect={fn()}
        onWidthChange={fn()}
        onOpacityChange={fn()}
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
      <PenTool
        isActive={false}
        width={3}
        opacity={1}
        onSelect={fn()}
        onWidthChange={fn()}
        onOpacityChange={fn()}
      />
      <BrushTool
        isActive={false}
        width={10}
        opacity={1}
        onSelect={fn()}
        onWidthChange={fn()}
        onOpacityChange={fn()}
      />
      <EraserTool
        isActive={true}
        width={20}
        opacity={1}
        onSelect={fn()}
        onWidthChange={fn()}
        onOpacityChange={fn()}
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
      <PenTool
        isActive={true}
        width={10}
        opacity={0.5}
        onSelect={fn()}
        onWidthChange={fn()}
        onOpacityChange={fn()}
      />
      <BrushTool
        isActive={false}
        width={10}
        opacity={1}
        onSelect={fn()}
        onWidthChange={fn()}
        onOpacityChange={fn()}
      />
      <EraserTool
        isActive={false}
        width={20}
        opacity={1}
        onSelect={fn()}
        onWidthChange={fn()}
        onOpacityChange={fn()}
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
      <PenTool
        isActive={false}
        width={3}
        opacity={1}
        onSelect={fn()}
        onWidthChange={fn()}
        onOpacityChange={fn()}
      />
      <BrushTool
        isActive={false}
        width={10}
        opacity={1}
        onSelect={fn()}
        onWidthChange={fn()}
        onOpacityChange={fn()}
      />
      <EraserTool
        isActive={true}
        width={100}
        opacity={1}
        onSelect={fn()}
        onWidthChange={fn()}
        onOpacityChange={fn()}
      />
    </ToolPanel>
  ),
}
