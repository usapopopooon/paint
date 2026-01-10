import { useCallback, type RefObject } from 'react'
import type { ExportOptions, ImageFormat } from '../types'
import { SCALE_VALUES } from '../types'

/**
 * 次のアニメーションフレームまで待機
 */
const waitForNextFrame = (): Promise<void> =>
  new Promise((resolve) => requestAnimationFrame(() => resolve()))

/**
 * Blobをファイルとして保存
 * File System Access APIが利用可能な場合は保存ダイアログを表示
 * そうでない場合はダウンロードにフォールバック
 * @returns 保存が成功したかどうか（キャンセルの場合はfalse）
 */
const saveBlob = async (blob: Blob, fileName: string, format: ImageFormat): Promise<boolean> => {
  const extension = format === 'jpg' ? 'jpg' : 'png'
  const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png'

  // File System Access APIが利用可能な場合
  if ('showSaveFilePicker' in window && typeof window.showSaveFilePicker === 'function') {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: `${fileName}.${extension}`,
        types: [
          {
            description: format === 'jpg' ? 'JPEG Image' : 'PNG Image',
            accept: { [mimeType]: [`.${extension}`] },
          },
        ],
      })

      const writable = await handle.createWritable()
      await writable.write(blob)
      await writable.close()
      return true
    } catch (error) {
      // ユーザーがキャンセルした場合
      if (error instanceof Error && error.name === 'AbortError') {
        return false
      }
      throw error
    }
  }

  // フォールバック: 従来のダウンロード方式
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.download = `${fileName}.${extension}`
  link.href = url
  link.click()
  URL.revokeObjectURL(url)
  return true
}

/**
 * 画像エクスポート用のhook
 * @param containerRef - キャンバスを含むコンテナ要素のref
 */
export const useExportImage = (containerRef: RefObject<HTMLElement | null>) => {
  /**
   * キャンバスを指定オプションで保存
   * File System Access APIが利用可能な場合は保存ダイアログを表示
   * @param options - エクスポートオプション
   * @param showBackgroundLayer - 背景レイヤーを表示する関数
   * @param hideBackgroundLayer - 背景レイヤーを非表示にする関数
   */
  const saveImage = useCallback(
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

      // 指定フォーマットに変換してBlobを作成
      const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png'
      // JPGの場合は品質を0-1の範囲に変換（入力は1-100）
      const quality = format === 'jpg' ? jpegQuality / 100 : undefined

      // canvasをBlobに変換
      const blob = await new Promise<Blob | null>((resolve) => {
        outputCanvas.toBlob(resolve, mimeType, quality)
      })

      if (!blob) return

      // 保存ダイアログを表示して保存
      await saveBlob(blob, fileName, format)
    },
    [containerRef]
  )

  /**
   * キャンバスをJPGとして保存（後方互換性のため残す）
   * @deprecated saveImageを使用してください
   */
  const saveAsJpg = useCallback(
    async (showBackgroundLayer: () => void, hideBackgroundLayer: () => void) => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
      const fileName = `paint_${timestamp}`
      await saveImage(
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
    [saveImage]
  )

  return {
    saveImage,
    saveAsJpg,
    /** @deprecated saveImageを使用してください */
    downloadImage: saveImage,
    /** @deprecated saveAsJpgを使用してください */
    downloadAsJpg: saveAsJpg,
  } as const
}
