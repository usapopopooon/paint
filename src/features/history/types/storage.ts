import type { HistoryAction } from './actions'

/**
 * 非同期ストレージ操作の結果型
 */
export type StorageResult<T> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: string }

/**
 * ストレージ実装の設定
 */
export type HistoryStorageConfig = {
  readonly maxUndoLevels?: number // デフォルト: 100
}

/**
 * UI状態用のスタック情報
 */
export type StackInfo = {
  readonly undoCount: number
  readonly redoCount: number
}

/**
 * 履歴ストレージの抽象インターフェース
 *
 * 実装:
 * - InMemoryStorage（デフォルト）
 * - IndexedDBStorage（将来）
 * - LocalStorageStorage（将来）
 * - CloudStorage（将来）
 */
export interface HistoryStorage {
  /**
   * 新しいアクションをundoスタックにプッシュし、redoスタックをクリア
   */
  readonly push: (action: HistoryAction) => Promise<StorageResult<void>>

  /**
   * undoスタックから最新のアクションをポップしてredoスタックにプッシュ
   * undoされたアクションを返す
   */
  readonly undo: () => Promise<StorageResult<HistoryAction | null>>

  /**
   * redoスタックからポップしてundoスタックにプッシュ
   * redoされたアクションを返す
   */
  readonly redo: () => Promise<StorageResult<HistoryAction | null>>

  /**
   * 現在のundo/redoスタックサイズを取得
   */
  readonly getStackInfo: () => Promise<StorageResult<StackInfo>>

  /**
   * 次にundoされるアクションを覗き見（スタックは変更しない）
   */
  readonly peekUndo: () => Promise<StorageResult<HistoryAction | null>>

  /**
   * 次にredoされるアクションを覗き見（スタックは変更しない）
   */
  readonly peekRedo: () => Promise<StorageResult<HistoryAction | null>>

  /**
   * 全履歴をクリア
   */
  readonly clear: () => Promise<StorageResult<void>>

  /**
   * リソースを解放（接続を閉じる等）
   */
  readonly dispose: () => Promise<void>
}

/**
 * ストレージインスタンスを作成するファクトリ関数型
 */
export type HistoryStorageFactory = (config?: HistoryStorageConfig) => HistoryStorage

/**
 * 成功結果を作成するヘルパー
 * @param data - 成功時のデータ
 * @returns 成功フラグとデータを含む結果オブジェクト
 */
export const success = <T>(data: T): StorageResult<T> => ({
  success: true,
  data,
})

/**
 * 失敗結果を作成するヘルパー
 * @param error - エラーメッセージ
 * @returns 失敗フラグとエラーを含む結果オブジェクト
 */
export const failure = (error: string): StorageResult<never> => ({
  success: false,
  error,
})
