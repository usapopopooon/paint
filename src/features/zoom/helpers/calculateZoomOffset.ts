import type { CanvasOffset } from '@/features/canvas'

/**
 * マウス位置を基準にズームした際のオフセットを計算
 * Photoshopなどのように、カーソルが指しているキャンバス上の点が
 * ズーム後も同じ画面位置に留まるように計算する
 *
 * @param mouseX - ビューポート内のマウスX座標
 * @param mouseY - ビューポート内のマウスY座標
 * @param viewportWidth - ビューポートの幅
 * @param viewportHeight - ビューポートの高さ
 * @param oldZoom - ズーム前の倍率
 * @param newZoom - ズーム後の倍率
 * @param currentOffset - 現在のオフセット
 * @returns 新しいオフセット
 */
export const calculateZoomOffset = (
  mouseX: number,
  mouseY: number,
  viewportWidth: number,
  viewportHeight: number,
  oldZoom: number,
  newZoom: number,
  currentOffset: CanvasOffset
): CanvasOffset => {
  // ビューポート中心からの相対座標
  const centerX = viewportWidth / 2
  const centerY = viewportHeight / 2

  // マウス位置のビューポート中心からのオフセット
  const mouseOffsetFromCenterX = mouseX - centerX
  const mouseOffsetFromCenterY = mouseY - centerY

  // 現在のズームでのキャンバス上のマウス位置（オフセット込み）
  // transformOrigin: center なので、中心からの相対座標をzoomで割る
  const canvasPointX = mouseOffsetFromCenterX / oldZoom - currentOffset.x
  const canvasPointY = mouseOffsetFromCenterY / oldZoom - currentOffset.y

  // 新しいズームで同じキャンバス上の点が同じ画面位置になるオフセット
  const newOffsetX = mouseOffsetFromCenterX / newZoom - canvasPointX
  const newOffsetY = mouseOffsetFromCenterY / newZoom - canvasPointY

  return {
    x: newOffsetX,
    y: newOffsetY,
  }
}
