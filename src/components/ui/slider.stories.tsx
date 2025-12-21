import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { Slider } from './slider'

const meta = {
  title: 'UI/Slider',
  component: Slider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    onValueChange: fn(),
  },
  argTypes: {
    min: {
      control: 'number',
    },
    max: {
      control: 'number',
    },
    step: {
      control: 'number',
    },
    disabled: {
      control: 'boolean',
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
  },
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Slider>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    defaultValue: [50],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const slider = canvas.getByRole('slider')

    await expect(slider).toBeInTheDocument()
    await expect(slider).toHaveAttribute('aria-valuenow', '50')
  },
}

export const WithMinMax: Story = {
  args: {
    defaultValue: [25],
    min: 0,
    max: 100,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const slider = canvas.getByRole('slider')

    await expect(slider).toHaveAttribute('aria-valuemin', '0')
    await expect(slider).toHaveAttribute('aria-valuemax', '100')
    await expect(slider).toHaveAttribute('aria-valuenow', '25')
  },
}

export const WithStep: Story = {
  args: {
    defaultValue: [50],
    min: 0,
    max: 100,
    step: 10,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const slider = canvas.getByRole('slider')

    await expect(slider).toBeInTheDocument()
  },
}

export const Disabled: Story = {
  args: {
    defaultValue: [50],
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const slider = canvas.getByRole('slider')

    await expect(slider).toHaveAttribute('data-disabled', '')
  },
}

export const Range: Story = {
  args: {
    defaultValue: [25, 75],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const sliders = canvas.getAllByRole('slider')

    await expect(sliders).toHaveLength(2)
    await expect(sliders[0]).toHaveAttribute('aria-valuenow', '25')
    await expect(sliders[1]).toHaveAttribute('aria-valuenow', '75')
  },
}

export const Vertical: Story = {
  args: {
    defaultValue: [50],
    orientation: 'vertical',
  },
  decorators: [
    (Story) => (
      <div className="h-48">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const slider = canvas.getByRole('slider')

    await expect(slider).toBeInTheDocument()
  },
}

export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = React.useState([30])
    return (
      <div className="flex flex-col gap-4">
        <Slider
          {...args}
          value={value}
          onValueChange={(newValue) => {
            setValue(newValue)
            args.onValueChange?.(newValue)
          }}
        />
        <span className="text-sm text-foreground">Value: {value[0]}</span>
      </div>
    )
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const slider = canvas.getByRole('slider')

    await expect(slider).toHaveAttribute('aria-valuenow', '30')
    await expect(canvas.getByText('Value: 30')).toBeInTheDocument()

    await userEvent.keyboard('{ArrowRight}')
    await expect(args.onValueChange).toHaveBeenCalled()
  },
}

export const StrokeWidth: Story = {
  args: {
    defaultValue: [3],
    min: 1,
    max: 20,
    step: 1,
  },
  render: (args) => {
    const [value, setValue] = React.useState([args.defaultValue?.[0] ?? 3])
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Width:</span>
        <Slider
          {...args}
          value={value}
          onValueChange={(newValue) => {
            setValue(newValue)
            args.onValueChange?.(newValue)
          }}
          className="w-32"
        />
        <span className="w-6 text-sm text-foreground">{value[0]}</span>
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const slider = canvas.getByRole('slider')

    await expect(slider).toHaveAttribute('aria-valuemin', '1')
    await expect(slider).toHaveAttribute('aria-valuemax', '20')
    await expect(slider).toHaveAttribute('aria-valuenow', '3')
    await expect(canvas.getByText('Width:')).toBeInTheDocument()
    await expect(canvas.getByText('3')).toBeInTheDocument()
  },
}
