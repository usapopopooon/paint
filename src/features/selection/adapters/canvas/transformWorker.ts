/**
 * Web Workerラッパー
 *
 * Web Workerを使用した非同期変形処理を提供。
 * Worker未対応環境では同期処理にフォールバック。
 */

import type { Bounds } from '@/lib/geometry'
import type { TransformState } from '../../types'
import {
  transformImageCore,
  type TransformParams,
  type TransformCoreResult,
  type InterpolationMethod,
} from './transformCore'
import { calculateTransformedBounds } from './interpolation'

// Viteの?workerサフィックスでWorkerをインポート
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Viteのworkerインポートは型定義がない
import TransformWorker from '../../workers/transform.worker?worker'

/**
 * TransformStateからTransformParamsを構築
 */
export const buildTransformParams = (
  source: ImageData,
  transform: TransformState,
  method: InterpolationMethod
): TransformParams => {
  const outputBounds = calculateTransformedBounds(transform.originalBounds, transform)

  return {
    sourceData: source.data,
    sourceWidth: source.width,
    sourceHeight: source.height,
    outputWidth: outputBounds.width,
    outputHeight: outputBounds.height,
    outputOffsetX: outputBounds.x,
    outputOffsetY: outputBounds.y,
    srcBoundsX: transform.originalBounds.x,
    srcBoundsY: transform.originalBounds.y,
    centerX: transform.center.x,
    centerY: transform.center.y,
    scaleX: transform.scale.x,
    scaleY: transform.scale.y,
    rotation: transform.rotation,
    method,
  }
}

/**
 * Web Workerを使用した非同期変形処理
 *
 * @param source - ソースImageData
 * @param transform - 変形状態
 * @param method - 補間方式
 * @returns 変形後のImageDataとバウンズ
 */
export const transformImageAsync = (
  source: ImageData,
  transform: TransformState,
  method: InterpolationMethod
): Promise<{ imageData: ImageData; bounds: Bounds }> => {
  return new Promise((resolve, reject) => {
    // Workerを生成
    const worker = new TransformWorker() as Worker

    worker.onmessage = (e: MessageEvent<TransformCoreResult | { error: string }>) => {
      if ('error' in e.data) {
        reject(new Error(e.data.error))
        worker.terminate()
        return
      }

      const result = e.data as TransformCoreResult
      // Uint8ClampedArrayからImageDataを作成
      const imageData = new ImageData(
        new Uint8ClampedArray(result.data),
        result.width,
        result.height
      )
      const bounds = calculateTransformedBounds(transform.originalBounds, transform)

      resolve({ imageData, bounds })
      worker.terminate()
    }

    worker.onerror = (error) => {
      reject(error)
      worker.terminate()
    }

    // パラメータを構築（sourceDataは参照を渡す）
    const params = buildTransformParams(source, transform, method)

    // Workerに送信
    // 注意: Transferableを使用しないことで、元データを保持
    // （キャンセル時に元データが必要なため）
    worker.postMessage(params)
  })
}

/**
 * 同期フォールバック（Worker未対応環境用）
 */
export const transformImageSync = (
  source: ImageData,
  transform: TransformState,
  method: InterpolationMethod
): { imageData: ImageData; bounds: Bounds } => {
  const params = buildTransformParams(source, transform, method)
  const result = transformImageCore(params)
  // Uint8ClampedArrayからImageDataを作成
  const imageData = new ImageData(new Uint8ClampedArray(result.data), result.width, result.height)
  const bounds = calculateTransformedBounds(transform.originalBounds, transform)

  return { imageData, bounds }
}

/**
 * 変形処理（Worker利用可能なら非同期、そうでなければ同期）
 */
export const transformImage = async (
  source: ImageData,
  transform: TransformState,
  method: InterpolationMethod
): Promise<{ imageData: ImageData; bounds: Bounds }> => {
  // Worker未対応環境では同期フォールバック
  if (typeof Worker === 'undefined') {
    return transformImageSync(source, transform, method)
  }

  return transformImageAsync(source, transform, method)
}
