import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getInitialTheme } from './getInitialTheme'

// モック
vi.mock('@/lib/storage', () => ({
  getStorageItem: vi.fn(),
}))

import { getStorageItem } from '@/lib/storage'

describe('getInitialTheme', () => {
  const mockGetStorageItem = vi.mocked(getStorageItem)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return stored theme from localStorage', () => {
    mockGetStorageItem.mockReturnValue('dark')

    const result = getInitialTheme()

    expect(result).toBe('dark')
  })

  it('should return light theme from localStorage', () => {
    mockGetStorageItem.mockReturnValue('light')

    const result = getInitialTheme()

    expect(result).toBe('light')
  })

  it('should return dark when system prefers dark and no stored value', () => {
    mockGetStorageItem.mockReturnValue(null)
    const mockMatchMedia = vi.fn().mockReturnValue({ matches: true })
    vi.stubGlobal('matchMedia', mockMatchMedia)

    const result = getInitialTheme()

    expect(result).toBe('dark')
    expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)')
  })

  it('should return light when system prefers light and no stored value', () => {
    mockGetStorageItem.mockReturnValue(null)
    const mockMatchMedia = vi.fn().mockReturnValue({ matches: false })
    vi.stubGlobal('matchMedia', mockMatchMedia)

    const result = getInitialTheme()

    expect(result).toBe('light')
  })
})
