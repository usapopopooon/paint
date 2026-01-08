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

/**
 * 入力フィールドに直接HEXコードを入力するケース
 */
export const DirectInput: Story = {
  args: {
    color: '#000000',
  },
  render: (args) => <InteractiveColorWheel {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox')

    // 入力フィールドをクリア
    await userEvent.clear(input)

    // 新しい色を入力
    await userEvent.type(input, '#FF5500')

    // Enterキーで確定
    await userEvent.keyboard('{Enter}')

    // onChangeが呼ばれることを確認（normalizeHexは小文字で返す）
    await expect(args.onChange).toHaveBeenCalledWith('#ff5500')
  },
}

/**
 * #なしのHEXコードを入力するケース
 */
export const InputWithoutHash: Story = {
  args: {
    color: '#000000',
  },
  render: (args) => <InteractiveColorWheel {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox')

    await userEvent.clear(input)
    await userEvent.type(input, 'AA33FF')
    await userEvent.keyboard('{Enter}')

    // #が自動で付与されることを確認（normalizeHexは小文字で返す）
    await expect(args.onChange).toHaveBeenCalledWith('#aa33ff')
  },
}

/**
 * 無効な入力で元の値に戻るケース
 */
export const InvalidInputReverts: Story = {
  args: {
    color: '#FF0000',
  },
  render: (args) => <InteractiveColorWheel {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox')

    // 初期値を確認
    await expect(input).toHaveValue('#FF0000')

    // 無効な値を入力
    await userEvent.clear(input)
    await userEvent.type(input, 'invalid')
    await userEvent.keyboard('{Enter}')

    // 元の値に戻ることを確認
    await expect(input).toHaveValue('#FF0000')
  },
}

/**
 * コピー・ペーストボタンが存在するケース
 */
export const CopyPasteButtons: Story = {
  args: {
    color: '#3366FF',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // コピーボタンとペーストボタンが存在することを確認
    const copyButton = canvas.getByLabelText('Copy')
    const pasteButton = canvas.getByLabelText('Paste')

    await expect(copyButton).toBeInTheDocument()
    await expect(pasteButton).toBeInTheDocument()
  },
}

/**
 * カラーホイールが表示されるケース
 */
export const ColorWheelVisible: Story = {
  args: {
    color: '#ff0000',
  },
  render: (args) => <InteractiveColorWheel {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // 初期値を確認
    const input = canvas.getByRole('textbox')
    await expect(input).toHaveValue('#FF0000')

    // カラーホイールコンテナが存在することを確認
    const colorWheelContainer = canvasElement.querySelector('.cursor-crosshair') as HTMLElement
    await expect(colorWheelContainer).toBeInTheDocument()
  },
}
