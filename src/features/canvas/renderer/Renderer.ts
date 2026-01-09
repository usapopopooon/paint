import type { Drawable } from '@/features/drawable'
import type { Layer } from '@/features/layer'
import type { IRenderer, RenderEngine, RendererEngine, RendererOptions } from './types'
import { PixiEngine } from './engines/pixiEngine'

/**
 * エンジン種類に応じたエンジンインスタンスを作成
 */
const createEngine = (engineType: RendererEngine): RenderEngine => {
  switch (engineType) {
    case 'pixi':
      return new PixiEngine()
    case 'canvas':
      // Canvas 2D エンジンは今後実装予定
      throw new Error('Canvas 2D engine is not yet implemented')
    default:
      throw new Error(`Unknown engine type: ${engineType}`)
  }
}

/**
 * レンダラークラス
 * 描画エンジン（PixiJS, Canvas 2D）を抽象化し、統一したインターフェースを提供
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
  private engine: RenderEngine
  readonly engineType: RendererEngine

  constructor(engineType: RendererEngine = 'pixi') {
    this.engineType = engineType
    this.engine = createEngine(engineType)
  }

  get isInitialized(): boolean {
    return this.engine.isInitialized
  }

  async init(options: RendererOptions): Promise<void> {
    await this.engine.init(options)
  }

  dispose(): void {
    this.engine.dispose()
  }

  resize(width: number, height: number): void {
    this.engine.resize(width, height)
  }

  getCanvas(): HTMLCanvasElement {
    return this.engine.getCanvas()
  }

  async renderDrawables(drawables: readonly Drawable[]): Promise<void> {
    await this.engine.renderDrawables(drawables)
  }

  async renderLayers(layers: readonly Layer[]): Promise<void> {
    await this.engine.renderLayers(layers)
  }

  clear(): void {
    this.engine.clear()
  }

  clearImageCache(): void {
    this.engine.clearImageCache()
  }
}
