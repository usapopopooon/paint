import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { ColorWheel } from './ColorWheel'

const meta = {
  title: 'Features/Color/ColorWheel',
  component: ColorWheel,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    onChange: fn(),
  },
  argTypes: {
    color: {
      control: 'color',
    },
  },
} satisfies Meta<typeof ColorWheel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    color: '#000000',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByRole('textbox')).toHaveValue('#000000')
  },
}

export const Red: Story = {
  args: {
    color: '#ff0000',
  },
}

export const Blue: Story = {
  args: {
    color: '#0000ff',
  },
}

export const Green: Story = {
  args: {
    color: '#00ff00',
  },
}

export const Orange: Story = {
  args: {
    color: '#ff6600',
  },
}

export const ClickToSelect: Story = {
  args: {
    color: '#3366ff',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox')

    await userEvent.click(input)

    await expect(input).toHaveFocus()
  },
}

export const InputField: Story = {
  args: {
    color: '#FF5500',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox')

    await expect(input).toHaveValue('#FF5500')
    await expect(input).toHaveAttribute('type', 'text')
  },
}

const InteractiveColorWheel = (args: React.ComponentProps<typeof ColorWheel>) => {
  const [color, setColor] = React.useState(args.color)
  return (
    <div className="flex flex-col items-center gap-4">
      <ColorWheel
        color={color}
        onChange={(newColor) => {
          setColor(newColor)
          args.onChange(newColor)
        }}
      />
      <div
        className="w-32 h-32 rounded-lg border border-border"
        style={{ backgroundColor: color }}
      />
    </div>
  )
}

export const Interactive: Story = {
  args: {
    color: '#3366ff',
  },
  render: (args) => <InteractiveColorWheel {...args} />,
}

/**
 * 外部から色が変更されるケース（スポイトツール等）
 */
const ExternalColorChange = (args: React.ComponentProps<typeof ColorWheel>) => {
  const [color, setColor] = React.useState(args.color)
  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff']

  return (
    <div className="flex flex-col items-center gap-4">
      <ColorWheel
        color={color}
        onChange={(newColor) => {
          setColor(newColor)
          args.onChange(newColor)
        }}
      />
      <div className="flex gap-2">
        {colors.map((c) => (
          <button
            key={c}
            className="w-8 h-8 rounded border border-border"
            style={{ backgroundColor: c }}
            onClick={() => setColor(c)}
            aria-label={`Set color to ${c}`}
          />
        ))}
      </div>
      <p className="text-sm text-muted-foreground">Click a color button to simulate eyedropper</p>
    </div>
  )
}

export const ExternalColorUpdate: Story = {
  args: {
    color: '#3366ff',
  },
  render: (args) => <ExternalColorChange {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // 初期値を確認
    const input = canvas.getByRole('textbox')
    await expect(input).toHaveValue('#3366FF')

    // 赤色ボタンをクリック
    const redButton = canvas.getByLabelText('Set color to #ff0000')
    await userEvent.click(redButton)

    // ColorWheelが更新されることを確認
    await expect(input).toHaveValue('#FF0000')

    // 緑色ボタンをクリック
    const greenButton = canvas.getByLabelText('Set color to #00ff00')
    await userEvent.click(greenButton)

    await expect(input).toHaveValue('#00FF00')
  },
}
