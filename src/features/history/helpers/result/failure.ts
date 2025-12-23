import type { StorageResult } from '../../types'

/**
 * 失敗結果を作成するヘルパー
 * @param error - エラーメッセージ
 * @returns 失敗フラグとエラーを含む結果オブジェクト
 */
export const failure = (error: string): StorageResult<never> => ({
  success: false,
  error,
})
