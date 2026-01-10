import { useCallback, useEffect, useRef, useState } from 'react'
import type { PointerPoint, PointerType } from '../types'
import {
  getPointerType,
  isPrimaryButton,
  isPrimaryButtonPressed,
  extractPointerPoint,
  extractCoalescedPoints,
} from '../helpers'
import { colorWheelState } from '@/features/color/hooks/colorWheelState'

/** キャンバス外でのポインター位置を追跡するための型 */
type PendingStrokeStart = {
  x: number
  y: number
  pressure: number
  pointerType: PointerType
}

/**
 * usePointerInputフックのオプション
 */
type UsePointerInputOptions = {
  onStart: (point: PointerPoint) => void
  onMove: (point: PointerPoint) => void
  onEnd: () => void
  onWheel?: (deltaY: number) => void
  /** ズーム倍率（座標変換に使用、デフォルト: 1） */
  zoom?: number
  /** ポインター位置が更新された時のコールバック（パフォーマンスのためrefで直接呼び出し） */
  onPointerPositionChange?: (x: number, y: number) => void
  /** ポインターがキャンバスを離れた時のコールバック */
  onPointerLeaveCanvas?: () => void
}

/**
 * ポインターイベントハンドラのプロパティ
 */
type PointerInputProps = {
  onPointerDown: (event: React.PointerEvent<HTMLElement>) => void
  onPointerMove: (event: React.PointerEvent<HTMLElement>) => void
  onPointerUp: (event: React.PointerEvent<HTMLElement>) => void
  onPointerCancel: (event: React.PointerEvent<HTMLElement>) => void
  onPointerLeave: (event: React.PointerEvent<HTMLElement>) => void
  onPointerEnter: (event: React.PointerEvent<HTMLElement>) => void
  onContextMenu: (event: React.MouseEvent<HTMLElement>) => void
}

/**
 * usePointerInputフックの戻り値
 */
type UsePointerInputReturn = {
  pointerProps: PointerInputProps
  isDrawing: boolean
  activePointerType: PointerType | null
  /** キャンバス要素のref（ウィンドウレベルのポインター追跡に必要） */
  canvasRef: (element: HTMLElement | null) => void
}

/**
 * ポインター入力を統一的に処理するフック
 * マウス、タッチ、ペン入力を抽象化
 * @param options - コールバック関数のオプション
 * @returns ポインターイベントプロパティと状態
 */
export const usePointerInput = ({
  onStart,
  onMove,
  onEnd,
  onWheel,
  zoom = 1,
  onPointerPositionChange,
  onPointerLeaveCanvas,
}: UsePointerInputOptions): UsePointerInputReturn => {
  // マルチポインターの競合を防ぐためアクティブなポインターIDを追跡
  const activePointerIdRef = useRef<number | null>(null)
  const [activePointerType, setActivePointerType] = useState<PointerType | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  // キャンバス外でボタンが押された時の位置を保存
  const pendingStrokeStartRef = useRef<PendingStrokeStart | null>(null)
  // キャンバス要素の参照を保持
  const canvasElementRef = useRef<HTMLElement | null>(null)
  // コールバックをrefで保持（パフォーマンスのため）
  const onPointerPositionChangeRef = useRef(onPointerPositionChange)
  const onPointerLeaveCanvasRef = useRef(onPointerLeaveCanvas)
  useEffect(() => {
    onPointerPositionChangeRef.current = onPointerPositionChange
    onPointerLeaveCanvasRef.current = onPointerLeaveCanvas
  })

  /** ストロークを終了してポインター状態をリセット */
  const endStroke = useCallback(() => {
    if (activePointerIdRef.current !== null) {
      activePointerIdRef.current = null
      setActivePointerType(null)
      setIsDrawing(false)
      onEnd()
    }
  }, [onEnd])

  /**
   * ポインターダウン時のハンドラ
   * @param event - ポインターイベント
   */
  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      // 別のポインターで描画中の場合は無視（マルチタッチの競合を防止）
      if (activePointerIdRef.current !== null) {
        return
      }

      // プライマリボタンのみ処理（左マウスボタン、タッチ、またはペン接触）
      if (!isPrimaryButton(event.button)) {
        return
      }

      const element = event.currentTarget

      // 要素を離れてもイベントを受信するためポインターをキャプチャ
      try {
        element.setPointerCapture(event.pointerId)
      } catch {
        // setPointerCaptureはエッジケースで失敗することがある、続行
      }

      activePointerIdRef.current = event.pointerId
      setActivePointerType(getPointerType(event.pointerType))
      setIsDrawing(true)

      const point = extractPointerPoint(event, element, zoom)
      onPointerPositionChangeRef.current?.(point.x, point.y)
      onStart(point)
    },
    [onStart, zoom]
  )

  /**
   * ポインター移動時のハンドラ
   * getCoalescedEvents()を使用して、高速な動きでも全ポイントを取得
   * @param event - ポインターイベント
   */
  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      const element = event.currentTarget

      // アクティブなポインターのムーブイベントのみ処理
      if (activePointerIdRef.current !== event.pointerId) {
        // 描画中でなくてもカーソル位置は更新
        const point = extractPointerPoint(event, element, zoom)
        onPointerPositionChangeRef.current?.(point.x, point.y)
        return
      }

      // coalescedイベントから全ポイントを取得してより滑らかな描画を実現
      const points = extractCoalescedPoints(event, element, zoom)

      // 全ポイントをonMoveに送信
      for (const point of points) {
        onMove(point)
      }

      // カーソル位置は最後のポイントで更新
      const lastPoint = points[points.length - 1]
      onPointerPositionChangeRef.current?.(lastPoint.x, lastPoint.y)
    },
    [onMove, zoom]
  )

  /**
   * ポインターアップ時のハンドラ
   * @param event - ポインターイベント
   */
  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      // アクティブなポインターのみ処理
      if (activePointerIdRef.current !== event.pointerId) {
        return
      }

      const element = event.currentTarget

      // ポインターキャプチャを解放
      try {
        element.releasePointerCapture(event.pointerId)
      } catch {
        // キャプチャが既に解放されている場合は失敗することがある
      }

      endStroke()
    },
    [endStroke]
  )

  /**
   * ポインターキャンセル時のハンドラ
   * @param event - ポインターイベント
   */
  const handlePointerCancel = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      // 中断されたポインターを処理（例：システムジェスチャー、パームリジェクション）
      if (activePointerIdRef.current !== event.pointerId) {
        return
      }

      endStroke()
    },
    [endStroke]
  )

  /**
   * ポインターが要素を離れた時のハンドラ
   * @param event - ポインターイベント
   */
  const handlePointerLeave = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      // ポインターキャプチャがある場合はイベントを受信し続けるのでストロークを終了しない
      // キャプチャされていないポインターの位置のみクリア
      if (activePointerIdRef.current !== event.pointerId) {
        onPointerLeaveCanvasRef.current?.()
        return
      }

      // アクティブなポインターの場合、まだキャプチャがあるか確認
      // ない場合（通常は起こらないはず）、ストロークを終了
      try {
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
          onPointerLeaveCanvasRef.current?.()
          endStroke()
        }
      } catch {
        onPointerLeaveCanvasRef.current?.()
        endStroke()
      }
    },
    [endStroke]
  )

  /**
   * ポインターが要素に入った時のハンドラ
   * キャンバス外でボタンを押しながら入った場合はストロークを開始
   * @param event - ポインターイベント
   */
  const handlePointerEnter = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      const element = event.currentTarget
      canvasElementRef.current = element
      const point = extractPointerPoint(event, element, zoom)
      onPointerPositionChangeRef.current?.(point.x, point.y)

      // 別のポインターで描画中の場合は無視
      if (activePointerIdRef.current !== null) {
        return
      }

      // ColorWheelがドラッグ中の場合は無視
      if (colorWheelState.isDragging) {
        return
      }

      if (isPrimaryButtonPressed(event.buttons)) {
        try {
          element.setPointerCapture(event.pointerId)
        } catch {
          // setPointerCaptureはエッジケースで失敗することがある
        }

        activePointerIdRef.current = event.pointerId
        setActivePointerType(getPointerType(event.pointerType))
        setIsDrawing(true)

        // キャンバス外で追跡していた位置があればそこから開始
        const pending = pendingStrokeStartRef.current
        if (pending) {
          onStart(pending)
          pendingStrokeStartRef.current = null
        } else {
          onStart(point)
        }
      }
    },
    [onStart, zoom]
  )

  // ホイールイベントはpassive: falseでネイティブリスナーを使用（useEffect内で設定）

  /**
   * コンテキストメニューのハンドラ（右クリック無効化）
   * @param event - マウスイベント
   */
  const handleContextMenu = useCallback((event: React.MouseEvent<HTMLElement>) => {
    // 右クリックまたは長押しでコンテキストメニューを防止
    event.preventDefault()
  }, [])

  // ウィンドウレベルでポインター位置を追跡（キャンバス外でもボタンが押されたら位置を記録）
  useEffect(() => {
    const handleWindowPointerMove = (event: PointerEvent) => {
      // 描画中またはキャンバス要素がない場合は無視
      if (activePointerIdRef.current !== null || !canvasElementRef.current) {
        return
      }

      // ColorWheelがドラッグ中の場合はpendingをクリアして無視
      if (colorWheelState.isDragging) {
        pendingStrokeStartRef.current = null
        return
      }

      if (isPrimaryButtonPressed(event.buttons)) {
        const rect = canvasElementRef.current.getBoundingClientRect()
        const x = (event.clientX - rect.left) / zoom
        const y = (event.clientY - rect.top) / zoom

        pendingStrokeStartRef.current = {
          x,
          y,
          pressure: event.pressure,
          pointerType: getPointerType(event.pointerType),
        }
      } else {
        // ボタンが離されたらクリア
        pendingStrokeStartRef.current = null
      }
    }

    const handleWindowPointerUp = () => {
      pendingStrokeStartRef.current = null
    }

    window.addEventListener('pointermove', handleWindowPointerMove)
    window.addEventListener('pointerup', handleWindowPointerUp)

    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove)
      window.removeEventListener('pointerup', handleWindowPointerUp)
    }
  }, [zoom])

  // refコールバック: マウント時にキャンバス要素を設定
  const canvasRef = useCallback((element: HTMLElement | null) => {
    canvasElementRef.current = element
  }, [])

  // ホイールイベントリスナー（passive: falseでpreventDefaultを有効化）
  useEffect(() => {
    const element = canvasElementRef.current
    if (!element || !onWheel) return

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()
      onWheel(event.deltaY)
    }

    element.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      element.removeEventListener('wheel', handleWheel)
    }
  }, [onWheel])

  return {
    pointerProps: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerCancel,
      onPointerLeave: handlePointerLeave,
      onPointerEnter: handlePointerEnter,
      onContextMenu: handleContextMenu,
    },
    isDrawing,
    activePointerType,
    canvasRef,
  }
}
