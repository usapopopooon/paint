import { DISPLAY_MULTIPLIER } from '@/constants/display'

export type ImageDimensions = {
  width: number
  height: number
  x: number
  y: number
}

/**
 * 画像サイズを計算（キャンバスに収まるように縮小、中央配置）
 * @param imageWidth - 元画像の幅（ピクセル = 内部座標系）
 * @param imageHeight - 元画像の高さ（ピクセル = 内部座標系）
 * @param canvasWidth - キャンバスの幅（UI座標系）
 * @param canvasHeight - キャンバスの高さ（UI座標系）
 * @returns 内部座標系でのサイズと位置
 */
export const calculateImageSize = (
  imageWidth: number,
  imageHeight: number,
  canvasWidth: number,
  canvasHeight: number
): ImageDimensions => {
  // キャンバスを内部座標系に変換（画像は既にピクセル = 内部座標系）
  const internalCanvasWidth = canvasWidth * DISPLAY_MULTIPLIER
  const internalCanvasHeight = canvasHeight * DISPLAY_MULTIPLIER

  // キャンバスより大きい場合のみ縮小
  const scaleX = internalCanvasWidth / imageWidth
  const scaleY = internalCanvasHeight / imageHeight
  const scale = Math.min(1, scaleX, scaleY) // 1を超えない（拡大しない）

  const finalWidth = imageWidth * scale
  const finalHeight = imageHeight * scale

  // 中央配置
  const x = (internalCanvasWidth - finalWidth) / 2
  const y = (internalCanvasHeight - finalHeight) / 2

  return {
    width: finalWidth,
    height: finalHeight,
    x,
    y,
  }
}
