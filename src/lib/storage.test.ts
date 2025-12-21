import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
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

  it('returns stored value if it is in allowed values', () => {
    mockLocalStorage.getItem.mockReturnValue('dark')
    const result = getStorageItem('theme', ['light', 'dark'] as const)
    expect(result).toBe('dark')
  })

  it('returns null if stored value is not in allowed values', () => {
    mockLocalStorage.getItem.mockReturnValue('invalid')
    const result = getStorageItem('theme', ['light', 'dark'] as const)
    expect(result).toBeNull()
  })

  it('returns null if no stored value', () => {
    mockLocalStorage.getItem.mockReturnValue(null)
    const result = getStorageItem('theme', ['light', 'dark'] as const)
    expect(result).toBeNull()
  })

  it('returns null if window is undefined', () => {
    vi.stubGlobal('window', undefined)
    const result = getStorageItem('theme', ['light', 'dark'] as const)
    expect(result).toBeNull()
  })
})

describe('setStorageItem', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('sets item in localStorage', () => {
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

  it('does nothing if window is undefined', () => {
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
