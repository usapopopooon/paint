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
 * SV領域（四角い部分）をポインターでクリックして色を変更するケース
 */
export const ClickSvArea: Story = {
  args: {
    color: '#ff0000',
  },
  render: (args) => <InteractiveColorWheel {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)

    // 初期値を確認
    const input = canvas.getByRole('textbox')
    await expect(input).toHaveValue('#FF0000')

    // SV領域（カラーホイールの中央の四角い部分）をポインターでクリック
    const colorWheelContainer = canvasElement.querySelector('.cursor-crosshair') as HTMLElement
    await expect(colorWheelContainer).toBeInTheDocument()

    // 中央付近をクリックして色を変更（ホイールサイズ200pxなので中心は100,100）
    await userEvent.pointer({
      keys: '[MouseLeft]',
      target: colorWheelContainer,
      coords: { x: 100, y: 100 },
    })

    // 色が変更されたことを確認（onChangeが呼ばれた）
    await expect(args.onChange).toHaveBeenCalled()
  },
}

/**
 * Hueリング（丸い色相部分）をポインターでクリックして色相を変更するケース
 */
export const ClickHueRing: Story = {
  args: {
    color: '#ff0000',
  },
  render: (args) => <InteractiveColorWheel {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)

    // 初期値を確認（赤）
    const input = canvas.getByRole('textbox')
    await expect(input).toHaveValue('#FF0000')

    // カラーホイールコンテナを取得
    const colorWheelContainer = canvasElement.querySelector('.cursor-crosshair') as HTMLElement
    await expect(colorWheelContainer).toBeInTheDocument()

    // Hueリング上（右端付近＝シアン方向）をクリックして色相を変更
    // ホイールサイズ200px、リング幅16pxなので、右端のリング中央は約x:192, y:100
    await userEvent.pointer({
      keys: '[MouseLeft]',
      target: colorWheelContainer,
      coords: { x: 192, y: 100 },
    })

    // 色が変更されたことを確認（onChangeが呼ばれた）
    await expect(args.onChange).toHaveBeenCalled()

    // 色相が変わったので、入力値も変わっているはず（赤以外になる）
    await expect(input).not.toHaveValue('#FF0000')
  },
}

/**
 * キーボード操作で色相を変更するケース
 */
export const KeyboardHueControl: Story = {
  args: {
    color: '#ff0000',
  },
  render: (args) => <InteractiveColorWheel {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)

    // 色相スライダーを取得
    const hueSlider = canvas.getByRole('slider', { name: /色相|Hue/i })
    await expect(hueSlider).toBeInTheDocument()

    // フォーカスを当てる
    await userEvent.click(hueSlider)
    await expect(hueSlider).toHaveFocus()

    // 右矢印キーで色相を増加
    await userEvent.keyboard('{ArrowRight}')
    await expect(args.onChange).toHaveBeenCalled()

    // 入力値が変わったことを確認
    const input = canvas.getByRole('textbox')
    await expect(input).not.toHaveValue('#FF0000')
  },
}

/**
 * キーボード操作で彩度・明度を変更するケース
 */
export const KeyboardSvControl: Story = {
  args: {
    color: '#ff0000',
  },
  render: (args) => <InteractiveColorWheel {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)

    // 彩度・明度スライダーを取得
    const svSlider = canvas.getByRole('slider', { name: /彩度と明度|Saturation and brightness/i })
    await expect(svSlider).toBeInTheDocument()

    // フォーカスを当てる
    await userEvent.click(svSlider)
    await expect(svSlider).toHaveFocus()

    // 下矢印キーで明度を減少
    await userEvent.keyboard('{ArrowDown}')
    await expect(args.onChange).toHaveBeenCalled()

    // 入力値が変わったことを確認
    const input = canvas.getByRole('textbox')
    await expect(input).not.toHaveValue('#FF0000')
  },
}

/**
 * ARIA属性が正しく設定されているかのテスト
 */
export const AccessibilityAttributes: Story = {
  args: {
    color: '#ff0000',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // 色相スライダーのARIA属性を確認
    const hueSlider = canvas.getByRole('slider', { name: /色相|Hue/i })
    await expect(hueSlider).toHaveAttribute('aria-valuenow')
    await expect(hueSlider).toHaveAttribute('aria-valuemin', '0')
    await expect(hueSlider).toHaveAttribute('aria-valuemax', '359')
    await expect(hueSlider).toHaveAttribute('aria-valuetext')

    // 彩度・明度スライダーのARIA属性を確認
    const svSlider = canvas.getByRole('slider', { name: /彩度と明度|Saturation and brightness/i })
    await expect(svSlider).toHaveAttribute('aria-valuenow')
    await expect(svSlider).toHaveAttribute('aria-valuemin', '0')
    await expect(svSlider).toHaveAttribute('aria-valuemax', '100')
    await expect(svSlider).toHaveAttribute('aria-valuetext')
  },
}

/**
 * 色相リングにフォーカスリングが表示されるケース
 */
export const HueRingFocusRing: Story = {
  args: {
    color: '#ff0000',
  },
  render: (args) => <InteractiveColorWheel {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // 色相リングを取得（role="slider"でフォーカス可能）
    const hueRing = canvas.getByRole('slider', { name: /色相|Hue/i })
    await expect(hueRing).toBeInTheDocument()

    // フォーカスを当てる
    await userEvent.click(hueRing)
    await expect(hueRing).toHaveFocus()

    // rounded-fullクラスがあることを確認（リング形状）
    await expect(hueRing).toHaveClass('rounded-full')
  },
}

/**
 * SV正方形にフォーカスリングが表示されるケース
 */
export const SvSquareFocusRing: Story = {
  args: {
    color: '#ff0000',
  },
  render: (args) => <InteractiveColorWheel {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // SV正方形を取得（role="slider"でフォーカス可能）
    const svSquare = canvas.getByRole('slider', { name: /彩度と明度|Saturation and brightness/i })
    await expect(svSquare).toBeInTheDocument()

    // フォーカスを当てる
    await userEvent.click(svSquare)
    await expect(svSquare).toHaveFocus()

    // rounded-smクラスがあることを確認（角丸正方形）
    await expect(svSquare).toHaveClass('rounded-sm')
  },
}

/**
 * Tabキーで色相リングとSV正方形を移動できるケース
 */
export const TabNavigation: Story = {
  args: {
    color: '#ff0000',
  },
  render: (args) => <InteractiveColorWheel {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const hueRing = canvas.getByRole('slider', { name: /色相|Hue/i })
    const svSquare = canvas.getByRole('slider', { name: /彩度と明度|Saturation and brightness/i })

    // 色相リングにフォーカス
    await userEvent.click(hueRing)
    await expect(hueRing).toHaveFocus()

    // Tabキーで次の要素に移動
    await userEvent.tab()

    // SV正方形にフォーカスが移動することを確認
    await expect(svSquare).toHaveFocus()
  },
}
