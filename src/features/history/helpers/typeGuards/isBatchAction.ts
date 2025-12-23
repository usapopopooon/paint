import type { HistoryAction, BatchAction } from '../../types'

/**
 * BatchActionの型ガード
 * @param action - 判定する履歴アクション
 * @returns BatchActionの場合はtrue
 */
export const isBatchAction = (action: HistoryAction): action is BatchAction =>
  action.type === 'batch'
