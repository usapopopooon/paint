import type { Drawable } from '../../types'
import { renderStroke } from './renderStroke'

type RenderingContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D

/**
 * 描画要素をキャンバスコンテキストにレンダリング（タイプ別にディスパッチ）
 * @param ctx - 描画先のキャンバスコンテキスト
 * @param drawable - レンダリングする描画要素
 */
export const renderDrawable = (ctx: RenderingContext, drawable: Drawable): void => {
  switch (drawable.type) {
    case 'stroke':
      renderStroke(ctx, drawable)
      break
    // 将来の描画タイプはここで処理:
    // case 'fill': renderFill(ctx, drawable); break
    // case 'bezier': renderBezier(ctx, drawable); break
    // case 'shape': renderShape(ctx, drawable); break
    // case 'image': renderImage(ctx, drawable); break
  }
}
