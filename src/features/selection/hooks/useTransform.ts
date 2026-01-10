import { useState, useCallback, useRef } from 'react'
import type { Point, Bounds } from '@/lib/geometry'
import type { TransformMode, TransformState, TransformHandlePosition } from '../types'
import {
  createInitialTransformState,
  getNextTransformMode,
  calculateScaleFromHandle,
  calculateRotationFromHandle,
  applyTransformToImageData,
  calculateTransformedBounds,
  detectHandle,
  getAllHandlePositions,
} from '../adapters/canvas'

/**
 * ハンドル操作の状態
 */
type HandleOperation = {
  readonly handle: TransformHandlePosition
  readonly startPoint: Point
  readonly startScale: { x: number; y: number }
  readonly startRotation: number
}

/**
 * 変形確定時の結果
 */
export type TransformResult = {
  /** 変形後のImageData */
  readonly imageData: ImageData
  /** 変形後のバウンズ（キャンバス座標系での位置とサイズ） */
  readonly bounds: Bounds
}

/**
 * useTransformの戻り値型
 */
export type UseTransformReturn = {
  /** 変形状態（nullの場合は変形中ではない） */
  readonly transformState: TransformState | null
  /** プレビュー用ImageData（バイリニア補間） */
  readonly previewImageData: ImageData | null
  /** 変形を開始 */
  readonly startTransform: (mode: TransformMode, imageData: ImageData, bounds: Bounds) => void
  /** 変形モードを設定 */
  readonly setTransformMode: (mode: TransformMode) => void
  /** 変形モードをサイクル（Ctrl+T用） */
  readonly cycleTransformMode: () => void
  /** ハンドル操作を開始 */
  readonly startHandleOperation: (handle: TransformHandlePosition, point: Point) => void
  /** 変形を更新（マウスドラッグ中） */
  readonly updateTransform: (point: Point, shiftKey: boolean, altKey: boolean) => void
  /** ハンドル操作を終了 */
  readonly endHandleOperation: () => void
  /** 変形を確定（バイキュービック補間で最終ImageDataを生成） */
  readonly commitTransform: () => TransformResult | null
  /** 変形をキャンセル */
  readonly cancelTransform: () => void
  /** 点がハンドル上にあるかを検出 */
  readonly detectHandleAtPoint: (point: Point, handleSize: number) => TransformHandlePosition | null
  /** すべてのハンドル位置を取得 */
  readonly getHandlePositions: () => Record<TransformHandlePosition, Point> | null
  /** 変形中かどうか */
  readonly isTransforming: boolean
  /** ハンドル操作中かどうか */
  readonly isHandleOperating: boolean
}

/**
 * 変形操作を管理するフック
 */
export const useTransform = (): UseTransformReturn => {
  const [transformState, setTransformState] = useState<TransformState | null>(null)
  const [previewImageData, setPreviewImageData] = useState<ImageData | null>(null)

  // ハンドル操作の状態
  const handleOperationRef = useRef<HandleOperation | null>(null)
  const [isHandleOperating, setIsHandleOperating] = useState(false)

  /**
   * プレビューを更新
   * プレビューは元画像をそのまま使用し、TransformHandlesでCanvas変換行列を使って描画
   */
  const updatePreview = useCallback((state: TransformState) => {
    if (!state.originalImageData) return
    setPreviewImageData(state.originalImageData)
  }, [])

  /**
   * 変形を開始
   */
  const startTransform = useCallback(
    (mode: TransformMode, imageData: ImageData, bounds: Bounds) => {
      const state = createInitialTransformState(mode, bounds, imageData)
      setTransformState(state)
      setPreviewImageData(imageData) // 初期は元画像をそのまま表示
    },
    []
  )

  /**
   * 変形モードを設定
   */
  const setTransformMode = useCallback((mode: TransformMode) => {
    setTransformState((prev) => {
      if (!prev) return null
      return { ...prev, mode }
    })
  }, [])

  /**
   * 変形モードをサイクル（Ctrl+T用）
   */
  const cycleTransformMode = useCallback(() => {
    setTransformState((prev) => {
      if (!prev) return null
      const nextMode = getNextTransformMode(prev.mode)
      return { ...prev, mode: nextMode }
    })
  }, [])

  /**
   * ハンドル操作を開始
   */
  const startHandleOperation = useCallback(
    (handle: TransformHandlePosition, point: Point) => {
      if (!transformState) return

      handleOperationRef.current = {
        handle,
        startPoint: point,
        startScale: transformState.scale,
        startRotation: transformState.rotation,
      }
      setIsHandleOperating(true)
    },
    [transformState]
  )

  /**
   * 変形を更新（マウスドラッグ中）
   */
  const updateTransform = useCallback(
    (point: Point, shiftKey: boolean, altKey: boolean) => {
      const operation = handleOperationRef.current
      if (!operation || !transformState) return

      const { handle, startPoint, startScale, startRotation } = operation

      if (handle === 'rotation') {
        // 回転操作
        const rotation = calculateRotationFromHandle(startPoint, point, transformState.center, {
          snapToAngle: shiftKey,
          snapAngleDegrees: 15,
        })

        const newState: TransformState = {
          ...transformState,
          rotation: startRotation + rotation,
        }
        setTransformState(newState)
        updatePreview(newState)
      } else {
        // スケール操作
        const scale = calculateScaleFromHandle(
          handle,
          startPoint,
          point,
          transformState.originalBounds,
          transformState.center,
          {
            preserveAspectRatio: shiftKey,
            scaleFromCenter: altKey,
          }
        )

        const newState: TransformState = {
          ...transformState,
          scale: {
            x: startScale.x * scale.x,
            y: startScale.y * scale.y,
          },
        }
        setTransformState(newState)
        updatePreview(newState)
      }
    },
    [transformState, updatePreview]
  )

  /**
   * ハンドル操作を終了
   */
  const endHandleOperation = useCallback(() => {
    handleOperationRef.current = null
    setIsHandleOperating(false)
  }, [])

  /**
   * 変形を確定（バイキュービック補間で最終ImageDataを生成）
   */
  const commitTransform = useCallback((): TransformResult | null => {
    if (!transformState || !transformState.originalImageData) {
      return null
    }

    try {
      // バイキュービック補間で高品質な結果を生成
      const imageData = applyTransformToImageData(
        transformState.originalImageData,
        transformState,
        'bicubic'
      )

      // 変形後のバウンズを計算
      const bounds = calculateTransformedBounds(transformState.originalBounds, transformState)

      // 状態をリセット
      setTransformState(null)
      setPreviewImageData(null)
      handleOperationRef.current = null
      setIsHandleOperating(false)

      return { imageData, bounds }
    } catch {
      // 失敗した場合は元のImageDataと元のバウンズを返す
      const original = transformState.originalImageData
      const originalBounds = transformState.originalBounds
      setTransformState(null)
      setPreviewImageData(null)
      handleOperationRef.current = null
      setIsHandleOperating(false)
      return { imageData: original, bounds: originalBounds }
    }
  }, [transformState])

  /**
   * 変形をキャンセル
   */
  const cancelTransform = useCallback((): void => {
    setTransformState(null)
    setPreviewImageData(null)
    handleOperationRef.current = null
    setIsHandleOperating(false)
  }, [])

  /**
   * 点がハンドル上にあるかを検出
   */
  const detectHandleAtPoint = useCallback(
    (point: Point, handleSize: number): TransformHandlePosition | null => {
      if (!transformState) return null

      return detectHandle(
        point,
        transformState.originalBounds,
        transformState.rotation,
        transformState.center,
        handleSize,
        transformState.mode
      )
    },
    [transformState]
  )

  /**
   * すべてのハンドル位置を取得
   */
  const getHandlePositions = useCallback((): Record<TransformHandlePosition, Point> | null => {
    if (!transformState) return null

    return getAllHandlePositions(
      transformState.originalBounds,
      transformState.rotation,
      transformState.center
    )
  }, [transformState])

  return {
    transformState,
    previewImageData,
    startTransform,
    setTransformMode,
    cycleTransformMode,
    startHandleOperation,
    updateTransform,
    endHandleOperation,
    commitTransform,
    cancelTransform,
    detectHandleAtPoint,
    getHandlePositions,
    isTransforming: transformState !== null,
    isHandleOperating,
  }
}
