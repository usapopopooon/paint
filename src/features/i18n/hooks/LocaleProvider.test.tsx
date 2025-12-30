import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LocaleProvider } from './LocaleProvider'
import { useLocale } from './useLocale'

// Mock storage
vi.mock('@/lib/storage', () => ({
  getStorageItem: vi.fn(() => null),
  setStorageItem: vi.fn(),
}))

// Test component that uses the locale context
const TestComponent = () => {
  const { locale, setLocale, toggleLocale, t } = useLocale()
  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <span data-testid="translation">{t('tools.pen')}</span>
      <button onClick={toggleLocale}>Toggle</button>
      <button onClick={() => setLocale('ja')}>Set Japanese</button>
      <button onClick={() => setLocale('en')}>Set English</button>
    </div>
  )
}

describe('LocaleProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should provide default locale as en', () => {
    render(
      <LocaleProvider defaultLocale="en">
        <TestComponent />
      </LocaleProvider>
    )

    expect(screen.getByTestId('locale')).toHaveTextContent('en')
    expect(screen.getByTestId('translation')).toHaveTextContent('Pen')
  })

  it('should provide default locale as ja', () => {
    render(
      <LocaleProvider defaultLocale="ja">
        <TestComponent />
      </LocaleProvider>
    )

    expect(screen.getByTestId('locale')).toHaveTextContent('ja')
    expect(screen.getByTestId('translation')).toHaveTextContent('ペン')
  })

  it('should toggle locale from en to ja', async () => {
    const user = userEvent.setup()

    render(
      <LocaleProvider defaultLocale="en">
        <TestComponent />
      </LocaleProvider>
    )

    expect(screen.getByTestId('locale')).toHaveTextContent('en')

    await user.click(screen.getByText('Toggle'))

    expect(screen.getByTestId('locale')).toHaveTextContent('ja')
    expect(screen.getByTestId('translation')).toHaveTextContent('ペン')
  })

  it('should toggle locale from ja to en', async () => {
    const user = userEvent.setup()

    render(
      <LocaleProvider defaultLocale="ja">
        <TestComponent />
      </LocaleProvider>
    )

    expect(screen.getByTestId('locale')).toHaveTextContent('ja')

    await user.click(screen.getByText('Toggle'))

    expect(screen.getByTestId('locale')).toHaveTextContent('en')
    expect(screen.getByTestId('translation')).toHaveTextContent('Pen')
  })

  it('should set locale directly with setLocale', async () => {
    const user = userEvent.setup()

    render(
      <LocaleProvider defaultLocale="en">
        <TestComponent />
      </LocaleProvider>
    )

    expect(screen.getByTestId('locale')).toHaveTextContent('en')

    await user.click(screen.getByText('Set Japanese'))

    expect(screen.getByTestId('locale')).toHaveTextContent('ja')
  })

  it('should translate different keys correctly', () => {
    const TranslationTestComponent = () => {
      const { t } = useLocale()
      return (
        <div>
          <span data-testid="pen">{t('tools.pen')}</span>
          <span data-testid="eraser">{t('tools.eraser')}</span>
          <span data-testid="undo">{t('actions.undo')}</span>
          <span data-testid="redo">{t('actions.redo')}</span>
          <span data-testid="clear">{t('actions.clear')}</span>
        </div>
      )
    }

    render(
      <LocaleProvider defaultLocale="en">
        <TranslationTestComponent />
      </LocaleProvider>
    )

    expect(screen.getByTestId('pen')).toHaveTextContent('Pen')
    expect(screen.getByTestId('eraser')).toHaveTextContent('Eraser')
    expect(screen.getByTestId('undo')).toHaveTextContent('Undo')
    expect(screen.getByTestId('redo')).toHaveTextContent('Redo')
    expect(screen.getByTestId('clear')).toHaveTextContent('Clear')
  })

  it('should translate different keys correctly in Japanese', () => {
    const TranslationTestComponent = () => {
      const { t } = useLocale()
      return (
        <div>
          <span data-testid="pen">{t('tools.pen')}</span>
          <span data-testid="eraser">{t('tools.eraser')}</span>
          <span data-testid="undo">{t('actions.undo')}</span>
          <span data-testid="redo">{t('actions.redo')}</span>
          <span data-testid="clear">{t('actions.clear')}</span>
        </div>
      )
    }

    render(
      <LocaleProvider defaultLocale="ja">
        <TranslationTestComponent />
      </LocaleProvider>
    )

    expect(screen.getByTestId('pen')).toHaveTextContent('ペン')
    expect(screen.getByTestId('eraser')).toHaveTextContent('消しゴム')
    expect(screen.getByTestId('undo')).toHaveTextContent('元に戻す')
    expect(screen.getByTestId('redo')).toHaveTextContent('やり直す')
    expect(screen.getByTestId('clear')).toHaveTextContent('クリア')
  })

  it('should update translations when locale changes', async () => {
    const user = userEvent.setup()

    render(
      <LocaleProvider defaultLocale="en">
        <TestComponent />
      </LocaleProvider>
    )

    expect(screen.getByTestId('translation')).toHaveTextContent('Pen')

    await user.click(screen.getByText('Toggle'))

    expect(screen.getByTestId('translation')).toHaveTextContent('ペン')

    await user.click(screen.getByText('Toggle'))

    expect(screen.getByTestId('translation')).toHaveTextContent('Pen')
  })
})
