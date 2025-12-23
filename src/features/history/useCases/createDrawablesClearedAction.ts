import type { Drawable } from '@/features/drawable'
import { generateId } from '@/lib/id'
import type { DrawablesClearedAction, LayerId } from '../types/actions'

/**
 * Drawablesクリアアクションを作成
 * @param previousDrawables - クリア前のDrawable配列
 * @param layerId - 対象レイヤーID（省略時はグローバル）
 * @returns DrawablesClearedActionオブジェクト
 */
export const createDrawablesClearedAction = (
  previousDrawables: readonly Drawable[],
  layerId?: LayerId
): DrawablesClearedAction => ({
  id: generateId('action'),
  timestamp: Date.now(),
  type: 'drawables:cleared',
  previousDrawables,
  layerId,
})
