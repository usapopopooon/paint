import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { Button } from './button'

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    onClick: fn(),
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon', 'icon-sm', 'icon-lg'],
    },
    disabled: {
      control: 'boolean',
    },
    asChild: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Button',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: 'Button' })

    await expect(button).toBeInTheDocument()
    await expect(button).toHaveAttribute('data-variant', 'default')
    await expect(button).toHaveAttribute('data-size', 'default')

    await userEvent.click(button)
    await expect(args.onClick).toHaveBeenCalledTimes(1)
  },
}

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Delete',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: 'Delete' })

    await expect(button).toHaveAttribute('data-variant', 'destructive')
  },
}

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: 'Outline' })

    await expect(button).toHaveAttribute('data-variant', 'outline')
  },
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: 'Secondary' })

    await expect(button).toHaveAttribute('data-variant', 'secondary')
  },
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: 'Ghost' })

    await expect(button).toHaveAttribute('data-variant', 'ghost')
  },
}

export const Link: Story = {
  args: {
    variant: 'link',
    children: 'Link',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: 'Link' })

    await expect(button).toHaveAttribute('data-variant', 'link')
  },
}

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: 'Small' })

    await expect(button).toHaveAttribute('data-size', 'sm')
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: 'Large' })

    await expect(button).toHaveAttribute('data-size', 'lg')
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: 'Disabled' })

    await expect(button).toBeDisabled()

    await userEvent.click(button)
    await expect(args.onClick).not.toHaveBeenCalled()
  },
}

export const WithCustomClassName: Story = {
  args: {
    children: 'Custom',
    className: 'custom-class',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: 'Custom' })

    await expect(button).toHaveClass('custom-class')
  },
}

export const AsChild: Story = {
  args: {
    asChild: true,
    children: <a href="/test">Link Button</a>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const link = canvas.getByRole('link', { name: 'Link Button' })

    await expect(link).toBeInTheDocument()
    await expect(link).toHaveAttribute('href', '/test')
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByRole('button', { name: 'Default' })).toBeInTheDocument()
    await expect(canvas.getByRole('button', { name: 'Destructive' })).toBeInTheDocument()
    await expect(canvas.getByRole('button', { name: 'Outline' })).toBeInTheDocument()
    await expect(canvas.getByRole('button', { name: 'Secondary' })).toBeInTheDocument()
    await expect(canvas.getByRole('button', { name: 'Ghost' })).toBeInTheDocument()
    await expect(canvas.getByRole('button', { name: 'Link' })).toBeInTheDocument()
  },
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByRole('button', { name: 'Small' })).toHaveAttribute('data-size', 'sm')
    await expect(canvas.getByRole('button', { name: 'Default' })).toHaveAttribute('data-size', 'default')
    await expect(canvas.getByRole('button', { name: 'Large' })).toHaveAttribute('data-size', 'lg')
  },
}
