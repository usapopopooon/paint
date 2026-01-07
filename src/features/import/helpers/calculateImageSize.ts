export type ImageDimensions = {
  width: number
  height: number
  x: number
  y: number
}

/**
 * 画像サイズを計算（キャンバスに収まるように縮小、中央配置）
 * @param imageWidth - 元画像の幅（ピクセル）
 * @param imageHeight - 元画像の高さ（ピクセル）
 * @param canvasWidth - キャンバスの幅（ピクセル）
 * @param canvasHeight - キャンバスの高さ（ピクセル）
 * @returns サイズと位置
 */
export const calculateImageSize = (
  imageWidth: number,
  imageHeight: number,
  canvasWidth: number,
  canvasHeight: number
): ImageDimensions => {
  // キャンバスより大きい場合のみ縮小
  const scaleX = canvasWidth / imageWidth
  const scaleY = canvasHeight / imageHeight
  const scale = Math.min(1, scaleX, scaleY) // 1を超えない（拡大しない）

  const finalWidth = imageWidth * scale
  const finalHeight = imageHeight * scale

  // 中央配置
  const x = (canvasWidth - finalWidth) / 2
  const y = (canvasHeight - finalHeight) / 2

  return {
    width: finalWidth,
    height: finalHeight,
    x,
    y,
  }
}
