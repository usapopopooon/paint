import { describe, expect, it, vi } from 'vitest'

// ua-parser-jsをモック
vi.mock('ua-parser-js', () => ({
  UAParser: vi.fn(),
}))

describe('platform', () => {
  it('should detect Mac OS', async () => {
    const { UAParser } = await import('ua-parser-js')
    vi.mocked(UAParser).mockReturnValue({
      os: { name: 'Mac OS', version: '10.15' },
    } as ReturnType<typeof UAParser>)

    // モジュールをリセットして再インポート
    vi.resetModules()
    const { isMac, isWindows, getModifierKey } = await import('./platform')

    expect(isMac).toBe(true)
    expect(isWindows).toBe(false)
    expect(getModifierKey()).toBe('⌘')
  })

  it('should detect Windows', async () => {
    const { UAParser } = await import('ua-parser-js')
    vi.mocked(UAParser).mockReturnValue({
      os: { name: 'Windows', version: '10' },
    } as ReturnType<typeof UAParser>)

    vi.resetModules()
    const { isMac, isWindows, getModifierKey } = await import('./platform')

    expect(isMac).toBe(false)
    expect(isWindows).toBe(true)
    expect(getModifierKey()).toBe('Ctrl')
  })

  it('should return Ctrl for other OS', async () => {
    const { UAParser } = await import('ua-parser-js')
    vi.mocked(UAParser).mockReturnValue({
      os: { name: 'Linux', version: '5.0' },
    } as ReturnType<typeof UAParser>)

    vi.resetModules()
    const { isMac, isWindows, getModifierKey } = await import('./platform')

    expect(isMac).toBe(false)
    expect(isWindows).toBe(false)
    expect(getModifierKey()).toBe('Ctrl')
  })
})
