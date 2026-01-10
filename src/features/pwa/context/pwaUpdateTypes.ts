import { createContext } from 'react'

type CheckForUpdateResult = {
  /** 更新が利用可能かどうか */
  updateAvailable: boolean
}

export type PwaUpdateContextValue = {
  /** 新しいバージョンが利用可能かどうか */
  needRefresh: boolean
  /** 更新を適用する */
  updateApp: () => void
  /** 更新を確認する（Service Workerを再チェック）。結果を返す */
  checkForUpdate: () => Promise<CheckForUpdateResult>
  /** 更新通知を非表示にする（キャンセル時） */
  dismissUpdate: () => void
}

export const PwaUpdateContext = createContext<PwaUpdateContextValue | null>(null)
