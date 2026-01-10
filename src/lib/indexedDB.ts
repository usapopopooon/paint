/**
 * IndexedDBのラッパーユーティリティ
 * プロジェクトの自動保存・復元に使用
 */

const DB_NAME = 'usapo-paint'
const DB_VERSION = 1
const STORE_NAME = 'autosave'

/**
 * IndexedDBを開く
 */
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'))
    }

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // autosaveストアを作成
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
  })
}

/**
 * 自動保存データの型
 */
export type AutoSaveData = {
  readonly id: string
  readonly projectData: string // JSON文字列
  readonly savedAt: number
}

/**
 * プロジェクトを自動保存
 */
export const saveToIndexedDB = async (projectData: string): Promise<void> => {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)

    const data: AutoSaveData = {
      id: 'current',
      projectData,
      savedAt: Date.now(),
    }

    const request = store.put(data)

    request.onerror = () => {
      db.close()
      reject(new Error('Failed to save to IndexedDB'))
    }

    request.onsuccess = () => {
      db.close()
      resolve()
    }
  })
}

/**
 * 自動保存データを読み込み
 */
export const loadFromIndexedDB = async (): Promise<AutoSaveData | null> => {
  try {
    const db = await openDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.get('current')

      request.onerror = () => {
        db.close()
        reject(new Error('Failed to load from IndexedDB'))
      }

      request.onsuccess = () => {
        db.close()
        resolve(request.result || null)
      }
    })
  } catch {
    // IndexedDBが利用できない場合はnullを返す
    return null
  }
}

/**
 * 自動保存データを削除
 */
export const clearFromIndexedDB = async (): Promise<void> => {
  try {
    const db = await openDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.delete('current')

      request.onerror = () => {
        db.close()
        reject(new Error('Failed to clear IndexedDB'))
      }

      request.onsuccess = () => {
        db.close()
        resolve()
      }
    })
  } catch {
    // エラーは無視
  }
}

/**
 * IndexedDBが利用可能かチェック
 */
export const isIndexedDBAvailable = (): boolean => {
  return typeof indexedDB !== 'undefined'
}
