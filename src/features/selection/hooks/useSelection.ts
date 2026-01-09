import { useState, useCallback, useRef } from 'react'
import type { Point, Bounds } from '@/lib/geometry'
import type { LayerId } from '@/features/layer'
import { generateId } from '@/lib/id'
import type {
  SelectionShape,
  SelectionRegion,
  SelectionClipboard,
  SelectionState,
  SelectionToolType,
} from '../types'
import {
  DEFAULT_FEATHER,
  DEFAULT_ANTI_ALIAS,
  MIN_SELECTION_SIZE,
  MIN_LASSO_POINTS,
} from '../constants'
import { calculateBoundsFromPoints } from '../helpers'

/**
 * 初期選択状態を生成
 */
const createInitialState = (toolType: SelectionToolType): SelectionState => ({
  phase: 'idle',
  region: null,
  clipboard: null,
  toolConfig: {
    type: toolType,
    feather: DEFAULT_FEATHER,
    antiAlias: DEFAULT_ANTI_ALIAS,
  },
})

export type UseSelectionReturn = {
  /** 選択状態 */
  readonly state: SelectionState
  /** 選択中のポイント（矩形の場合は開始/現在の2点） */
  readonly selectionPoints: readonly Point[]
  /** 選択操作を開始 */
  readonly startSelection: (point: Point, layerId: LayerId) => void
  /** 選択中にポイントを更新 */
  readonly updateSelection: (point: Point) => void
  /** 選択操作を確定 */
  readonly commitSelection: () => void
  /** 選択解除 */
  readonly deselect: () => void
  /** 全選択 */
  readonly selectAll: (bounds: Bounds, layerId: LayerId) => void
  /** 選択領域の移動を開始 */
  readonly startMove: (point: Point) => void
  /** 選択領域を移動中 */
  readonly updateMove: (point: Point) => void
  /** 移動を確定 */
  readonly commitMove: () => void
  /** 選択領域を削除（空にする） */
  readonly deleteSelection: () => SelectionRegion | null
  /** 選択領域をコピー */
  readonly copySelection: (imageData: ImageData, bounds: Bounds) => void
  /** 選択領域をカット */
  readonly cutSelection: (imageData: ImageData, bounds: Bounds) => SelectionRegion | null
  /** クリップボードからペースト */
  readonly pasteSelection: (layerId: LayerId, canvasBounds: Bounds) => SelectionClipboard | null
  /** 選択領域を塗りつぶし */
  readonly fillSelection: (color: string) => { shape: SelectionShape; color: string } | null
  /** 選択ツールタイプを変更 */
  readonly setToolType: (type: SelectionToolType) => void
  /** 点が選択領域内にあるか判定 */
  readonly isPointInRegion: (point: Point) => boolean
  /** 選択領域のバウンディングボックスを取得 */
  readonly getSelectionBounds: () => Bounds | null
}

/**
 * 選択状態を管理するフック
 */
export const useSelection = (
  initialToolType: SelectionToolType = 'select-rectangle'
): UseSelectionReturn => {
  const [state, setState] = useState<SelectionState>(() => createInitialState(initialToolType))

  // 選択中のポイントを保持（矩形: [start, current], lasso: [point1, point2, ...]）
  const pointsRef = useRef<Point[]>([])
  const [selectionPoints, setSelectionPoints] = useState<readonly Point[]>([])

  // 移動用の参照点
  const moveStartRef = useRef<Point | null>(null)
  const originalOffsetRef = useRef<Point>({ x: 0, y: 0 })

  // 現在選択操作中のレイヤーID
  const currentLayerIdRef = useRef<LayerId | null>(null)

  /**
   * 選択操作を開始
   */
  const startSelection = useCallback((point: Point, layerId: LayerId) => {
    pointsRef.current = [point]
    currentLayerIdRef.current = layerId
    setSelectionPoints([point])

    setState((prev) => ({
      ...prev,
      phase: 'selecting',
      region: null,
    }))
  }, [])

  /**
   * 選択中にポイントを更新
   */
  const updateSelection = useCallback(
    (point: Point) => {
      if (state.toolConfig.type === 'select-rectangle') {
        // 矩形選択: 開始点と現在の点の2点を保持
        pointsRef.current = [pointsRef.current[0], point]
      } else {
        // Lasso選択: ポイントを追加
        pointsRef.current = [...pointsRef.current, point]
      }
      setSelectionPoints([...pointsRef.current])
    },
    [state.toolConfig.type]
  )

  /**
   * 選択操作を確定
   */
  const commitSelection = useCallback(() => {
    const points = pointsRef.current
    const layerId = currentLayerIdRef.current

    if (!layerId) {
      setState((prev) => ({ ...prev, phase: 'idle' }))
      pointsRef.current = []
      setSelectionPoints([])
      return
    }

    let shape: SelectionShape | null = null

    if (state.toolConfig.type === 'select-rectangle') {
      // 矩形選択
      if (points.length >= 2) {
        const [start, end] = [points[0], points[points.length - 1]]
        const width = Math.abs(end.x - start.x)
        const height = Math.abs(end.y - start.y)

        if (width >= MIN_SELECTION_SIZE && height >= MIN_SELECTION_SIZE) {
          shape = {
            type: 'rectangle',
            bounds: {
              x: Math.min(start.x, end.x),
              y: Math.min(start.y, end.y),
              width,
              height,
            },
          }
        }
      }
    } else {
      // Lasso選択
      if (points.length >= MIN_LASSO_POINTS) {
        shape = {
          type: 'lasso',
          points: [...points],
        }
      }
    }

    if (shape) {
      const region: SelectionRegion = {
        id: generateId('selection'),
        shape,
        layerId,
        imageData: null,
        offset: { x: 0, y: 0 },
      }

      setState((prev) => ({
        ...prev,
        phase: 'selected',
        region,
      }))
    } else {
      // 有効な選択がない場合はidleに戻す
      setState((prev) => ({
        ...prev,
        phase: 'idle',
        region: null,
      }))
    }

    pointsRef.current = []
    setSelectionPoints([])
    currentLayerIdRef.current = null
  }, [state.toolConfig.type])

  /**
   * 選択解除
   */
  const deselect = useCallback(() => {
    pointsRef.current = []
    setSelectionPoints([])
    moveStartRef.current = null
    currentLayerIdRef.current = null

    setState((prev) => ({
      ...prev,
      phase: 'idle',
      region: null,
    }))
  }, [])

  /**
   * 全選択
   */
  const selectAll = useCallback((bounds: Bounds, layerId: LayerId) => {
    const region: SelectionRegion = {
      id: generateId('selection'),
      shape: { type: 'rectangle', bounds },
      layerId,
      imageData: null,
      offset: { x: 0, y: 0 },
    }

    setState((prev) => ({
      ...prev,
      phase: 'selected',
      region,
    }))
  }, [])

  /**
   * 選択領域の移動を開始
   */
  const startMove = useCallback(
    (point: Point) => {
      if (!state.region) return

      moveStartRef.current = point
      originalOffsetRef.current = state.region.offset

      setState((prev) => ({
        ...prev,
        phase: 'moving',
      }))
    },
    [state.region]
  )

  /**
   * 選択領域を移動中
   */
  const updateMove = useCallback(
    (point: Point) => {
      if (!moveStartRef.current || !state.region) return

      const dx = point.x - moveStartRef.current.x
      const dy = point.y - moveStartRef.current.y

      setState((prev) => ({
        ...prev,
        region: prev.region
          ? {
              ...prev.region,
              offset: {
                x: originalOffsetRef.current.x + dx,
                y: originalOffsetRef.current.y + dy,
              },
            }
          : null,
      }))
    },
    [state.region]
  )

  /**
   * 移動を確定
   */
  const commitMove = useCallback(() => {
    moveStartRef.current = null

    setState((prev) => ({
      ...prev,
      phase: 'selected',
    }))
  }, [])

  /**
   * 選択領域を削除（空にする）
   */
  const deleteSelection = useCallback((): SelectionRegion | null => {
    const region = state.region
    if (!region) return null

    deselect()
    return region
  }, [state.region, deselect])

  /**
   * 選択領域をコピー
   */
  const copySelection = useCallback((imageData: ImageData, bounds: Bounds) => {
    setState((prev) => ({
      ...prev,
      clipboard: { imageData, bounds },
    }))
  }, [])

  /**
   * 選択領域をカット
   */
  const cutSelection = useCallback(
    (imageData: ImageData, bounds: Bounds): SelectionRegion | null => {
      const region = state.region
      if (!region) return null

      setState((prev) => ({
        ...prev,
        clipboard: { imageData, bounds },
        phase: 'idle',
        region: null,
      }))

      return region
    },
    [state.region]
  )

  /**
   * クリップボードからペースト
   */
  const pasteSelection = useCallback(
    (layerId: LayerId, canvasBounds: Bounds): SelectionClipboard | null => {
      const clipboard = state.clipboard
      if (!clipboard) return null

      // 中央にペースト
      const centerX = (canvasBounds.width - clipboard.bounds.width) / 2
      const centerY = (canvasBounds.height - clipboard.bounds.height) / 2

      const region: SelectionRegion = {
        id: generateId('selection'),
        shape: {
          type: 'rectangle',
          bounds: {
            x: centerX,
            y: centerY,
            width: clipboard.bounds.width,
            height: clipboard.bounds.height,
          },
        },
        layerId,
        imageData: clipboard.imageData,
        offset: { x: 0, y: 0 },
      }

      setState((prev) => ({
        ...prev,
        phase: 'selected',
        region,
      }))

      return clipboard
    },
    [state.clipboard]
  )

  /**
   * 選択領域を塗りつぶし
   */
  const fillSelection = useCallback(
    (color: string): { shape: SelectionShape; color: string } | null => {
      if (!state.region) return null
      return { shape: state.region.shape, color }
    },
    [state.region]
  )

  /**
   * 選択ツールタイプを変更
   */
  const setToolType = useCallback((type: SelectionToolType) => {
    setState((prev) => ({
      ...prev,
      toolConfig: {
        ...prev.toolConfig,
        type,
      },
    }))
  }, [])

  /**
   * 点が選択領域内にあるか判定
   */
  const isPointInRegion = useCallback(
    (point: Point): boolean => {
      if (!state.region) return false

      const { shape, offset } = state.region
      const adjustedPoint = {
        x: point.x - offset.x,
        y: point.y - offset.y,
      }

      if (shape.type === 'rectangle') {
        const { bounds } = shape
        return (
          adjustedPoint.x >= bounds.x &&
          adjustedPoint.x <= bounds.x + bounds.width &&
          adjustedPoint.y >= bounds.y &&
          adjustedPoint.y <= bounds.y + bounds.height
        )
      } else {
        // Lasso: Ray casting algorithm
        const { points } = shape
        if (points.length < 3) return false

        let inside = false
        for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
          const xi = points[i].x
          const yi = points[i].y
          const xj = points[j].x
          const yj = points[j].y

          const intersect =
            yi > adjustedPoint.y !== yj > adjustedPoint.y &&
            adjustedPoint.x < ((xj - xi) * (adjustedPoint.y - yi)) / (yj - yi) + xi

          if (intersect) inside = !inside
        }

        return inside
      }
    },
    [state.region]
  )

  /**
   * 選択領域のバウンディングボックスを取得
   */
  const getSelectionBounds = useCallback((): Bounds | null => {
    if (!state.region) return null

    const { shape, offset } = state.region
    let baseBounds: Bounds

    if (shape.type === 'rectangle') {
      baseBounds = shape.bounds
    } else {
      baseBounds = calculateBoundsFromPoints(shape.points)
    }

    return {
      x: baseBounds.x + offset.x,
      y: baseBounds.y + offset.y,
      width: baseBounds.width,
      height: baseBounds.height,
    }
  }, [state.region])

  return {
    state,
    selectionPoints,
    startSelection,
    updateSelection,
    commitSelection,
    deselect,
    selectAll,
    startMove,
    updateMove,
    commitMove,
    deleteSelection,
    copySelection,
    cutSelection,
    pasteSelection,
    fillSelection,
    setToolType,
    isPointInRegion,
    getSelectionBounds,
  }
}
