/**
 * 選択処理のコア関数（Worker実行可能）
 *
 * DOM/Canvas APIに依存しない純粋関数を提供。
 * Web Workerでの非同期処理が可能。
 */

/**
 * 2D座標
 */
export type PointData = {
  readonly x: number
  readonly y: number
}

/**
 * バウンディングボックス
 */
export type BoundsData = {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

/**
 * Lassoマスキング処理のパラメータ
 */
export type MaskParams = {
  /** ソース画像データ（RGBA配列） */
  readonly sourceData: Uint8ClampedArray
  /** 画像の幅 */
  readonly width: number
  /** 画像の高さ */
  readonly height: number
  /** バウンディングボックスのX座標 */
  readonly boundsX: number
  /** バウンディングボックスのY座標 */
  readonly boundsY: number
  /** オフセットX */
  readonly offsetX: number
  /** オフセットY */
  readonly offsetY: number
  /** ポリゴンの頂点配列（フラット化: [x0, y0, x1, y1, ...]） */
  readonly polygonPoints: Float64Array
}

/**
 * マスキング処理の結果
 */
export type MaskResult = {
  /** マスク適用後の画像データ */
  readonly data: Uint8ClampedArray
  /** 画像の幅 */
  readonly width: number
  /** 画像の高さ */
  readonly height: number
}

/**
 * 点がポリゴン内にあるかを判定（Ray casting algorithm）
 *
 * @param px - 判定する点のX座標
 * @param py - 判定する点のY座標
 * @param polygonPoints - ポリゴンの頂点配列（フラット化: [x0, y0, x1, y1, ...]）
 * @returns 内部にあればtrue
 */
export const isPointInPolygonCore = (
  px: number,
  py: number,
  polygonPoints: Float64Array
): boolean => {
  const len = polygonPoints.length
  if (len < 6) return false // 最低3点必要

  let inside = false
  const numPoints = len / 2

  for (let i = 0, j = numPoints - 1; i < numPoints; j = i++) {
    const xi = polygonPoints[i * 2]
    const yi = polygonPoints[i * 2 + 1]
    const xj = polygonPoints[j * 2]
    const yj = polygonPoints[j * 2 + 1]

    const intersect = yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi

    if (intersect) inside = !inside
  }

  return inside
}

/**
 * Lassoマスキング処理のコア関数（Worker実行可能）
 *
 * 選択領域外のピクセルを透明化する。
 *
 * @param params - マスキングパラメータ
 * @returns マスク適用後の画像データ
 */
export const applyLassoMaskCore = (params: MaskParams): MaskResult => {
  const { sourceData, width, height, boundsX, boundsY, offsetX, offsetY, polygonPoints } = params

  // 出力データを作成（ソースをコピー）
  const outputData = new Uint8ClampedArray(sourceData.length)
  outputData.set(sourceData)

  // ポリゴンが無効な場合はそのまま返す
  if (polygonPoints.length < 6) {
    return { data: outputData, width, height }
  }

  // 各ピクセルをチェック
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const canvasX = boundsX + x
      const canvasY = boundsY + y

      // 点がLasso内にあるかチェック
      const pointX = canvasX - offsetX
      const pointY = canvasY - offsetY

      if (!isPointInPolygonCore(pointX, pointY, polygonPoints)) {
        // 選択外のピクセルを透明に
        const idx = (y * width + x) * 4
        outputData[idx + 3] = 0 // アルファを0に
      }
    }
  }

  return { data: outputData, width, height }
}

/**
 * Point配列をFloat64Arrayに変換（Worker送信用）
 *
 * @param points - Point配列
 * @returns フラット化されたFloat64Array
 */
export const pointsToFloat64Array = (points: readonly PointData[]): Float64Array => {
  const arr = new Float64Array(points.length * 2)
  for (let i = 0; i < points.length; i++) {
    arr[i * 2] = points[i].x
    arr[i * 2 + 1] = points[i].y
  }
  return arr
}

/**
 * ポリゴンのバウンディングボックスを計算
 *
 * @param polygonPoints - ポリゴンの頂点配列（フラット化）
 * @param offsetX - オフセットX
 * @param offsetY - オフセットY
 * @returns バウンディングボックス
 */
export const calculatePolygonBoundsCore = (
  polygonPoints: Float64Array,
  offsetX: number = 0,
  offsetY: number = 0
): BoundsData => {
  const len = polygonPoints.length
  if (len < 2) {
    return { x: 0, y: 0, width: 0, height: 0 }
  }

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  const numPoints = len / 2
  for (let i = 0; i < numPoints; i++) {
    const x = polygonPoints[i * 2] + offsetX
    const y = polygonPoints[i * 2 + 1] + offsetY
    minX = Math.min(minX, x)
    minY = Math.min(minY, y)
    maxX = Math.max(maxX, x)
    maxY = Math.max(maxY, y)
  }

  return {
    x: Math.floor(minX),
    y: Math.floor(minY),
    width: Math.ceil(maxX - minX),
    height: Math.ceil(maxY - minY),
  }
}
