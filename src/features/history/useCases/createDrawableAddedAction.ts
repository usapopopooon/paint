import type { Drawable } from '@/features/drawable'
import { generateId } from '@/lib/id'
import type { DrawableAddedAction, LayerId } from '../types/actions'

/**
 * Drawable追加アクションを作成
 * @param drawable - 追加されたDrawable
 * @param layerId - 対象レイヤーID（省略時はグローバル）
 * @returns DrawableAddedActionオブジェクト
 */
export const createDrawableAddedAction = (
  drawable: Drawable,
  layerId?: LayerId
): DrawableAddedAction => ({
  id: generateId('action'),
  timestamp: Date.now(),
  type: 'drawable:added',
  drawable,
  layerId,
})
