/**
 * 選択処理用Web Worker
 *
 * Lassoマスキングなどの重いピクセル処理をバックグラウンドで実行し、
 * メインスレッドのUIブロッキングを防ぐ。
 */

import {
  applyLassoMaskCore,
  type MaskParams,
  type MaskResult,
} from '../adapters/canvas/selectionCore'

/**
 * Workerメッセージの種類
 */
type WorkerMessage = { type: 'applyLassoMask'; params: MaskParams }

/**
 * Workerレスポンスの種類
 */
type WorkerResponse = { type: 'applyLassoMask'; result: MaskResult } | { error: string }

// Worker内でのメッセージハンドラ
self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  try {
    const message = e.data

    switch (message.type) {
      case 'applyLassoMask': {
        const result = applyLassoMaskCore(message.params)

        const response: WorkerResponse = { type: 'applyLassoMask', result }

        // Transferable Objectsとしてバッファを送信（コピーを避ける）
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(self as any).postMessage(response, [result.data.buffer])
        break
      }
      default:
        throw new Error(`Unknown message type`)
    }
  } catch (error) {
    // エラーをメインスレッドに通知
    const response: WorkerResponse = {
      error: error instanceof Error ? error.message : 'Unknown error',
    }
    self.postMessage(response)
  }
}
