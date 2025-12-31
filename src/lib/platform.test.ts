import { describe, expect, it, vi } from 'vitest'
import type { IResult } from 'ua-parser-js'

// ua-parser-jsをモック
vi.mock('ua-parser-js', () => ({
  UAParser: vi.fn(),
}))

describe('platform', () => {
  it('should detect Mac OS', async () => {
    const { UAParser } = await import('ua-parser-js')
    ;(UAParser as unknown as ReturnType<typeof vi.fn<() => IResult>>).mockReturnValue({
      os: { name: 'Mac OS', version: '10.15' },
    } as IResult)

    // モジュールをリセットして再インポート
    vi.resetModules()
    const { isMac, isWindows, getModifierKey } = await import('./platform')

    expect(isMac).toBe(true)
    expect(isWindows).toBe(false)
    expect(getModifierKey()).toBe('⌘')
  })

  it('should detect Windows', async () => {
    const { UAParser } = await import('ua-parser-js')
    ;(UAParser as unknown as ReturnType<typeof vi.fn<() => IResult>>).mockReturnValue({
      os: { name: 'Windows', version: '10' },
    } as IResult)

    vi.resetModules()
    const { isMac, isWindows, getModifierKey } = await import('./platform')

    expect(isMac).toBe(false)
    expect(isWindows).toBe(true)
    expect(getModifierKey()).toBe('Ctrl')
  })

  it('should return Ctrl for other OS', async () => {
    const { UAParser } = await import('ua-parser-js')
    ;(UAParser as unknown as ReturnType<typeof vi.fn<() => IResult>>).mockReturnValue({
      os: { name: 'Linux', version: '5.0' },
    } as IResult)

    vi.resetModules()
    const { isMac, isWindows, getModifierKey } = await import('./platform')

    expect(isMac).toBe(false)
    expect(isWindows).toBe(false)
    expect(getModifierKey()).toBe('Ctrl')
  })
})
