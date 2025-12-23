import type { HistoryAction, LayerAction } from '../../types'

/**
 * LayerActionの型ガード
 * @param action - 判定する履歴アクション
 * @returns LayerActionの場合はtrue
 */
export const isLayerAction = (action: HistoryAction): action is LayerAction =>
  action.type.startsWith('layer')
