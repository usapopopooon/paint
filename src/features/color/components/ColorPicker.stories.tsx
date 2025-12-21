import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { ColorPicker } from './ColorPicker'

const meta = {
  title: 'Features/Color/ColorPicker',
  component: ColorPicker,
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
} satisfies Meta<typeof ColorPicker>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    color: '#000000',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: 'Pick color' })

    await expect(button).toBeInTheDocument()
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

export const OpenPopover: Story = {
  args: {
    color: '#ff6600',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: 'Pick color' })

    await userEvent.click(button)

    // Wait for popover to open - query from document body since popover uses a portal
    const body = within(document.body)
    await expect(body.getByText('#FF6600')).toBeInTheDocument()
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
        <ColorPicker
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
        <span className="text-sm font-mono text-foreground">{color}</span>
      </div>
    )
  },
}
