import { useState, useEffect, useCallback } from 'react'
import { loadFromIndexedDB, clearFromIndexedDB, isIndexedDBAvailable } from '@/lib/indexedDB'
import { parseProjectFile, type ProjectFile } from '../domain'

type RecoveryState = {
  /** 復元可能なデータがあるか */
  readonly hasRecoverableData: boolean
  /** 復元データの保存日時 */
  readonly savedAt: number | null
  /** 復元処理中か */
  readonly isLoading: boolean
}

type UseRecoveryReturn = RecoveryState & {
  /** データを復元 */
  readonly restore: () => Promise<ProjectFile | null>
  /** データを破棄 */
  readonly discard: () => Promise<void>
  /** 復元確認を完了 */
  readonly completeCheck: () => void
}

/**
 * 自動保存データの復元を管理するhook
 */
export const useRecovery = (): UseRecoveryReturn => {
  const [state, setState] = useState<RecoveryState>({
    hasRecoverableData: false,
    savedAt: null,
    isLoading: true,
  })

  // 起動時に復元可能なデータをチェック
  useEffect(() => {
    const checkRecovery = async () => {
      if (!isIndexedDBAvailable()) {
        setState({ hasRecoverableData: false, savedAt: null, isLoading: false })
        return
      }

      try {
        const data = await loadFromIndexedDB()
        if (data) {
          // データが有効かチェック
          const parsed = parseProjectFile(JSON.parse(data.projectData))
          if (parsed.success) {
            setState({
              hasRecoverableData: true,
              savedAt: data.savedAt,
              isLoading: false,
            })
            return
          }
        }
      } catch {
        // パースエラーは無視
      }

      setState({ hasRecoverableData: false, savedAt: null, isLoading: false })
    }

    checkRecovery()
  }, [])

  // データを復元
  const restore = useCallback(async (): Promise<ProjectFile | null> => {
    if (!isIndexedDBAvailable()) return null

    try {
      const data = await loadFromIndexedDB()
      if (!data) return null

      const parsed = parseProjectFile(JSON.parse(data.projectData))
      if (parsed.success) {
        // 復元後はデータを残す（次の自動保存で上書きされる）
        // clearFromIndexedDB()を呼ばない
        setState({ hasRecoverableData: false, savedAt: null, isLoading: false })
        return parsed.data
      }
    } catch {
      // パースエラー
    }

    return null
  }, [])

  // データを破棄
  const discard = useCallback(async (): Promise<void> => {
    if (isIndexedDBAvailable()) {
      await clearFromIndexedDB()
    }
    setState({ hasRecoverableData: false, savedAt: null, isLoading: false })
  }, [])

  // 復元確認を完了（ダイアログを閉じる）
  const completeCheck = useCallback(() => {
    setState((prev) => ({ ...prev, hasRecoverableData: false }))
  }, [])

  return {
    ...state,
    restore,
    discard,
    completeCheck,
  }
}
