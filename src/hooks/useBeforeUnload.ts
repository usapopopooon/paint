import { useEffect } from 'react'

/**
 * ページを離れる前に確認ダイアログを表示するフック
 * @param enabled - 確認ダイアログを有効にするかどうか
 */
export function useBeforeUnload(enabled: boolean = true): void {
  useEffect(() => {
    if (!enabled) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [enabled])
}
