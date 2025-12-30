import { useEffect, useRef, useState, useMemo } from 'react'
import { Application } from 'pixi.js'
import type { Drawable } from '@/features/drawable'
import type { Layer } from '@/features/layer'
import { renderDrawables, renderLayers } from '../adapters'

/**
 * DrawingCanvasコンポーネントのプロパティ
 */
type DrawingCanvasProps = {
  readonly drawables?: readonly Drawable[]
  readonly layers?: readonly Layer[]
  readonly width?: number
  readonly height?: number
  readonly backgroundColor?: string
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
  backgroundColor = '#ffffff',
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

  // PixiJS Applicationの初期化
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let isCancelled = false
    const app = new Application()
    appRef.current = app

    app
      .init({
        width,
        height,
        backgroundColor,
        antialias: true,
      })
      .then(() => {
        // クリーンアップが先に呼ばれた場合は何もしない
        if (isCancelled) {
          app.destroy(true, { children: true })
          return
        }
        if (className) {
          app.canvas.className = className
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
  }, [width, height, backgroundColor, className])

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
    if (!app || !isInitialized) return

    app.renderer.resize(size.width, size.height)
  }, [size.width, size.height, isInitialized])

  // 描画要素のレンダリング
  useEffect(() => {
    const app = appRef.current
    if (!app || !isInitialized) return

    // layersがあればlayersを使用、なければdrawablesにフォールバック
    if (layers) {
      renderLayers(app, layers, backgroundColor)
    } else if (drawables) {
      renderDrawables(app, drawables, backgroundColor)
    } else {
      // コンテンツなし、背景色のみ
      app.stage.removeChildren()
      app.renderer.background.color = backgroundColor
    }
  }, [drawables, layers, backgroundColor, isInitialized])

  return <div ref={containerRef} className={fillContainer ? 'w-full h-full' : undefined} />
}
