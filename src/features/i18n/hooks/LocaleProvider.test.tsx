import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'
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

  test('jaからenにロケールを切り替える', async () => {
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

  test('異なるキーを正しく翻訳する', () => {
    const TranslationTestComponent = () => {
      const { t } = useLocale()
      return (
        <div>
          <span data-testid="pen">{t('tools.pen')}</span>
          <span data-testid="eraser">{t('tools.eraser')}</span>
          <span data-testid="undo">{t('actions.undo')}</span>
          <span data-testid="redo">{t('actions.redo')}</span>
          <span data-testid="clear">{t('actions.clearLayer')}</span>
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
    expect(screen.getByTestId('clear')).toHaveTextContent('Clear layer')
  })

  test('日本語で異なるキーを正しく翻訳する', () => {
    const TranslationTestComponent = () => {
      const { t } = useLocale()
      return (
        <div>
          <span data-testid="pen">{t('tools.pen')}</span>
          <span data-testid="eraser">{t('tools.eraser')}</span>
          <span data-testid="undo">{t('actions.undo')}</span>
          <span data-testid="redo">{t('actions.redo')}</span>
          <span data-testid="clear">{t('actions.clearLayer')}</span>
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
    expect(screen.getByTestId('clear')).toHaveTextContent('レイヤーをクリア')
  })

  test('ロケール変更時に翻訳を更新する', async () => {
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

  test('第3引数でロケールを上書きする', () => {
    const OverrideTestComponent = () => {
      const { t } = useLocale()
      return (
        <div>
          <span data-testid="default">{t('tools.pen')}</span>
          <span data-testid="force-en">{t('tools.pen', {}, 'en')}</span>
          <span data-testid="force-ja">{t('tools.pen', {}, 'ja')}</span>
        </div>
      )
    }

    render(
      <LocaleProvider defaultLocale="ja">
        <OverrideTestComponent />
      </LocaleProvider>
    )

    expect(screen.getByTestId('default')).toHaveTextContent('ペン')
    expect(screen.getByTestId('force-en')).toHaveTextContent('Pen')
    expect(screen.getByTestId('force-ja')).toHaveTextContent('ペン')
  })

  test('現在のロケールに関係なくロケールを上書きする', () => {
    const OverrideTestComponent = () => {
      const { t } = useLocale()
      return (
        <div>
          <span data-testid="default">{t('actions.clearLayer')}</span>
          <span data-testid="force-en">{t('actions.clearLayer', {}, 'en')}</span>
          <span data-testid="force-ja">{t('actions.clearLayer', {}, 'ja')}</span>
        </div>
      )
    }

    render(
      <LocaleProvider defaultLocale="en">
        <OverrideTestComponent />
      </LocaleProvider>
    )

    expect(screen.getByTestId('default')).toHaveTextContent('Clear layer')
    expect(screen.getByTestId('force-en')).toHaveTextContent('Clear layer')
    expect(screen.getByTestId('force-ja')).toHaveTextContent('レイヤーをクリア')
  })
})
