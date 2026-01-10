/**
 * 変形処理用Web Worker
 *
 * バイキュービック補間などの重い処理をバックグラウンドで実行し、
 * メインスレッドのUIブロッキングを防ぐ。
 */

import { transformImageCore, type TransformParams } from '../adapters/canvas/transformCore'

// Worker内でのメッセージハンドラ
self.onmessage = (e: MessageEvent<TransformParams>) => {
  try {
    const result = transformImageCore(e.data)

    // Transferable Objectsとしてバッファを送信（コピーを避ける）
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(self as any).postMessage(result, [result.data.buffer])
  } catch (error) {
    // エラーをメインスレッドに通知
    self.postMessage({
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
