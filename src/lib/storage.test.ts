import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { getStorageItem, setStorageItem } from './storage'

describe('getStorageItem', () => {
  const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  }

  beforeEach(() => {
    vi.stubGlobal('window', {})
    vi.stubGlobal('localStorage', mockLocalStorage)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  test('保存された値が許可リストにある場合はその値を返す', () => {
    mockLocalStorage.getItem.mockReturnValue('dark')
    const result = getStorageItem('theme', ['light', 'dark'] as const)
    expect(result).toBe('dark')
  })

  test('保存された値が許可リストにない場合はnullを返す', () => {
    mockLocalStorage.getItem.mockReturnValue('invalid')
    const result = getStorageItem('theme', ['light', 'dark'] as const)
    expect(result).toBeNull()
  })

  test('保存された値がない場合はnullを返す', () => {
    mockLocalStorage.getItem.mockReturnValue(null)
    const result = getStorageItem('theme', ['light', 'dark'] as const)
    expect(result).toBeNull()
  })

  test('windowが未定義の場合はnullを返す', () => {
    vi.stubGlobal('window', undefined)
    const result = getStorageItem('theme', ['light', 'dark'] as const)
    expect(result).toBeNull()
  })
})

describe('setStorageItem', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  test('localStorageにアイテムを保存する', () => {
    const mockLocalStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    }
    vi.stubGlobal('window', {})
    vi.stubGlobal('localStorage', mockLocalStorage)

    setStorageItem('theme', 'dark')
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'dark')
  })

  test('windowが未定義の場合は何もしない', () => {
    const mockLocalStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    }
    vi.stubGlobal('window', undefined)
    vi.stubGlobal('localStorage', mockLocalStorage)

    setStorageItem('theme', 'dark')
    expect(mockLocalStorage.setItem).not.toHaveBeenCalled()
  })
})
