import { Graphics } from 'pixi.js'
import type { Drawable } from '../../types'
import { renderStroke } from './renderStroke'

/**
 * 描画要素をPixiJS Graphicsにレンダリング（タイプ別にディスパッチ）
 * @param graphics - 描画先のPixiJS Graphics
 * @param drawable - レンダリングする描画要素
 */
export const renderDrawable = (graphics: Graphics, drawable: Drawable): void => {
  switch (drawable.type) {
    case 'stroke':
      renderStroke(graphics, drawable)
      break
    // 将来の描画タイプはここで処理:
    // case 'fill': renderFill(graphics, drawable); break
    // case 'bezier': renderBezier(graphics, drawable); break
    // case 'shape': renderShape(graphics, drawable); break
    // case 'image': renderImage(graphics, drawable); break
  }
}
