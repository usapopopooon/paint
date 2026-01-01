import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { LocaleProvider, useLocale, useTranslation } from '.'

// Mock storage
vi.mock('@/lib/storage', () => ({
  getStorageItem: vi.fn(() => null),
  setStorageItem: vi.fn(),
}))

// Test component that uses the locale hooks
const TestComponent = () => {
  const { locale, setLocale } = useLocale()
  const { t } = useTranslation()
  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <span data-testid="translation">{t('tools.pen')}</span>
      <button onClick={() => setLocale(locale === 'en' ? 'ja' : 'en')}>Toggle</button>
      <button onClick={() => setLocale('ja')}>Set Japanese</button>
      <button onClick={() => setLocale('en')}>Set English</button>
    </div>
  )
}

describe('LocaleProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('デフォルトロケールとしてenを提供する', () => {
    render(
      <LocaleProvider defaultLocale="en">
        <TestComponent />
      </LocaleProvider>
    )

    expect(screen.getByTestId('locale')).toHaveTextContent('en')
    expect(screen.getByTestId('translation')).toHaveTextContent('Pen')
  })

  test('デフォルトロケールとしてjaを提供する', () => {
    render(
      <LocaleProvider defaultLocale="ja">
        <TestComponent />
      </LocaleProvider>
    )

    expect(screen.getByTestId('locale')).toHaveTextContent('ja')
    expect(screen.getByTestId('translation')).toHaveTextContent('ペン')
  })

  test('enからjaにロケールを切り替える', async () => {
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

  test('setLocaleでロケールを直接設定する', async () => {
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
})
