/**
 * virtual:pwa-register/react のモック
 * テスト環境でPWA関連のモジュールを解決するために使用
 */
import { useState } from 'react'

interface UseRegisterSWOptions {
  onRegisteredSW?: (swUrl: string, registration: ServiceWorkerRegistration | undefined) => void
  onRegisterError?: (error: Error) => void
}

export const useRegisterSW = (_options?: UseRegisterSWOptions) => {
  const [needRefresh, setNeedRefresh] = useState(false)
  const [offlineReady, setOfflineReady] = useState(false)

  const updateServiceWorker = (_reloadPage?: boolean) => {
    // モック実装
  }

  return {
    needRefresh: [needRefresh, setNeedRefresh] as const,
    offlineReady: [offlineReady, setOfflineReady] as const,
    updateServiceWorker,
  }
}
