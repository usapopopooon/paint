import { useCallback, type RefObject } from 'react'
import { JPEG_QUALITY, EXPORT_SCALE } from '../constants'

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
   * キャンバスをJPGとしてダウンロード
   * 背景レイヤーを一時的に表示してエクスポートする
   * @param showBackgroundLayer - 背景レイヤーを表示する関数
   * @param hideBackgroundLayer - 背景レイヤーを非表示にする関数
   */
  const downloadAsJpg = useCallback(
    async (showBackgroundLayer: () => void, hideBackgroundLayer: () => void) => {
      const container = containerRef.current
      if (!container) return

      // 背景レイヤーを表示
      showBackgroundLayer()

      // PixiJSがレンダリングするのを待つ（2フレーム待機で確実にレンダリング完了）
      await waitForNextFrame()
      await waitForNextFrame()

      // コンテナ内のキャンバス要素を取得
      const canvas = container.querySelector('canvas') as HTMLCanvasElement | null
      if (!canvas) {
        hideBackgroundLayer()
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
        hideBackgroundLayer()
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
        // 背景レイヤーが表示されているため、アルファブレンディング不要
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const srcIdx = ((height - 1 - y) * width + x) * 4
            const dstIdx = (y * width + x) * 4

            data[dstIdx] = pixels[srcIdx]
            data[dstIdx + 1] = pixels[srcIdx + 1]
            data[dstIdx + 2] = pixels[srcIdx + 2]
            data[dstIdx + 3] = 255 // JPGは完全不透明
          }
        }

        fullSizeCtx.putImageData(imageData, 0, 0)
      } else {
        // WebGLコンテキストが取得できない場合は直接描画
        fullSizeCtx.drawImage(canvas, 0, 0)
      }

      // 背景レイヤーを非表示に戻す
      hideBackgroundLayer()

      // 50%に縮小したキャンバスを作成
      const exportWidth = Math.round(width * EXPORT_SCALE)
      const exportHeight = Math.round(height * EXPORT_SCALE)
      const exportCanvas = document.createElement('canvas')
      exportCanvas.width = exportWidth
      exportCanvas.height = exportHeight
      const exportCtx = exportCanvas.getContext('2d')
      if (!exportCtx) return

      // 高品質なスケーリングのために設定
      exportCtx.imageSmoothingEnabled = true
      exportCtx.imageSmoothingQuality = 'high'
      exportCtx.drawImage(fullSizeCanvas, 0, 0, exportWidth, exportHeight)

      // JPGに変換してダウンロード
      const dataUrl = exportCanvas.toDataURL('image/jpeg', JPEG_QUALITY)
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
      const filename = `paint_${timestamp}.jpg`

      const link = document.createElement('a')
      link.download = filename
      link.href = dataUrl
      link.click()
    },
    [containerRef]
  )

  return {
    downloadAsJpg,
  } as const
}
