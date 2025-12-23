import type { StorageResult } from '../../types'

/**
 * 成功結果を作成するヘルパー
 * @param data - 成功時のデータ
 * @returns 成功フラグとデータを含む結果オブジェクト
 */
export const success = <T>(data: T): StorageResult<T> => ({
  success: true,
  data,
})
