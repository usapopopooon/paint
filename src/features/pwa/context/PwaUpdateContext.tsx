import { useState, useCallback, type ReactNode } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { PwaUpdateContext } from './pwaUpdateTypes'

type CheckForUpdateResult = {
  /** 更新が利用可能かどうか */
  updateAvailable: boolean
}

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

  const checkForUpdate = useCallback(async (): Promise<CheckForUpdateResult> => {
    // 一度キャンセルした後も再度表示できるようにする
    setDismissed(false)

    // 既に更新が利用可能な場合はすぐに返す
    if (needRefreshInternal) {
      return { updateAvailable: true }
    }

    // Service Workerの更新をチェック
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        await registration.update()
        // update()後、waitingまたはinstallingに新しいSWがあれば更新あり
        if (registration.waiting || registration.installing) {
          return { updateAvailable: true }
        }
      }
    }

    return { updateAvailable: false }
  }, [needRefreshInternal])

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
