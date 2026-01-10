import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

type PwaUpdateContextValue = {
  /** 新しいバージョンが利用可能かどうか */
  needRefresh: boolean
  /** 更新を適用する */
  updateApp: () => void
  /** 更新を確認する（Service Workerを再チェック） */
  checkForUpdate: () => Promise<void>
  /** 更新通知を非表示にする（キャンセル時） */
  dismissUpdate: () => void
}

const PwaUpdateContext = createContext<PwaUpdateContextValue | null>(null)

type PwaUpdateProviderProps = {
  children: ReactNode
}

/**
 * PWA更新状態を管理するプロバイダー
 * アプリ全体で更新状態を共有できるようにする
 */
export const PwaUpdateProvider = ({ children }: PwaUpdateProviderProps) => {
  const [dismissed, setDismissed] = useState(false)

  const {
    needRefresh: [needRefreshInternal],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(error) {
      console.error('SW registration error:', error)
    },
  })

  // キャンセルされていない場合のみ更新が必要と表示
  const needRefresh = needRefreshInternal && !dismissed

  const updateApp = useCallback(() => {
    updateServiceWorker(true)
  }, [updateServiceWorker])

  const checkForUpdate = useCallback(async () => {
    // Service Workerの更新をチェック
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        await registration.update()
      }
    }
    // 一度キャンセルした後も再度表示できるようにする
    setDismissed(false)
  }, [])

  const dismissUpdate = useCallback(() => {
    setDismissed(true)
  }, [])

  return (
    <PwaUpdateContext.Provider
      value={{
        needRefresh,
        updateApp,
        checkForUpdate,
        dismissUpdate,
      }}
    >
      {children}
    </PwaUpdateContext.Provider>
  )
}

/**
 * PWA更新状態を取得するフック
 */
export const usePwaUpdate = (): PwaUpdateContextValue => {
  const context = useContext(PwaUpdateContext)
  if (!context) {
    throw new Error('usePwaUpdate must be used within a PwaUpdateProvider')
  }
  return context
}
