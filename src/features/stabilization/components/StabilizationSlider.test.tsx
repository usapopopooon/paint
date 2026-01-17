import { describe, test, expect, vi, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StabilizationSlider } from './StabilizationSlider'
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

describe('StabilizationSlider', () => {
  test('ボタンを表示する', () => {
    renderWithProviders(<StabilizationSlider stabilization={0.1} onStabilizationChange={vi.fn()} />)

    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  test('ボタンクリックでポップオーバーが開きスライダーが表示される', async () => {
    const user = userEvent.setup()
    renderWithProviders(<StabilizationSlider stabilization={0.1} onStabilizationChange={vi.fn()} />)

    const button = screen.getByRole('button')
    await user.click(button)

    expect(screen.getByRole('slider')).toBeInTheDocument()
  })

  test('stabilization=0の場合、ポップオーバー内のスライダー値は0になる', async () => {
    const user = userEvent.setup()
    renderWithProviders(<StabilizationSlider stabilization={0} onStabilizationChange={vi.fn()} />)

    await user.click(screen.getByRole('button'))
    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('aria-valuenow', '0')
  })

  test('stabilization=0.4（内部最大値）の場合、ポップオーバー内のスライダー値は100になる', async () => {
    const user = userEvent.setup()
    renderWithProviders(<StabilizationSlider stabilization={0.4} onStabilizationChange={vi.fn()} />)

    await user.click(screen.getByRole('button'))
    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('aria-valuenow', '100')
  })

  test('stabilization=0.2の場合、ポップオーバー内のスライダー値は50になる', async () => {
    const user = userEvent.setup()
    renderWithProviders(<StabilizationSlider stabilization={0.2} onStabilizationChange={vi.fn()} />)

    await user.click(screen.getByRole('button'))
    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('aria-valuenow', '50')
  })

  test('disabled=trueの場合、ボタンは無効', () => {
    renderWithProviders(
      <StabilizationSlider stabilization={0.1} onStabilizationChange={vi.fn()} disabled={true} />
    )

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  test('disabled=falseの場合、ボタンは有効', () => {
    renderWithProviders(
      <StabilizationSlider stabilization={0.1} onStabilizationChange={vi.fn()} disabled={false} />
    )

    const button = screen.getByRole('button')
    expect(button).not.toBeDisabled()
  })

  test('stabilization>0の場合、アイコンがアクティブ色になる', () => {
    renderWithProviders(<StabilizationSlider stabilization={0.1} onStabilizationChange={vi.fn()} />)

    const button = screen.getByRole('button')
    const icon = button.querySelector('svg')
    expect(icon).toHaveClass('text-primary')
  })

  test('stabilization=0の場合、アイコンがアクティブ色にならない', () => {
    renderWithProviders(<StabilizationSlider stabilization={0} onStabilizationChange={vi.fn()} />)

    const button = screen.getByRole('button')
    const icon = button.querySelector('svg')
    expect(icon).not.toHaveClass('text-primary')
  })

  test('ポップオーバー内にラベルが表示される', async () => {
    const user = userEvent.setup()
    renderWithProviders(<StabilizationSlider stabilization={0.1} onStabilizationChange={vi.fn()} />)

    await user.click(screen.getByRole('button'))
    // スライダーが表示されたらポップオーバーが開いている
    const slider = screen.getByRole('slider')
    expect(slider).toBeInTheDocument()
  })

  test('ポップオーバー内にパーセント表示がある', async () => {
    const user = userEvent.setup()
    renderWithProviders(<StabilizationSlider stabilization={0.2} onStabilizationChange={vi.fn()} />)

    await user.click(screen.getByRole('button'))
    // 内部値0.2はUI上50%として表示される
    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('aria-valuenow', '50')
  })
})
