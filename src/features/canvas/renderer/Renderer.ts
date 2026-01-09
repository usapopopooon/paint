import type { Drawable } from '@/features/drawable'
import type { Layer } from '@/features/layer'
import type { IRenderer, RenderEngine, RendererEngine, RendererOptions } from './types'

/**
 * エンジン種類に応じたエンジンインスタンスを動的に作成
 * 遅延読み込みにより、使用するエンジンのみがバンドルに含まれる
 */
const createEngine = async (engineType: RendererEngine): Promise<RenderEngine> => {
  switch (engineType) {
    case 'pixi': {
      const { PixiEngine } = await import('./engines/pixiEngine')
      return new PixiEngine()
    }
    case 'canvas': {
      const { Canvas2DEngine } = await import('./engines/canvas2dEngine')
      return new Canvas2DEngine()
    }
    default:
      throw new Error(`Unknown engine type: ${engineType}`)
  }
}

/**
 * レンダラークラス
 * 描画エンジン（PixiJS, Canvas 2D）を抽象化し、統一したインターフェースを提供
 * エンジンは動的インポートで遅延読み込みされる
 *
 * @example
 * ```ts
 * const renderer = new Renderer('pixi')
 * await renderer.init({ width: 800, height: 600 })
 * document.body.appendChild(renderer.getCanvas())
 * await renderer.renderLayers(layers)
 * ```
 */
export class Renderer implements IRenderer {
  private engine: RenderEngine | null = null
  readonly engineType: RendererEngine

  constructor(engineType: RendererEngine = 'pixi') {
    this.engineType = engineType
  }

  get isInitialized(): boolean {
    return this.engine?.isInitialized ?? false
  }

  async init(options: RendererOptions): Promise<void> {
    // エンジンを動的に読み込む
    this.engine = await createEngine(this.engineType)
    await this.engine.init(options)
  }

  dispose(): void {
    this.engine?.dispose()
    this.engine = null
  }

  resize(width: number, height: number): void {
    this.engine?.resize(width, height)
  }

  getCanvas(): HTMLCanvasElement {
    if (!this.engine) {
      throw new Error('Renderer is not initialized')
    }
    return this.engine.getCanvas()
  }

  async renderDrawables(drawables: readonly Drawable[]): Promise<void> {
    if (!this.engine) {
      throw new Error('Renderer is not initialized')
    }
    await this.engine.renderDrawables(drawables)
  }

  async renderLayers(layers: readonly Layer[]): Promise<void> {
    if (!this.engine) {
      throw new Error('Renderer is not initialized')
    }
    await this.engine.renderLayers(layers)
  }

  clear(): void {
    this.engine?.clear()
  }

  clearImageCache(): void {
    this.engine?.clearImageCache()
  }
}
