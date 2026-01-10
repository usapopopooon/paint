/**
 * 選択処理Web Workerラッパー
 *
 * Web Workerを使用した非同期選択処理を提供。
 * Worker未対応環境では同期処理にフォールバック。
 */

import type { Point } from '@/lib/geometry'
import {
  applyLassoMaskCore,
  pointsToFloat64Array,
  type MaskParams,
  type MaskResult,
} from './selectionCore'

// Viteの?workerサフィックスでWorkerをインポート
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Viteのworkerインポートは型定義がない
import SelectionWorker from '../../workers/selection.worker?worker'

/**
 * Workerレスポンスの型
 */
type WorkerResponse = { type: 'applyLassoMask'; result: MaskResult } | { error: string }

/**
 * Lassoマスキングのパラメータ（高レベルAPI用）
 */
export type LassoMaskOptions = {
  /** ソースImageData */
  readonly sourceImageData: ImageData
  /** バウンディングボックスのX座標 */
  readonly boundsX: number
  /** バウンディングボックスのY座標 */
  readonly boundsY: number
  /** オフセット */
  readonly offset: Point
  /** Lassoポイント配列 */
  readonly points: readonly Point[]
}

/**
 * MaskParamsを構築
 */
const buildMaskParams = (options: LassoMaskOptions): MaskParams => {
  return {
    sourceData: options.sourceImageData.data,
    width: options.sourceImageData.width,
    height: options.sourceImageData.height,
    boundsX: options.boundsX,
    boundsY: options.boundsY,
    offsetX: options.offset.x,
    offsetY: options.offset.y,
    polygonPoints: pointsToFloat64Array(options.points),
  }
}

/**
 * Web Workerを使用した非同期Lassoマスキング処理
 *
 * @param options - マスキングオプション
 * @returns マスク適用後のImageData
 */
export const applyLassoMaskAsync = (options: LassoMaskOptions): Promise<ImageData> => {
  return new Promise((resolve, reject) => {
    // Workerを生成
    const worker = new SelectionWorker() as Worker

    worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      if ('error' in e.data) {
        reject(new Error(e.data.error))
        worker.terminate()
        return
      }

      if (e.data.type === 'applyLassoMask') {
        const result = e.data.result
        // Uint8ClampedArrayからImageDataを作成
        const imageData = new ImageData(
          new Uint8ClampedArray(result.data),
          result.width,
          result.height
        )

        resolve(imageData)
        worker.terminate()
      }
    }

    worker.onerror = (error) => {
      reject(error)
      worker.terminate()
    }

    // パラメータを構築してWorkerに送信
    const params = buildMaskParams(options)

    worker.postMessage({ type: 'applyLassoMask', params })
  })
}

/**
 * 同期フォールバック（Worker未対応環境用）
 */
export const applyLassoMaskSync = (options: LassoMaskOptions): ImageData => {
  const params = buildMaskParams(options)
  const result = applyLassoMaskCore(params)

  // Uint8ClampedArrayからImageDataを作成
  return new ImageData(new Uint8ClampedArray(result.data), result.width, result.height)
}

/**
 * Lassoマスキング処理（Worker利用可能なら非同期、そうでなければ同期）
 */
export const applyLassoMask = async (options: LassoMaskOptions): Promise<ImageData> => {
  // Worker未対応環境では同期フォールバック
  if (typeof Worker === 'undefined') {
    return applyLassoMaskSync(options)
  }

  return applyLassoMaskAsync(options)
}
