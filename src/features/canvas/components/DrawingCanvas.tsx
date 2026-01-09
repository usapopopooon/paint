import { useEffect, useRef, useState, useMemo } from 'react'
import 'pixi.js/advanced-blend-modes' // overlay, darken, lighten等の高度なブレンドモードに必要
import type { Drawable } from '@/features/drawable'
import type { Layer } from '@/features/layer'
import { Renderer, type RendererEngine } from '../renderer'

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
  readonly engine?: RendererEngine
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
  engine = 'pixi',
}: DrawingCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<Renderer | null>(null)
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

  // Rendererの初期化（一度だけ実行）
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let isCancelled = false
    const renderer = new Renderer(engine)
    rendererRef.current = renderer

    renderer
      .init({
        width: size.width,
        height: size.height,
        antialias: true,
      })
      .then(() => {
        // クリーンアップが先に呼ばれた場合は何もしない
        if (isCancelled) {
          renderer.dispose()
          return
        }
        container.appendChild(renderer.getCanvas())
        setIsInitialized(true)
      })

    return () => {
      isCancelled = true
      // 初期化完了後のみdisposeを呼ぶ
      if (renderer.isInitialized) {
        renderer.dispose()
      }
      rendererRef.current = null
      setIsInitialized(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine]) // 初期化は一度だけ（engineが変わった場合は再初期化）

  // classNameの適用
  useEffect(() => {
    const renderer = rendererRef.current
    if (!renderer || !isInitialized) return

    if (className) {
      renderer.getCanvas().className = className
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
    const renderer = rendererRef.current
    if (!renderer || !isInitialized) return

    renderer.resize(size.width, size.height)
  }, [size.width, size.height, isInitialized])

  // 描画要素のレンダリング
  useEffect(() => {
    const renderer = rendererRef.current
    if (!renderer || !isInitialized) return

    // layersがあればlayersを使用、なければdrawablesにフォールバック
    if (layers) {
      void renderer.renderLayers(layers)
    } else if (drawables) {
      void renderer.renderDrawables(drawables)
    } else {
      // コンテンツなし
      renderer.clear()
    }
  }, [drawables, layers, isInitialized])

  return <div ref={containerRef} className={fillContainer ? 'w-full h-full' : undefined} />
}
