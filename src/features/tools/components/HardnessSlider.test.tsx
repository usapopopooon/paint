import { describe, test, expect, vi, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HardnessSlider } from './HardnessSlider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { LocaleProvider } from '@/features/i18n'

// Mock ResizeObserver for Radix UI components
beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <LocaleProvider>
      <TooltipProvider>{ui}</TooltipProvider>
    </LocaleProvider>
  )
}

describe('HardnessSlider', () => {
  test('スライダーを表示する', () => {
    renderWithProviders(<HardnessSlider hardness={0.5} onHardnessChange={vi.fn()} />)

    expect(screen.getByRole('slider')).toBeInTheDocument()
  })

  test('トグルボタンを表示する', () => {
    renderWithProviders(<HardnessSlider hardness={0.5} onHardnessChange={vi.fn()} />)

    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(1)
  })

  test('hardness=1の場合、スライダー値は100になる', () => {
    renderWithProviders(<HardnessSlider hardness={1} onHardnessChange={vi.fn()} />)

    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('aria-valuenow', '100')
  })

  test('hardness=0の場合、スライダーは無効になる（ぼかし無効状態）', () => {
    renderWithProviders(<HardnessSlider hardness={0} onHardnessChange={vi.fn()} />)

    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('data-disabled')
  })

  test('hardness=0.5の場合、スライダー値は50になる', () => {
    renderWithProviders(<HardnessSlider hardness={0.5} onHardnessChange={vi.fn()} />)

    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('aria-valuenow', '50')
  })

  test('ぼかし有効時にトグルボタンクリックで0になる', async () => {
    const onHardnessChange = vi.fn()
    const user = userEvent.setup()

    renderWithProviders(<HardnessSlider hardness={0.5} onHardnessChange={onHardnessChange} />)

    const toggleButton = screen.getByRole('button')
    await user.click(toggleButton)

    expect(onHardnessChange).toHaveBeenCalledWith(0)
  })

  test('ぼかし無効時にトグルボタンクリックで保存された値が復元される', async () => {
    const onHardnessChange = vi.fn()
    const user = userEvent.setup()

    // 初期状態: ぼかし無効（hardness=0）
    renderWithProviders(<HardnessSlider hardness={0} onHardnessChange={onHardnessChange} />)

    const toggleButton = screen.getByRole('button')
    await user.click(toggleButton)

    // デフォルトのぼかし値（0.5）が復元される
    expect(onHardnessChange).toHaveBeenCalledWith(0.5)
  })

  test('disabled=trueの場合、スライダーは無効', () => {
    renderWithProviders(
      <HardnessSlider hardness={0.5} onHardnessChange={vi.fn()} disabled={true} />
    )

    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('data-disabled')
  })

  test('disabled=trueの場合、トグルボタンは無効', () => {
    renderWithProviders(
      <HardnessSlider hardness={0.5} onHardnessChange={vi.fn()} disabled={true} />
    )

    const toggleButton = screen.getByRole('button')
    expect(toggleButton).toBeDisabled()
  })

  test('ぼかし有効時は、スライダーが有効', () => {
    renderWithProviders(<HardnessSlider hardness={0.5} onHardnessChange={vi.fn()} />)

    const slider = screen.getByRole('slider')
    expect(slider).not.toHaveAttribute('data-disabled')
  })

  test('ぼかし無効時（hardness=0）でもトグルボタンは有効', () => {
    renderWithProviders(<HardnessSlider hardness={0} onHardnessChange={vi.fn()} />)

    const toggleButton = screen.getByRole('button')
    expect(toggleButton).not.toBeDisabled()
  })

  test('ぼかし無効時でも保存された値がスライダーに表示される', () => {
    // hardness=0でも、デフォルトの保存値（50%）がスライダーに表示される
    renderWithProviders(<HardnessSlider hardness={0} onHardnessChange={vi.fn()} />)

    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('aria-valuenow', '50')
  })
})
