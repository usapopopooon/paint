import { useEffect, useRef, useCallback } from 'react'
import type { Layer } from '@/features/layer'
import { saveToIndexedDB, isIndexedDBAvailable } from '@/lib/indexedDB'
import { createProjectFile } from '../utils/saveProject'

/** 自動保存の間隔（ミリ秒） */
const AUTO_SAVE_INTERVAL = 30000 // 30秒

/** 操作後の自動保存遅延（ミリ秒） */
const AUTO_SAVE_DELAY = 3000 // 3秒

type UseAutoSaveOptions = {
  /** プロジェクト名 */
  readonly projectName: string
  /** キャンバス幅 */
  readonly canvasWidth: number
  /** キャンバス高さ */
  readonly canvasHeight: number
  /** レイヤー配列 */
  readonly layers: readonly Layer[]
  /** アクティブレイヤーID */
  readonly activeLayerId: string
  /** 自動保存を有効にするか */
  readonly enabled?: boolean
}

/**
 * プロジェクトの自動保存を管理するhook
 * - 操作後3秒で自動保存
 * - 30秒ごとに定期保存
 */
export const useAutoSave = ({
  projectName,
  canvasWidth,
  canvasHeight,
  layers,
  activeLayerId,
  enabled = true,
}: UseAutoSaveOptions) => {
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSaveRef = useRef<number>(0)
  const isSavingRef = useRef(false)

  // 保存処理
  const performSave = useCallback(async () => {
    if (!isIndexedDBAvailable() || isSavingRef.current) return

    isSavingRef.current = true
    try {
      const projectFile = createProjectFile({
        fileName: projectName || 'Untitled',
        canvasWidth,
        canvasHeight,
        layers,
        activeLayerId,
      })
      const content = JSON.stringify(projectFile)
      await saveToIndexedDB(content)
      lastSaveRef.current = Date.now()
    } catch (error) {
      console.error('Auto-save failed:', error)
    } finally {
      isSavingRef.current = false
    }
  }, [projectName, canvasWidth, canvasHeight, layers, activeLayerId])

  // 遅延保存をスケジュール
  const scheduleSave = useCallback(() => {
    if (!enabled) return

    // 既存のタイムアウトをクリア
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // 遅延後に保存
    saveTimeoutRef.current = setTimeout(() => {
      performSave()
    }, AUTO_SAVE_DELAY)
  }, [enabled, performSave])

  // レイヤーの変更を監視して自動保存をトリガー
  useEffect(() => {
    if (!enabled) return

    scheduleSave()

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [layers, enabled, scheduleSave])

  // 定期保存
  useEffect(() => {
    if (!enabled || !isIndexedDBAvailable()) return

    const intervalId = setInterval(() => {
      // 最後の保存から一定時間経過していれば保存
      if (Date.now() - lastSaveRef.current >= AUTO_SAVE_INTERVAL) {
        performSave()
      }
    }, AUTO_SAVE_INTERVAL)

    return () => {
      clearInterval(intervalId)
    }
  }, [enabled, performSave])

  // アンマウント時に即時保存
  useEffect(() => {
    return () => {
      if (enabled && isIndexedDBAvailable()) {
        // 同期的に保存（ベストエフォート）
        const projectFile = createProjectFile({
          fileName: projectName || 'Untitled',
          canvasWidth,
          canvasHeight,
          layers,
          activeLayerId,
        })
        const content = JSON.stringify(projectFile)
        // 非同期だがawaitしない（アンマウント中なので）
        saveToIndexedDB(content).catch(() => {
          // エラーは無視
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // 初回マウント時のみ登録

  return {
    /** 手動で保存をトリガー */
    saveNow: performSave,
    /** 最後の保存時刻 */
    lastSaveTime: lastSaveRef.current,
  }
}
