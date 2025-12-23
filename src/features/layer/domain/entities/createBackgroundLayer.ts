import type { Layer } from '../../types'

/**
 * 背景レイヤーを作成
 * @returns 固定ID='background'、isLocked=trueの背景レイヤー
 */
export const createBackgroundLayer = (): Layer => ({
  id: 'background',
  name: 'Background',
  type: 'background',
  isVisible: true,
  isLocked: true,
  opacity: 1,
  blendMode: 'normal',
  drawables: [],
})
