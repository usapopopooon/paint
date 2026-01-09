import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReloadPrompt } from './ReloadPrompt'

// showActionToastのモック
const mockShowActionToast = vi.fn()
vi.mock('@/components/ui/sonner', () => ({
  showActionToast: (options: unknown) => mockShowActionToast(options),
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

    expect(mockShowActionToast).not.toHaveBeenCalled()
  })

  test('needRefreshがtrueの場合、トーストを表示する', () => {
    mockNeedRefresh = true
    render(<ReloadPrompt />)

    expect(mockShowActionToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'pwa.newVersionAvailable',
        actionLabel: 'pwa.reload',
      })
    )
  })

  test('トーストのアクションボタンをクリックすると確認ダイアログが表示される', async () => {
    mockNeedRefresh = true
    render(<ReloadPrompt />)

    // showActionToastに渡されたonActionを取得して実行
    const toastCall = mockShowActionToast.mock.calls[0]
    const options = toastCall[0] as { onAction: () => void }
    act(() => {
      options.onAction()
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
    const toastCall = mockShowActionToast.mock.calls[0]
    const options = toastCall[0] as { onAction: () => void }
    act(() => {
      options.onAction()
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
    const toastCall = mockShowActionToast.mock.calls[0]
    const options = toastCall[0] as { onAction: () => void }
    act(() => {
      options.onAction()
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

    // showActionToastに渡されたonDismissを取得して実行
    const toastCall = mockShowActionToast.mock.calls[0]
    const options = toastCall[0] as { onDismiss: () => void }
    act(() => {
      options.onDismiss()
    })

    expect(mockSetNeedRefresh).toHaveBeenCalledWith(false)
  })
})
