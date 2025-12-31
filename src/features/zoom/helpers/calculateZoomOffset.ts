import type { CanvasOffset } from '@/features/canvas'

/**
 * マウス位置を中心にズームした際のオフセットを計算
 * @param mouseX - ビューポート内のマウスX座標
 * @param mouseY - ビューポート内のマウスY座標
 * @param oldZoom - ズーム前の倍率
 * @param newZoom - ズーム後の倍率
 * @param currentOffset - 現在のオフセット
 * @returns 新しいオフセット
 */
export const calculateZoomOffset = (
  mouseX: number,
  mouseY: number,
  oldZoom: number,
  newZoom: number,
  currentOffset: CanvasOffset
): CanvasOffset => {
  const zoomRatio = newZoom / oldZoom
  return {
    x: mouseX - (mouseX - currentOffset.x) * zoomRatio,
    y: mouseY - (mouseY - currentOffset.y) * zoomRatio,
  }
}
