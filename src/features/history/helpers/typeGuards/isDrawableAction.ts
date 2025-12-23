import type { HistoryAction, DrawableAction } from '../../types'

/**
 * DrawableActionの型ガード
 * @param action - 判定する履歴アクション
 * @returns DrawableActionの場合はtrue
 */
export const isDrawableAction = (action: HistoryAction): action is DrawableAction =>
  action.type.startsWith('drawable')
