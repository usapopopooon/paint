import { useCallback, type RefObject } from 'react'
import type { ExportOptions } from '../types'
import { SCALE_VALUES } from '../types'

/**
 * 次のアニメーションフレームまで待機
 */
const waitForNextFrame = (): Promise<void> =>
  new Promise((resolve) => requestAnimationFrame(() => resolve()))

/**
 * 画像エクスポート用のhook
 * @param containerRef - キャンバスを含むコンテナ要素のref
 */
export const useExportImage = (containerRef: RefObject<HTMLElement | null>) => {
  /**
   * キャンバスを指定オプションでダウンロード
   * @param options - エクスポートオプション
   * @param showBackgroundLayer - 背景レイヤーを表示する関数
   * @param hideBackgroundLayer - 背景レイヤーを非表示にする関数
   */
  const downloadImage = useCallback(
    async (
      options: ExportOptions,
      showBackgroundLayer: () => void,
      hideBackgroundLayer: () => void
    ) => {
      const container = containerRef.current
      if (!container) return

      const { fileName, format, scale, includeBackground, jpegQuality } = options

      // JPGの場合は常に背景表示、PNGの場合はincludeBackgroundに従う
      const shouldShowBackground = format === 'jpg' || includeBackground
      if (shouldShowBackground) {
        showBackgroundLayer()
      }

      // PixiJSがレンダリングするのを待つ（2フレーム待機で確実にレンダリング完了）
      await waitForNextFrame()
      await waitForNextFrame()

      // コンテナ内のキャンバス要素を取得
      const canvas = container.querySelector('canvas') as HTMLCanvasElement | null
      if (!canvas) {
        if (shouldShowBackground) {
          hideBackgroundLayer()
        }
        return
      }

      const width = canvas.width
      const height = canvas.height

      // フルサイズのオフスクリーンキャンバスを作成
      const fullSizeCanvas = document.createElement('canvas')
      fullSizeCanvas.width = width
      fullSizeCanvas.height = height
      const fullSizeCtx = fullSizeCanvas.getContext('2d')
      if (!fullSizeCtx) {
        if (shouldShowBackground) {
          hideBackgroundLayer()
        }
        return
      }

      // WebGLキャンバスからピクセルデータを直接取得
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
      if (gl) {
        // WebGLからピクセルデータを読み取り
        const pixels = new Uint8Array(width * height * 4)
        gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)

        // ImageDataを作成
        const imageData = fullSizeCtx.createImageData(width, height)
        const data = imageData.data

        // WebGLは左下が原点なので上下反転しながらコピー
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const srcIdx = ((height - 1 - y) * width + x) * 4
            const dstIdx = (y * width + x) * 4

            data[dstIdx] = pixels[srcIdx]
            data[dstIdx + 1] = pixels[srcIdx + 1]
            data[dstIdx + 2] = pixels[srcIdx + 2]
            // JPGは完全不透明、PNGは元のアルファ値を保持（透過PNG対応）
            data[dstIdx + 3] = format === 'jpg' ? 255 : pixels[srcIdx + 3]
          }
        }

        fullSizeCtx.putImageData(imageData, 0, 0)
      } else {
        // WebGLコンテキストが取得できない場合は直接描画
        fullSizeCtx.drawImage(canvas, 0, 0)
      }

      // 背景レイヤーを非表示に戻す
      if (shouldShowBackground) {
        hideBackgroundLayer()
      }

      // スケール適用
      const scaleValue = SCALE_VALUES[scale]
      const outputWidth = Math.round(width * scaleValue)
      const outputHeight = Math.round(height * scaleValue)

      // 出力用キャンバスを作成（スケール適用）
      const outputCanvas = document.createElement('canvas')
      outputCanvas.width = outputWidth
      outputCanvas.height = outputHeight
      const outputCtx = outputCanvas.getContext('2d')
      if (!outputCtx) return

      // 高品質なリサイズのための設定
      outputCtx.imageSmoothingEnabled = true
      outputCtx.imageSmoothingQuality = 'high'
      outputCtx.drawImage(fullSizeCanvas, 0, 0, outputWidth, outputHeight)

      // 指定フォーマットに変換してダウンロード
      const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png'
      // JPGの場合は品質を0-1の範囲に変換（入力は1-100）
      const quality = format === 'jpg' ? jpegQuality / 100 : undefined
      const dataUrl = outputCanvas.toDataURL(mimeType, quality)
      const filename = `${fileName}.${format}`

      const link = document.createElement('a')
      link.download = filename
      link.href = dataUrl
      link.click()
    },
    [containerRef]
  )

  /**
   * キャンバスをJPGとしてダウンロード（後方互換性のため残す）
   * @deprecated downloadImageを使用してください
   */
  const downloadAsJpg = useCallback(
    async (showBackgroundLayer: () => void, hideBackgroundLayer: () => void) => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
      const fileName = `paint_${timestamp}`
      await downloadImage(
        {
          fileName,
          format: 'jpg',
          scale: '100',
          includeBackground: true,
          jpegQuality: 92,
        },
        showBackgroundLayer,
        hideBackgroundLayer
      )
    },
    [downloadImage]
  )

  return {
    downloadImage,
    downloadAsJpg,
  } as const
}
