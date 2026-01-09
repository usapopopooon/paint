import { Application } from 'pixi.js'
import type { Drawable } from '@/features/drawable'
import type { Layer } from '@/features/layer'
import { clearImageCache } from '@/features/drawable'
import { renderDrawables } from '../../adapters/canvas/renderDrawables'
import { renderLayers } from '../../adapters/canvas/renderLayers'
import type { RenderEngine, RendererOptions } from '../types'

/**
 * PixiJS を使用したレンダーエンジン実装
 * 内部モジュールとして使用され、外部には公開しない
 */
export class PixiEngine implements RenderEngine {
  private app: Application | null = null

  get isInitialized(): boolean {
    return this.app !== null
  }

  async init(options: RendererOptions): Promise<void> {
    if (this.app) {
      this.dispose()
    }

    this.app = new Application()
    await this.app.init({
      width: options.width,
      height: options.height,
      antialias: options.antialias ?? false,
      backgroundAlpha: 0,
      preserveDrawingBuffer: options.preserveDrawingBuffer ?? true, // スポイトツールでピクセルを読み取るために必要
      // resolution: 1 に固定（PixiJSのバグ: advanced blend modesがresolution != 1で正しく動作しない）
      // https://github.com/pixijs/pixijs/issues/11311
      resolution: 1,
      useBackBuffer: true, // overlay, darken, lighten等の高度なブレンドモードに必要
    })
  }

  dispose(): void {
    if (this.app) {
      // rendererが初期化されていない場合（init()が完了前の場合）はdestroyをスキップ
      if (this.app.renderer) {
        this.app.destroy(true, { children: true })
      }
      this.app = null
    }
  }

  resize(width: number, height: number): void {
    if (this.app) {
      this.app.renderer.resize(width, height)
    }
  }

  getCanvas(): HTMLCanvasElement {
    if (!this.app) {
      throw new Error('Renderer is not initialized')
    }
    return this.app.canvas as HTMLCanvasElement
  }

  async renderDrawables(drawables: readonly Drawable[]): Promise<void> {
    if (!this.app) {
      throw new Error('Renderer is not initialized')
    }
    await renderDrawables(this.app, drawables)
  }

  async renderLayers(layers: readonly Layer[]): Promise<void> {
    if (!this.app) {
      throw new Error('Renderer is not initialized')
    }
    await renderLayers(this.app, layers)
  }

  clear(): void {
    if (this.app) {
      this.app.stage.removeChildren()
    }
  }

  clearImageCache(): void {
    clearImageCache()
  }
}
