import { describe, test, expect, vi, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OpacityPopover } from './OpacityPopover'
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

describe('OpacityPopover', () => {
  test('ゴーストアイコンのボタンを表示する', () => {
    renderWithProviders(<OpacityPopover opacity={1} onOpacityChange={vi.fn()} />)

    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  test('ボタンクリックでonOpenが呼ばれる', async () => {
    const onOpen = vi.fn()
    const user = userEvent.setup()

    renderWithProviders(<OpacityPopover opacity={1} onOpacityChange={vi.fn()} onOpen={onOpen} />)

    await user.click(screen.getByRole('button'))

    expect(onOpen).toHaveBeenCalledTimes(1)
  })

  test('ボタンクリックでポップオーバーが開く', async () => {
    const user = userEvent.setup()

    renderWithProviders(<OpacityPopover opacity={0.5} onOpacityChange={vi.fn()} />)

    await user.click(screen.getByRole('button'))

    expect(screen.getByRole('slider')).toBeInTheDocument()
    expect(screen.getByText('50%')).toBeInTheDocument()
  })

  test('opacity=1の場合100%と表示される', async () => {
    const user = userEvent.setup()

    renderWithProviders(<OpacityPopover opacity={1} onOpacityChange={vi.fn()} />)

    await user.click(screen.getByRole('button'))

    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  test('opacity=0の場合0%と表示される', async () => {
    const user = userEvent.setup()

    renderWithProviders(<OpacityPopover opacity={0} onOpacityChange={vi.fn()} />)

    await user.click(screen.getByRole('button'))

    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  test('opacity=0.25の場合25%と表示される', async () => {
    const user = userEvent.setup()

    renderWithProviders(<OpacityPopover opacity={0.25} onOpacityChange={vi.fn()} />)

    await user.click(screen.getByRole('button'))

    expect(screen.getByText('25%')).toBeInTheDocument()
  })
})
