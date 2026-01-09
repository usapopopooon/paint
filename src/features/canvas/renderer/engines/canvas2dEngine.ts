import type { Drawable } from '@/features/drawable'
import type { Layer } from '@/features/layer'
import type { RenderEngine, RendererOptions } from '../types'
import { renderDrawables2D, renderLayers2D, clearImageCache2D } from './canvas2d'

/**
 * Canvas 2D を使用したレンダーエンジン実装
 * PixiJS の代替として使用可能
 */
export class Canvas2DEngine implements RenderEngine {
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private width: number = 0
  private height: number = 0

  get isInitialized(): boolean {
    return this.canvas !== null && this.ctx !== null
  }

  async init(options: RendererOptions): Promise<void> {
    if (this.canvas) {
      this.dispose()
    }

    this.canvas = document.createElement('canvas')
    this.canvas.width = options.width
    this.canvas.height = options.height
    this.width = options.width
    this.height = options.height

    this.ctx = this.canvas.getContext('2d', {
      alpha: true,
      willReadFrequently: options.preserveDrawingBuffer ?? true,
    })

    if (!this.ctx) {
      throw new Error('Failed to get 2D context')
    }

    // アンチエイリアスの設定
    if (options.antialias !== false) {
      this.ctx.imageSmoothingEnabled = true
      this.ctx.imageSmoothingQuality = 'high'
    } else {
      this.ctx.imageSmoothingEnabled = false
    }
  }

  dispose(): void {
    this.canvas = null
    this.ctx = null
    this.width = 0
    this.height = 0
  }

  resize(width: number, height: number): void {
    if (!this.canvas || !this.ctx) return

    this.canvas.width = width
    this.canvas.height = height
    this.width = width
    this.height = height

    // リサイズ後にコンテキストの設定を再適用
    this.ctx.imageSmoothingEnabled = true
    this.ctx.imageSmoothingQuality = 'high'
  }

  getCanvas(): HTMLCanvasElement {
    if (!this.canvas) {
      throw new Error('Renderer is not initialized')
    }
    return this.canvas
  }

  async renderDrawables(drawables: readonly Drawable[]): Promise<void> {
    if (!this.ctx) {
      throw new Error('Renderer is not initialized')
    }
    await renderDrawables2D(this.ctx, drawables, this.width, this.height)
  }

  async renderLayers(layers: readonly Layer[]): Promise<void> {
    if (!this.ctx) {
      throw new Error('Renderer is not initialized')
    }
    await renderLayers2D(this.ctx, layers, this.width, this.height)
  }

  clear(): void {
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }
  }

  clearImageCache(): void {
    clearImageCache2D()
  }
}
