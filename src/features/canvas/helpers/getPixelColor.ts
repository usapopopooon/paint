/**
 * キャンバス上の指定位置からピクセルカラーを取得
 * WebGLキャンバス（PixiJS）とCanvas2Dの両方に対応
 * @param canvas - HTMLCanvasElement
 * @param x - X座標
 * @param y - Y座標
 * @returns HEX形式の色文字列 (例: #ff0000)、取得できない場合はnull
 */
export const getPixelColor = (canvas: HTMLCanvasElement, x: number, y: number): string | null => {
  const floorX = Math.floor(x)
  const floorY = Math.floor(y)

  // WebGLコンテキストを試す
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
  if (gl) {
    const pixel = new Uint8Array(4)
    // WebGLはY軸が反転しているので調整
    gl.readPixels(floorX, canvas.height - floorY - 1, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel)
    const r = pixel[0].toString(16).padStart(2, '0')
    const g = pixel[1].toString(16).padStart(2, '0')
    const b = pixel[2].toString(16).padStart(2, '0')
    return `#${r}${g}${b}`
  }

  // 2Dコンテキストにフォールバック
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null

  const pixel = ctx.getImageData(floorX, floorY, 1, 1).data
  const r = pixel[0].toString(16).padStart(2, '0')
  const g = pixel[1].toString(16).padStart(2, '0')
  const b = pixel[2].toString(16).padStart(2, '0')
  return `#${r}${g}${b}`
}
