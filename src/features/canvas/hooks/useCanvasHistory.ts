import { useCallback, useState, useRef, useEffect } from 'react'
import type { Drawable } from '@/features/drawable'
import type { LayerId } from '@/features/layer'
import type { HistoryStorage } from '@/features/history'
import {
  createInMemoryStorage,
  createDrawableAddedAction,
  createDrawablesClearedAction,
  createLayerVisibilityChangedAction,
  createLayerOpacityChangedAction,
  createLayerRenamedAction,
  createCanvasResizedAction,
  createCanvasFlippedAction,
} from '@/features/history'

/**
 * useCanvasHistoryフックのオプション
 */
export type UseCanvasHistoryOptions = {
  readonly storage?: HistoryStorage
  readonly maxUndoLevels?: number
}

/**
 * ストレージ抽象化を備えたキャンバス履歴フック
 *
 * 履歴のみを管理。実際のdrawables状態はuseLayersが単一のsource of truthとして保持。
 * このhookはundo/redo可能かどうかの判定と、アクションの記録・復元を担当。
 *
 * @param options - ストレージ設定オプション
 * @returns undo/redo操作用のメソッドと状態
 *
 * @example
 * const history = useCanvasHistory()
 */
export const useCanvasHistory = (options?: UseCanvasHistoryOptions) => {
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  // ストレージインスタンス（デフォルト: インメモリ）
  const storageRef = useRef<HistoryStorage | null>(null)

  // ストレージを取得（遅延初期化）
  const getStorage = (): HistoryStorage => {
    if (!storageRef.current) {
      storageRef.current =
        options?.storage ??
        createInMemoryStorage({
          maxUndoLevels: options?.maxUndoLevels,
        })
    }
    return storageRef.current
  }

  /** ストレージからスタック情報を同期 */
  const updateStackInfo = useCallback(async () => {
    const result = await getStorage().getStackInfo()
    if (result.success) {
      setCanUndo(result.data.undoCount > 0)
      setCanRedo(result.data.redoCount > 0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * Drawableの追加を履歴に記録
   * @param drawable - 追加されたDrawable
   * @param layerId - 対象レイヤーID
   */
  const addDrawable = useCallback(
    async (drawable: Drawable, layerId: LayerId) => {
      const action = createDrawableAddedAction(drawable, layerId)
      await getStorage().push(action)
      await updateStackInfo()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updateStackInfo]
  )

  /** Undo操作を記録（実際のレイヤー操作は呼び出し側で行う） */
  const undo = useCallback(async () => {
    const result = await getStorage().undo()
    if (result.success) {
      await updateStackInfo()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateStackInfo])

  /** Redo操作を記録（実際のレイヤー操作は呼び出し側で行う） */
  const redo = useCallback(async () => {
    const result = await getStorage().redo()
    if (result.success) {
      await updateStackInfo()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateStackInfo])

  /**
   * Redoで復元されるDrawableを取得
   * @returns 復元されるDrawable、またはnull
   */
  const getRedoDrawable = useCallback(async (): Promise<Drawable | null> => {
    const result = await getStorage().peekRedo()
    if (result.success && result.data && result.data.type === 'drawable:added') {
      return result.data.drawable
    }
    return null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * Undoで戻されるアクションを取得（peek）
   * @returns アクション、またはnull
   */
  const peekUndo = useCallback(async () => {
    const result = await getStorage().peekUndo()
    if (result.success && result.data) {
      return result.data
    }
    return null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * Redoで復元されるアクションを取得（peek）
   * @returns アクション、またはnull
   */
  const peekRedo = useCallback(async () => {
    const result = await getStorage().peekRedo()
    if (result.success && result.data) {
      return result.data
    }
    return null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * クリア操作を履歴に記録
   * @param previousDrawables - クリア前のDrawable配列
   * @param layerId - 対象レイヤーID
   */
  const recordClear = useCallback(
    async (previousDrawables: readonly Drawable[], layerId: LayerId) => {
      const action = createDrawablesClearedAction(previousDrawables, layerId)
      await getStorage().push(action)
      await updateStackInfo()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updateStackInfo]
  )

  /**
   * レイヤー可視性変更を履歴に記録
   * @param layerId - 対象レイヤーID
   * @param previousValue - 変更前の可視性
   * @param newValue - 変更後の可視性
   */
  const recordLayerVisibilityChange = useCallback(
    async (layerId: LayerId, previousValue: boolean, newValue: boolean) => {
      const action = createLayerVisibilityChangedAction(layerId, previousValue, newValue)
      await getStorage().push(action)
      await updateStackInfo()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updateStackInfo]
  )

  /**
   * レイヤー不透明度変更を履歴に記録
   * @param layerId - 対象レイヤーID
   * @param previousValue - 変更前の不透明度
   * @param newValue - 変更後の不透明度
   */
  const recordLayerOpacityChange = useCallback(
    async (layerId: LayerId, previousValue: number, newValue: number) => {
      const action = createLayerOpacityChangedAction(layerId, previousValue, newValue)
      await getStorage().push(action)
      await updateStackInfo()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updateStackInfo]
  )

  /**
   * レイヤー名変更を履歴に記録
   * @param layerId - 対象レイヤーID
   * @param previousName - 変更前のレイヤー名
   * @param newName - 変更後のレイヤー名
   */
  const recordLayerNameChange = useCallback(
    async (layerId: LayerId, previousName: string, newName: string) => {
      const action = createLayerRenamedAction(layerId, previousName, newName)
      await getStorage().push(action)
      await updateStackInfo()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updateStackInfo]
  )

  /**
   * キャンバスリサイズを履歴に記録
   * @param previousWidth - 変更前の幅
   * @param previousHeight - 変更前の高さ
   * @param newWidth - 変更後の幅
   * @param newHeight - 変更後の高さ
   * @param offsetX - X軸オフセット
   * @param offsetY - Y軸オフセット
   */
  const recordCanvasResize = useCallback(
    async (
      previousWidth: number,
      previousHeight: number,
      newWidth: number,
      newHeight: number,
      offsetX: number,
      offsetY: number
    ) => {
      const action = createCanvasResizedAction(
        previousWidth,
        previousHeight,
        newWidth,
        newHeight,
        offsetX,
        offsetY
      )
      await getStorage().push(action)
      await updateStackInfo()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updateStackInfo]
  )

  /**
   * キャンバス反転を履歴に記録
   * @param direction - 反転方向
   * @param canvasWidth - キャンバスの幅
   * @param layerSnapshots - 各レイヤーの反転前のドローアブル
   */
  const recordCanvasFlip = useCallback(
    async (
      direction: 'horizontal',
      canvasWidth: number,
      layerSnapshots: readonly { layerId: LayerId; previousDrawables: readonly Drawable[] }[]
    ) => {
      const action = createCanvasFlippedAction(direction, canvasWidth, layerSnapshots)
      await getStorage().push(action)
      await updateStackInfo()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updateStackInfo]
  )

  // アンマウント時にクリーンアップ
  useEffect(() => {
    return () => {
      if (storageRef.current) {
        storageRef.current.dispose()
        storageRef.current = null
      }
    }
  }, [])

  return {
    canUndo,
    canRedo,
    addDrawable,
    undo,
    redo,
    getRedoDrawable,
    peekUndo,
    peekRedo,
    recordClear,
    recordLayerVisibilityChange,
    recordLayerOpacityChange,
    recordLayerNameChange,
    recordCanvasResize,
    recordCanvasFlip,
  } as const
}
