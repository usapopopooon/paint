import type { PointerPoint, PointerType } from '../types'

/**
 * フィルタの種類
 */
export type FilterType = 'noise' | 'kalman' | 'gaussian' | 'string'

/**
 * フィルタ設定の基底型
 */
type FilterConfig =
  | { type: 'noise'; enabled: boolean; minDistance: number }
  | { type: 'kalman'; enabled: boolean; processNoise: number; measurementNoise: number }
  | { type: 'gaussian'; enabled: boolean; size: number; sigma: number }
  | { type: 'string'; enabled: boolean; stringLength: number }

/**
 * 手振れ補正レベル（0-100）からStabilizedPointerを構築するファクトリー関数
 *
 * レベルに応じて段階的にフィルタが追加される:
 * - 0%: 補正なし（完全スルー）
 * - 1-20%: ノイズフィルタのみ
 * - 21-40%: ノイズ + カルマンフィルタ
 * - 41-60%: ノイズ + カルマン + ガウシアン + rAFバッチ
 * - 61-80%: 上記 + 紐補正（軽）
 * - 81-100%: 上記 + 紐補正（強）
 *
 * @param level - 手振れ補正レベル（0-100）
 * @returns 設定済みのStabilizedPointerインスタンス
 *
 * @example
 * ```typescript
 * const pointer = createStabilizedPointer(50)
 *   .onFlush(callback)
 * ```
 */
export const createStabilizedPointer = (level: number): StabilizedPointer => {
  const pointer = new StabilizedPointer()

  if (level <= 0) {
    // Stage 0: 完全スルー
    return pointer
  }

  // Stage 1+: ノイズフィルタ
  const noiseMinDistance = 1.0 + level * 0.02 // 1.0 - 3.0
  pointer.withNoiseFilter(noiseMinDistance)

  if (level >= 21) {
    // Stage 2+: カルマンフィルタ
    const processNoise = 0.12 - level * 0.0008 // 0.12 - 0.04
    const measurementNoise = 0.4 + level * 0.006 // 0.4 - 1.0
    pointer.withKalmanFilter(processNoise, measurementNoise)
  }

  if (level >= 41) {
    // Stage 3+: ガウシアンフィルタ + rAFバッチ
    const gaussianSize = level >= 61 ? 9 : 7
    const gaussianSigma = 1.0 + level * 0.006 // 1.0 - 1.6
    pointer.withGaussianFilter(gaussianSize, gaussianSigma)
    pointer.withRafBatch()
  }

  if (level >= 61) {
    // Stage 4+: 紐補正
    const stringLength = level >= 81 ? 15 : 8
    pointer.withStringStabilization(stringLength)
  }

  return pointer
}

/**
 * 2点間の距離を計算
 */
const distance = (p1: PointerPoint, p2: PointerPoint): number => {
  const dx = p1.x - p2.x
  const dy = p1.y - p2.y
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * ガウシアンカーネルを生成
 */
const createGaussianKernel = (size: number, sigma: number): number[] => {
  const kernel: number[] = []
  const center = Math.floor(size / 2)

  for (let i = 0; i < size; i++) {
    const x = i - center
    kernel.push(Math.exp(-(x * x) / (2 * sigma * sigma)))
  }

  return kernel
}

/**
 * ポインターイベントのタイプ文字列をPointerType型に変換
 */
const getPointerType = (pointerType: string): PointerType => {
  switch (pointerType) {
    case 'pen':
      return 'pen'
    case 'touch':
      return 'touch'
    default:
      return 'mouse'
  }
}

/**
 * クライアント座標をキャンバスローカル座標に変換
 */
const clientToLocal = (
  clientX: number,
  clientY: number,
  rect: DOMRect,
  pressure: number,
  pointerType: PointerType,
  zoom: number
): PointerPoint => ({
  x: (clientX - rect.left) / zoom,
  y: (clientY - rect.top) / zoom,
  pressure,
  pointerType,
})

/**
 * ポイント更新コールバック
 * rAFでバッチ処理後に呼ばれる
 */
export type OnPointsFlush = (points: readonly PointerPoint[]) => void

/**
 * 手振れ補正付きポインター入力クラス
 *
 * メソッドチェインでフィルタを追加し、追加順序が処理順序となる。
 * 各フィルタは後からパラメータの変更や有効/無効の切り替えが可能。
 *
 * @example
 * ```typescript
 * // 構築時
 * const pointer = new StabilizedPointer()
 *   .withNoiseFilter(1.5)
 *   .withKalmanFilter(0.1, 0.5)
 *   .withGaussianFilter(5, 1.0)
 *   .withStringStabilization(5)
 *   .withRafBatch()
 *   .onFlush(callback)
 *
 * // 後からパラメータを更新
 * pointer.updateNoiseFilter(2.0)
 * pointer.updateKalmanFilter(0.2, 0.8)
 *
 * // 特定のフィルタを無効化
 * pointer.setFilterEnabled('gaussian', false)
 * ```
 */
export class StabilizedPointer {
  /** 生ポイントバッファ */
  private rawBuffer: PointerPoint[] = []
  /** 補正済みポイントバッファ */
  private stabilizedBuffer: PointerPoint[] = []
  /** 最後に出力したポイントのインデックス */
  private lastOutputIndex = 0
  /** フィルタパイプライン（追加順に適用） */
  private filterPipeline: FilterConfig[] = []
  /** rAFバッチ処理が有効か */
  private rafBatchEnabled = false
  /** rAFペンディングポイント */
  private pendingPoints: PointerPoint[] = []
  /** rAF ID */
  private rafId: number | null = null
  /** ポイントフラッシュ時のコールバック */
  private flushCallback: OnPointsFlush | null = null
  /** 紐補正用: 現在の描画点位置 */
  private stringPosition: { x: number; y: number } | null = null
  /** カルマンフィルタ用: 状態推定値 [x, y, vx, vy] */
  private kalmanState: { x: number; y: number; vx: number; vy: number } | null = null
  /** カルマンフィルタ用: 誤差共分散行列（簡略化してスカラー値で管理） */
  private kalmanP = 1

  // ========================================
  // フィルタ追加メソッド（メソッドチェイン）
  // ========================================

  /**
   * ノイズフィルタを追加
   * 最小距離未満の移動は無視
   *
   * @param minDistance - 最小ポイント間距離（ピクセル）
   */
  withNoiseFilter(minDistance: number): this {
    this.filterPipeline.push({ type: 'noise', enabled: true, minDistance })
    return this
  }

  /**
   * カルマンフィルタを追加
   * 予測補正による滑らか化
   *
   * @param processNoise - プロセスノイズ（Q）- 小さいほど予測を信頼（例: 0.1）
   * @param measurementNoise - 観測ノイズ（R）- 大きいほど予測を信頼（例: 0.5）
   */
  withKalmanFilter(processNoise: number, measurementNoise: number): this {
    this.filterPipeline.push({ type: 'kalman', enabled: true, processNoise, measurementNoise })
    return this
  }

  /**
   * ガウシアンフィルタを追加
   * 周辺ポイントの加重平均による平滑化
   *
   * @param size - カーネルサイズ（奇数、3以上）
   * @param sigma - 標準偏差（例: 1.0）
   */
  withGaussianFilter(size: number, sigma: number): this {
    this.filterPipeline.push({ type: 'gaussian', enabled: true, size, sigma })
    return this
  }

  /**
   * 紐補正（Lazy Brush）を追加
   * デッドゾーン付きの追従描画
   *
   * @param stringLength - 紐の長さ（デッドゾーン半径、ピクセル）
   */
  withStringStabilization(stringLength: number): this {
    this.filterPipeline.push({ type: 'string', enabled: true, stringLength })
    return this
  }

  /**
   * rAFバッチ処理を有効化
   * フレーム同期でポイントをまとめて処理
   */
  withRafBatch(): this {
    this.rafBatchEnabled = true
    return this
  }

  /**
   * ポイントフラッシュ時のコールバックを設定
   * @param callback - コールバック関数
   */
  onFlush(callback: OnPointsFlush | null): this {
    this.flushCallback = callback
    return this
  }

  // ========================================
  // フィルタ更新メソッド（後から変更可能）
  // ========================================

  /**
   * ノイズフィルタのパラメータを更新
   * @param minDistance - 最小ポイント間距離（ピクセル）
   */
  updateNoiseFilter(minDistance: number): this {
    const filter = this.getFilter('noise')
    if (filter) {
      filter.minDistance = minDistance
    }
    return this
  }

  /**
   * カルマンフィルタのパラメータを更新
   * @param processNoise - プロセスノイズ（Q）
   * @param measurementNoise - 観測ノイズ（R）
   */
  updateKalmanFilter(processNoise: number, measurementNoise: number): this {
    const filter = this.getFilter('kalman')
    if (filter) {
      filter.processNoise = processNoise
      filter.measurementNoise = measurementNoise
    }
    return this
  }

  /**
   * ガウシアンフィルタのパラメータを更新
   * @param size - カーネルサイズ（奇数、3以上）
   * @param sigma - 標準偏差
   */
  updateGaussianFilter(size: number, sigma: number): this {
    const filter = this.getFilter('gaussian')
    if (filter) {
      filter.size = size
      filter.sigma = sigma
    }
    return this
  }

  /**
   * 紐補正のパラメータを更新
   * @param stringLength - 紐の長さ（ピクセル）
   */
  updateStringStabilization(stringLength: number): this {
    const filter = this.getFilter('string')
    if (filter) {
      filter.stringLength = stringLength
    }
    return this
  }

  /**
   * rAFバッチ処理の有効/無効を設定
   * @param enabled - 有効にするかどうか
   */
  setRafBatchEnabled(enabled: boolean): this {
    this.rafBatchEnabled = enabled
    return this
  }

  /**
   * 特定のフィルタの有効/無効を設定
   * @param type - フィルタの種類
   * @param enabled - 有効にするかどうか
   */
  setFilterEnabled(type: FilterType, enabled: boolean): this {
    const filter = this.filterPipeline.find((f) => f.type === type)
    if (filter) {
      filter.enabled = enabled
    }
    return this
  }

  /**
   * フィルタが追加されているかどうか
   * @param type - フィルタの種類
   */
  hasFilter(type: FilterType): boolean {
    return this.filterPipeline.some((f) => f.type === type)
  }

  /**
   * フィルタが有効かどうか
   * @param type - フィルタの種類
   */
  isFilterEnabled(type: FilterType): boolean {
    const filter = this.filterPipeline.find((f) => f.type === type)
    return filter?.enabled ?? false
  }

  // ========================================
  // 内部ヘルパーメソッド
  // ========================================

  /**
   * 何らかのフィルタが有効かどうか
   */
  private hasEnabledFilters(): boolean {
    return this.filterPipeline.some((f) => f.enabled)
  }

  /**
   * 指定タイプのフィルタ設定を取得
   */
  private getFilter<T extends FilterType>(type: T): Extract<FilterConfig, { type: T }> | undefined {
    return this.filterPipeline.find((f) => f.type === type) as
      | Extract<FilterConfig, { type: T }>
      | undefined
  }

  // ========================================
  // ポイント処理メソッド
  // ========================================

  /**
   * PointerEventから補正済みポイントを抽出してバッファに追加
   * getCoalescedEvents() を使用して高解像度の入力を取得
   *
   * @param event - React PointerEvent
   * @param element - 対象のHTML要素
   * @param zoom - ズーム倍率（デフォルト: 1）
   */
  addPointerEvent(
    event: React.PointerEvent<HTMLElement>,
    element: HTMLElement,
    zoom: number = 1
  ): void {
    const rect = element.getBoundingClientRect()
    const pointerType = getPointerType(event.pointerType)
    const point = clientToLocal(
      event.clientX,
      event.clientY,
      rect,
      event.pressure,
      pointerType,
      zoom
    )

    // 補正なし: 完全スルー
    if (!this.hasEnabledFilters()) {
      this.rawBuffer.push(point)
      this.stabilizedBuffer.push(point)
      if (this.flushCallback) {
        this.flushCallback(this.stabilizedBuffer)
      }
      return
    }

    // coalescedEventsを使用
    const nativeEvent = event.nativeEvent
    const coalescedEvents = nativeEvent.getCoalescedEvents?.() ?? []

    const points =
      coalescedEvents.length > 0
        ? coalescedEvents.map((e) => {
            const pType = getPointerType(e.pointerType)
            return clientToLocal(e.clientX, e.clientY, rect, e.pressure, pType, zoom)
          })
        : [point]

    if (this.rafBatchEnabled) {
      // rAFバッチ処理
      this.queuePoints(points)
    } else {
      // 即座に処理
      const newPoints = this.addPoints(points)
      if (newPoints.length > 0 && this.flushCallback) {
        this.flushCallback(this.stabilizedBuffer)
      }
    }
  }

  /**
   * ポイントをrAFキューに追加
   */
  private queuePoints(points: PointerPoint[]): void {
    this.pendingPoints.push(...points)

    // まだrAFがスケジュールされていなければスケジュール
    if (this.rafId === null) {
      this.rafId = requestAnimationFrame(() => this.flushPendingPoints())
    }
  }

  /**
   * ペンディング中のポイントをフラッシュ
   */
  private flushPendingPoints(): void {
    this.rafId = null
    const pending = this.pendingPoints
    if (pending.length === 0) return

    this.pendingPoints = []

    // 補正を適用して追加
    const newPoints = this.addPoints(pending)

    // コールバックを呼び出し
    if (newPoints.length > 0 && this.flushCallback) {
      this.flushCallback(this.stabilizedBuffer)
    }
  }

  /**
   * ポイントを追加し、新しく補正されたポイントを返す
   * @param point - 生のポインターポイント
   * @returns 新しく補正されたポイント（追加されなかった場合はnull）
   */
  addPoint(point: PointerPoint): PointerPoint | null {
    // 補正なし: 完全スルー
    if (!this.hasEnabledFilters()) {
      this.rawBuffer.push(point)
      this.stabilizedBuffer.push(point)
      return point
    }

    // フィルタパイプラインを順に適用（有効なもののみ）
    let stabilizedPoint: PointerPoint = point

    for (const filter of this.filterPipeline) {
      if (!filter.enabled) continue

      switch (filter.type) {
        case 'noise': {
          // ノイズフィルタ: 最小距離未満なら棄却
          if (this.rawBuffer.length > 0) {
            const lastPoint = this.rawBuffer[this.rawBuffer.length - 1]
            if (distance(lastPoint, point) < filter.minDistance) {
              return null
            }
          }
          break
        }
        case 'kalman': {
          // カルマンフィルタ
          stabilizedPoint = this.applyKalmanFilter(
            stabilizedPoint,
            filter.processNoise,
            filter.measurementNoise
          )
          break
        }
        case 'gaussian': {
          // ガウシアンフィルタ: rawBufferに追加してから適用
          // 先にrawBufferに追加する必要がある
          if (!this.rawBuffer.includes(point)) {
            this.rawBuffer.push(point)
          }
          if (filter.size > 1) {
            stabilizedPoint = this.applyGaussianFilter(
              this.rawBuffer.length - 1,
              filter.size,
              filter.sigma
            )
          }
          break
        }
        case 'string': {
          // 紐補正
          if (filter.stringLength > 0) {
            stabilizedPoint = this.applyStringStabilization(stabilizedPoint, filter.stringLength)
          }
          break
        }
      }
    }

    // rawBufferにまだ追加されていなければ追加
    if (!this.rawBuffer.includes(point)) {
      this.rawBuffer.push(point)
    }

    this.stabilizedBuffer.push(stabilizedPoint)
    return stabilizedPoint
  }

  /**
   * 複数ポイントを一度に追加し、新しく補正されたポイントを返す
   * @param points - 生のポインターポイント配列
   * @returns 新しく補正されたポイント配列
   */
  addPoints(points: PointerPoint[]): PointerPoint[] {
    const results: PointerPoint[] = []
    for (const point of points) {
      const stabilized = this.addPoint(point)
      if (stabilized) {
        results.push(stabilized)
      }
    }
    return results
  }

  /**
   * 最新のポイントを取得（リアルタイム描画用）
   * 最後に getNewPoints() を呼んでから追加された新しいポイントのみ返す
   */
  getNewPoints(): PointerPoint[] {
    const newPoints = this.stabilizedBuffer.slice(this.lastOutputIndex)
    this.lastOutputIndex = this.stabilizedBuffer.length
    return newPoints
  }

  /**
   * 全ての補正済みポイントを取得
   */
  getAllPoints(): readonly PointerPoint[] {
    return this.stabilizedBuffer
  }

  /**
   * ストローク終了時に呼び出し、最終的な補正済みポイントを返す
   * ペンディング中のポイントを含め、終端処理を行い、バッファをリセット
   */
  finish(): PointerPoint[] {
    // ペンディング中のrAFをキャンセル
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }

    // ペンディング中のポイントを即座に処理
    if (this.pendingPoints.length > 0) {
      this.addPoints(this.pendingPoints)
      this.pendingPoints = []
    }

    // 終端処理: 最後のポイントが確実に含まれるようにする
    if (this.rawBuffer.length > 0 && this.stabilizedBuffer.length > 0) {
      const lastRaw = this.rawBuffer[this.rawBuffer.length - 1]
      const lastStabilized = this.stabilizedBuffer[this.stabilizedBuffer.length - 1]

      // 最後の生ポイントと補正済みポイントが異なる場合、終端を追加
      if (distance(lastRaw, lastStabilized) > 0.5) {
        this.stabilizedBuffer.push(lastRaw)
      }
    }

    const result = [...this.stabilizedBuffer]
    this.reset()
    return result
  }

  /**
   * バッファをリセット
   */
  reset(): void {
    // ペンディング中のrAFをキャンセル
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
    this.pendingPoints = []
    this.rawBuffer = []
    this.stabilizedBuffer = []
    this.lastOutputIndex = 0
    this.stringPosition = null
    this.kalmanState = null
    this.kalmanP = 1
  }

  // ========================================
  // フィルタ適用メソッド
  // ========================================

  /**
   * ガウシアンフィルタを適用
   */
  private applyGaussianFilter(targetIndex: number, size: number, sigma: number): PointerPoint {
    const halfSize = Math.floor(size / 2)
    const kernel = createGaussianKernel(size, sigma)

    let sumX = 0
    let sumY = 0
    let weightSum = 0

    for (let k = 0; k < size; k++) {
      // パディング: 範囲外は端の値を使用
      const idx = Math.max(0, Math.min(this.rawBuffer.length - 1, targetIndex - halfSize + k))
      const point = this.rawBuffer[idx]
      const weight = kernel[k]

      sumX += point.x * weight
      sumY += point.y * weight
      weightSum += weight
    }

    const targetPoint = this.rawBuffer[targetIndex]
    return {
      x: sumX / weightSum,
      y: sumY / weightSum,
      pressure: targetPoint.pressure,
      pointerType: targetPoint.pointerType,
    }
  }

  /**
   * カルマンフィルタを適用
   *
   * 位置と速度を状態として追跡し、予測と観測を融合して補正。
   * - 予測ステップ: 前の状態から次の位置を予測
   * - 更新ステップ: 実際の観測値で予測を修正
   *
   * プロセスノイズ(Q)が小さいほど予測を信頼、観測ノイズ(R)が大きいほど予測を信頼
   */
  private applyKalmanFilter(
    point: PointerPoint,
    processNoise: number,
    measurementNoise: number
  ): PointerPoint {
    const Q = processNoise
    const R = measurementNoise

    // 初回は状態を初期化
    if (this.kalmanState === null) {
      this.kalmanState = { x: point.x, y: point.y, vx: 0, vy: 0 }
      this.kalmanP = 1
      return point
    }

    // 予測ステップ
    const dt = 1 // 時間ステップ（簡略化のため1）
    const predictedX = this.kalmanState.x + this.kalmanState.vx * dt
    const predictedY = this.kalmanState.y + this.kalmanState.vy * dt
    const predictedP = this.kalmanP + Q

    // 更新ステップ（カルマンゲイン計算）
    const K = predictedP / (predictedP + R)

    // 状態更新
    const newX = predictedX + K * (point.x - predictedX)
    const newY = predictedY + K * (point.y - predictedY)

    // 速度更新（位置の変化から推定）
    const newVx = (newX - this.kalmanState.x) / dt
    const newVy = (newY - this.kalmanState.y) / dt

    // 誤差共分散更新
    this.kalmanP = (1 - K) * predictedP

    // 状態保存
    this.kalmanState = { x: newX, y: newY, vx: newVx, vy: newVy }

    return {
      x: newX,
      y: newY,
      pressure: point.pressure,
      pointerType: point.pointerType,
    }
  }

  /**
   * 紐補正（Lazy Brush）を適用
   *
   * ペン先と描画点が紐で繋がっているイメージ。
   * ペンが紐の長さ（デッドゾーン）以上動かないと描画点が動かない。
   * 紐の長さを超えた分だけ描画点が追従する。
   */
  private applyStringStabilization(point: PointerPoint, stringLength: number): PointerPoint {
    // 最初のポイントはそのまま使用
    if (this.stringPosition === null) {
      this.stringPosition = { x: point.x, y: point.y }
      return point
    }

    // ペン先と現在の描画点の距離を計算
    const dx = point.x - this.stringPosition.x
    const dy = point.y - this.stringPosition.y
    const dist = Math.sqrt(dx * dx + dy * dy)

    // デッドゾーン内: 描画点は動かない
    if (dist <= stringLength) {
      return {
        x: this.stringPosition.x,
        y: this.stringPosition.y,
        pressure: point.pressure,
        pointerType: point.pointerType,
      }
    }

    // デッドゾーン外: 紐に引っ張られて描画点が移動
    // 描画点はペン先から紐の長さ分だけ離れた位置に移動
    const ratio = (dist - stringLength) / dist
    const newX = this.stringPosition.x + dx * ratio
    const newY = this.stringPosition.y + dy * ratio

    this.stringPosition = { x: newX, y: newY }

    return {
      x: newX,
      y: newY,
      pressure: point.pressure,
      pointerType: point.pointerType,
    }
  }
}
