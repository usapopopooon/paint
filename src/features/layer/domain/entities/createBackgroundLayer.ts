import type { Layer } from '../../types'
import { BACKGROUND_LAYER_ID } from '../../constants'

/**
 * 背景レイヤーを作成
 * 通常は非表示、エクスポート時のみ表示される
 * @returns 固定ID='background'、isLocked=true、isVisible=falseの背景レイヤー
 */
export const createBackgroundLayer = (): Layer => ({
  id: BACKGROUND_LAYER_ID,
  name: 'Background',
  type: 'background',
  isVisible: false, // 通常は非表示、エクスポート時のみ表示
  isLocked: true,
  opacity: 1,
  blendMode: 'normal',
  drawables: [],
})
