import type { HistoryAction, CanvasAction } from '../../types'

/**
 * CanvasActionの型ガード
 * @param action - 判定する履歴アクション
 * @returns CanvasActionの場合はtrue
 */
export const isCanvasAction = (action: HistoryAction): action is CanvasAction =>
  action.type.startsWith('canvas')
