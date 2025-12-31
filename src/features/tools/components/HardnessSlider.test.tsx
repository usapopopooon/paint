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

const defaultProps = {
  hardness: 0.5,
  onHardnessChange: vi.fn(),
  isBlurEnabled: true,
  onBlurEnabledChange: vi.fn(),
}

describe('HardnessSlider', () => {
  test('スライダーを表示する', () => {
    renderWithProviders(<HardnessSlider {...defaultProps} />)

    expect(screen.getByRole('slider')).toBeInTheDocument()
  })

  test('トグルボタンを表示する', () => {
    renderWithProviders(<HardnessSlider {...defaultProps} />)

    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(1)
  })

  test('hardness=1の場合、スライダー値は100になる', () => {
    renderWithProviders(<HardnessSlider {...defaultProps} hardness={1} />)

    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('aria-valuenow', '100')
  })

  test('hardness=0の場合、スライダー値は0になる', () => {
    renderWithProviders(<HardnessSlider {...defaultProps} hardness={0} />)

    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('aria-valuenow', '0')
  })

  test('hardness=0.5の場合、スライダー値は50になる', () => {
    renderWithProviders(<HardnessSlider {...defaultProps} hardness={0.5} />)

    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('aria-valuenow', '50')
  })

  test('ぼかし有効時にトグルボタンクリックでonBlurEnabledChangeが呼ばれる', async () => {
    const onBlurEnabledChange = vi.fn()
    const user = userEvent.setup()

    renderWithProviders(
      <HardnessSlider
        {...defaultProps}
        isBlurEnabled={true}
        onBlurEnabledChange={onBlurEnabledChange}
      />
    )

    const toggleButton = screen.getByRole('button')
    await user.click(toggleButton)

    expect(onBlurEnabledChange).toHaveBeenCalledWith(false)
  })

  test('ぼかし無効時にトグルボタンクリックでonBlurEnabledChangeが呼ばれる', async () => {
    const onBlurEnabledChange = vi.fn()
    const user = userEvent.setup()

    renderWithProviders(
      <HardnessSlider
        {...defaultProps}
        isBlurEnabled={false}
        onBlurEnabledChange={onBlurEnabledChange}
      />
    )

    const toggleButton = screen.getByRole('button')
    await user.click(toggleButton)

    expect(onBlurEnabledChange).toHaveBeenCalledWith(true)
  })

  test('disabled=trueの場合、スライダーは無効', () => {
    renderWithProviders(<HardnessSlider {...defaultProps} disabled={true} />)

    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('data-disabled')
  })

  test('disabled=trueの場合、トグルボタンは無効', () => {
    renderWithProviders(<HardnessSlider {...defaultProps} disabled={true} />)

    const toggleButton = screen.getByRole('button')
    expect(toggleButton).toBeDisabled()
  })

  test('ぼかし有効時は、スライダーが有効', () => {
    renderWithProviders(<HardnessSlider {...defaultProps} isBlurEnabled={true} />)

    const slider = screen.getByRole('slider')
    expect(slider).not.toHaveAttribute('data-disabled')
  })

  test('ぼかし無効時でもトグルボタンは有効', () => {
    renderWithProviders(<HardnessSlider {...defaultProps} isBlurEnabled={false} />)

    const toggleButton = screen.getByRole('button')
    expect(toggleButton).not.toBeDisabled()
  })

  test('isBlurEnabledがfalseの場合、トグルアイコンがprimary色になる', () => {
    renderWithProviders(<HardnessSlider {...defaultProps} isBlurEnabled={false} />)

    const toggleButton = screen.getByRole('button')
    const icon = toggleButton.querySelector('svg')
    expect(icon).toHaveClass('text-primary')
  })

  test('isBlurEnabledがtrueの場合、トグルアイコンがmuted色になる', () => {
    renderWithProviders(<HardnessSlider {...defaultProps} isBlurEnabled={true} />)

    const toggleButton = screen.getByRole('button')
    const icon = toggleButton.querySelector('svg')
    expect(icon).toHaveClass('text-muted-foreground')
  })
})
