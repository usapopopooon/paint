import { Application, Container, Graphics } from 'pixi.js'
import type { Drawable } from '@/features/drawable'
import { renderDrawable } from '@/features/drawable'

/**
 * 描画要素をPixiJS Applicationにレンダリング
 * @param app - PixiJS Application
 * @param drawables - レンダリングするDrawable配列
 * @param backgroundColor - 背景色
 */
export const renderDrawables = (
  app: Application,
  drawables: readonly Drawable[],
  backgroundColor: string
): void => {
  // ステージをクリア
  app.stage.removeChildren()

  // 背景色を設定
  app.renderer.background.color = backgroundColor

  // 描画コンテナを作成
  const container = new Container()
  app.stage.addChild(container)

  // 各描画要素をレンダリング
  drawables.forEach((drawable) => {
    const graphics = new Graphics()

    // 消しゴムの場合はブレンドモードを設定
    if (drawable.type === 'stroke' && drawable.style.blendMode === 'erase') {
      graphics.blendMode = 'erase'
    }

    renderDrawable(graphics, drawable)
    container.addChild(graphics)
  })
}
