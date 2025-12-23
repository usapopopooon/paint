import type { Layer } from '../../types'

/**
 * 背景レイヤーを作成
 * @returns 固定ID='background'、locked=trueの背景レイヤー
 */
export const createBackgroundLayer = (): Layer => ({
  id: 'background',
  name: 'Background',
  type: 'background',
  visible: true,
  locked: true,
  opacity: 1,
  blendMode: 'normal',
  drawables: [],
})
