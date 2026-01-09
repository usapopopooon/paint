import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReloadPrompt } from './ReloadPrompt'

// sonnerのモック
const mockToast = vi.fn()
vi.mock('sonner', () => ({
  toast: (message: string, options: unknown) => mockToast(message, options),
}))

// i18nのモック
vi.mock('@bf-i18n/react', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

// useRegisterSWのモック状態
let mockNeedRefresh = false
const mockSetNeedRefresh = vi.fn()
const mockUpdateServiceWorker = vi.fn()

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({
    needRefresh: [mockNeedRefresh, mockSetNeedRefresh],
    offlineReady: [false, vi.fn()],
    updateServiceWorker: mockUpdateServiceWorker,
  }),
}))

describe('ReloadPrompt', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNeedRefresh = false
  })

  test('needRefreshがfalseの場合、トーストを表示しない', () => {
    mockNeedRefresh = false
    render(<ReloadPrompt />)

    expect(mockToast).not.toHaveBeenCalled()
  })

  test('needRefreshがtrueの場合、トーストを表示する', () => {
    mockNeedRefresh = true
    render(<ReloadPrompt />)

    expect(mockToast).toHaveBeenCalledWith(
      'pwa.newVersionAvailable',
      expect.objectContaining({
        duration: Infinity,
        action: expect.objectContaining({
          label: 'pwa.reload',
        }),
      })
    )
  })

  test('トーストのアクションボタンをクリックすると確認ダイアログが表示される', async () => {
    mockNeedRefresh = true
    render(<ReloadPrompt />)

    // toastに渡されたactionのonClickを取得して実行
    const toastCall = mockToast.mock.calls[0]
    const options = toastCall[1] as { action: { onClick: () => void } }
    act(() => {
      options.action.onClick()
    })

    // 確認ダイアログが表示される
    expect(screen.getByText('pwa.confirmReload.title')).toBeInTheDocument()
    expect(screen.getByText('pwa.confirmReload.description')).toBeInTheDocument()

    // updateServiceWorkerはまだ呼ばれていない
    expect(mockUpdateServiceWorker).not.toHaveBeenCalled()
  })

  test('確認ダイアログで「更新する」をクリックするとupdateServiceWorkerが呼ばれる', async () => {
    const user = userEvent.setup()
    mockNeedRefresh = true
    render(<ReloadPrompt />)

    // トーストのアクションをクリック
    const toastCall = mockToast.mock.calls[0]
    const options = toastCall[1] as { action: { onClick: () => void } }
    act(() => {
      options.action.onClick()
    })

    // 確認ボタンをクリック
    const confirmButton = screen.getByText('pwa.confirmReload.confirm')
    await user.click(confirmButton)

    expect(mockUpdateServiceWorker).toHaveBeenCalledWith(true)
  })

  test('確認ダイアログで「キャンセル」をクリックするとダイアログが閉じてupdateServiceWorkerは呼ばれない', async () => {
    const user = userEvent.setup()
    mockNeedRefresh = true
    render(<ReloadPrompt />)

    // トーストのアクションをクリック
    const toastCall = mockToast.mock.calls[0]
    const options = toastCall[1] as { action: { onClick: () => void } }
    act(() => {
      options.action.onClick()
    })

    // キャンセルボタンをクリック
    const cancelButton = screen.getByText('pwa.confirmReload.cancel')
    await user.click(cancelButton)

    // ダイアログが閉じる（タイトルが表示されなくなる）
    expect(screen.queryByText('pwa.confirmReload.title')).not.toBeInTheDocument()

    // updateServiceWorkerは呼ばれていない
    expect(mockUpdateServiceWorker).not.toHaveBeenCalled()
  })

  test('トーストを閉じるとsetNeedRefreshがfalseで呼ばれる', () => {
    mockNeedRefresh = true
    render(<ReloadPrompt />)

    // toastに渡されたonDismissを取得して実行
    const toastCall = mockToast.mock.calls[0]
    const options = toastCall[1] as { onDismiss: () => void }
    act(() => {
      options.onDismiss()
    })

    expect(mockSetNeedRefresh).toHaveBeenCalledWith(false)
  })
})
