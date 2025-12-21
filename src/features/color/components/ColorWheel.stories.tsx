import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { ColorWheel } from './ColorWheel'
import { mockT } from '@/test/mocks'

const meta = {
  title: 'Features/Color/ColorWheel',
  component: ColorWheel,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    onChange: fn(),
    t: mockT,
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

export const Interactive: Story = {
  args: {
    color: '#3366ff',
  },
  render: (args) => {
    const [color, setColor] = React.useState(args.color)
    return (
      <div className="flex flex-col items-center gap-4">
        <ColorWheel
          color={color}
          onChange={(newColor) => {
            setColor(newColor)
            args.onChange(newColor)
          }}
          t={mockT}
        />
        <div
          className="w-32 h-32 rounded-lg border border-border"
          style={{ backgroundColor: color }}
        />
      </div>
    )
  },
}
