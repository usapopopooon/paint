import { useEffect, useRef, useState, useMemo } from 'react'
import { Application } from 'pixi.js'
import type { Drawable } from '@/features/drawable'
import type { Layer } from '@/features/layer'
import { renderDrawables, renderLayers } from '../adapters'

/**
 * 透明パターン（チェッカーボード）のCSSスタイル
 * サイズ40pxはデフォルトズーム50%で20pxに見えるように設定
 */
const TRANSPARENCY_PATTERN_STYLE = {
  background:
    'conic-gradient(#ccc 90deg, #fff 90deg 180deg, #ccc 180deg 270deg, #fff 270deg) 0 0 / 40px 40px',
} as const

/**
 * DrawingCanvasコンポーネントのプロパティ
 */
type DrawingCanvasProps = {
  readonly drawables?: readonly Drawable[]
  readonly layers?: readonly Layer[]
  readonly width?: number
  readonly height?: number
  readonly fillContainer?: boolean
  readonly className?: string
}

/**
 * 描画要素をレンダリングするキャンバスコンポーネント
 * @param props - DrawingCanvasコンポーネントのプロパティ
 */
export const DrawingCanvas = ({
  drawables,
  layers,
  width = 800,
  height = 600,
  fillContainer = false,
  className,
}: DrawingCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const appRef = useRef<Application | null>(null)
  const [containerSize, setContainerSize] = useState<{ width: number; height: number } | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  /**
   * キャンバスサイズを計算
   * fillContainerの場合はコンテナサイズを使用、そうでなければpropsのサイズを使用
   */
  const size = useMemo(() => {
    if (fillContainer && containerSize) {
      return containerSize
    }
    return { width, height }
  }, [fillContainer, containerSize, width, height])

  // PixiJS Applicationの初期化（一度だけ実行）
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let isCancelled = false
    const app = new Application()
    appRef.current = app

    app
      .init({
        width: size.width,
        height: size.height,
        backgroundAlpha: 0,
        antialias: true,
        preserveDrawingBuffer: true, // スポイトツールでピクセルを読み取るために必要
        resolution: window.devicePixelRatio || 1, // 高DPIディスプレイ対応
        autoDensity: true, // CSSサイズを維持しつつ内部解像度を上げる
      })
      .then(() => {
        // クリーンアップが先に呼ばれた場合は何もしない
        if (isCancelled) {
          app.destroy(true, { children: true })
          return
        }
        container.appendChild(app.canvas)
        setIsInitialized(true)
      })

    return () => {
      isCancelled = true
      // 初期化完了後のみdestroyを呼ぶ
      if (app.renderer) {
        app.destroy(true, { children: true })
      }
      appRef.current = null
      setIsInitialized(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // 初期化は一度だけ

  // classNameの適用
  useEffect(() => {
    const app = appRef.current
    if (!app || !isInitialized) return

    if (className) {
      app.canvas.className = className
    }
  }, [className, isInitialized])

  // コンテナサイズの監視（fillContainerモード）
  useEffect(() => {
    if (!fillContainer) {
      return
    }

    const container = containerRef.current
    if (!container) return

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        })
      }
    })

    resizeObserver.observe(container)
    return () => resizeObserver.disconnect()
  }, [fillContainer])

  // サイズ変更時のリサイズ
  useEffect(() => {
    const app = appRef.current
    if (!app || !isInitialized || !app.renderer) return

    app.renderer.resize(size.width, size.height)
  }, [size.width, size.height, isInitialized])

  // 描画要素のレンダリング
  useEffect(() => {
    const app = appRef.current
    if (!app || !isInitialized || !app.renderer) return

    // layersがあればlayersを使用、なければdrawablesにフォールバック
    if (layers) {
      void renderLayers(app, layers)
    } else if (drawables) {
      void renderDrawables(app, drawables)
    } else {
      // コンテンツなし
      app.stage.removeChildren()
    }
  }, [drawables, layers, isInitialized])

  return (
    <div
      ref={containerRef}
      className={fillContainer ? 'w-full h-full' : undefined}
      style={TRANSPARENCY_PATTERN_STYLE}
    />
  )
}
