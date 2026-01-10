import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { PwaUpdateProvider, usePwaUpdate } from './PwaUpdateContext'
import { useRegisterSW } from 'virtual:pwa-register/react'

vi.mock('virtual:pwa-register/react')

describe('PwaUpdateContext', () => {
  const mockUpdateServiceWorker = vi.fn()
  const mockSetNeedRefresh = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useRegisterSW as Mock).mockReturnValue({
      needRefresh: [false, mockSetNeedRefresh],
      offlineReady: [false, vi.fn()],
      updateServiceWorker: mockUpdateServiceWorker,
    })
  })

  describe('usePwaUpdate', () => {
    it('Provider外で使用するとエラーをスローする', () => {
      expect(() => {
        renderHook(() => usePwaUpdate())
      }).toThrow('usePwaUpdate must be used within a PwaUpdateProvider')
    })

    it('Provider内で使用すると正常に動作する', () => {
      const { result } = renderHook(() => usePwaUpdate(), {
        wrapper: PwaUpdateProvider,
      })

      expect(result.current.needRefresh).toBe(false)
      expect(typeof result.current.updateApp).toBe('function')
      expect(typeof result.current.checkForUpdate).toBe('function')
      expect(typeof result.current.dismissUpdate).toBe('function')
    })
  })

  describe('needRefresh', () => {
    it('useRegisterSWのneedRefreshがfalseの場合はfalseを返す', () => {
      ;(useRegisterSW as Mock).mockReturnValue({
        needRefresh: [false, mockSetNeedRefresh],
        offlineReady: [false, vi.fn()],
        updateServiceWorker: mockUpdateServiceWorker,
      })

      const { result } = renderHook(() => usePwaUpdate(), {
        wrapper: PwaUpdateProvider,
      })

      expect(result.current.needRefresh).toBe(false)
    })

    it('useRegisterSWのneedRefreshがtrueの場合はtrueを返す', () => {
      ;(useRegisterSW as Mock).mockReturnValue({
        needRefresh: [true, mockSetNeedRefresh],
        offlineReady: [false, vi.fn()],
        updateServiceWorker: mockUpdateServiceWorker,
      })

      const { result } = renderHook(() => usePwaUpdate(), {
        wrapper: PwaUpdateProvider,
      })

      expect(result.current.needRefresh).toBe(true)
    })

    it('dismissUpdate後はneedRefreshがfalseになる', () => {
      ;(useRegisterSW as Mock).mockReturnValue({
        needRefresh: [true, mockSetNeedRefresh],
        offlineReady: [false, vi.fn()],
        updateServiceWorker: mockUpdateServiceWorker,
      })

      const { result } = renderHook(() => usePwaUpdate(), {
        wrapper: PwaUpdateProvider,
      })

      expect(result.current.needRefresh).toBe(true)

      act(() => {
        result.current.dismissUpdate()
      })

      expect(result.current.needRefresh).toBe(false)
    })
  })

  describe('updateApp', () => {
    it('updateServiceWorkerをtrueで呼び出す', () => {
      const { result } = renderHook(() => usePwaUpdate(), {
        wrapper: PwaUpdateProvider,
      })

      act(() => {
        result.current.updateApp()
      })

      expect(mockUpdateServiceWorker).toHaveBeenCalledWith(true)
    })
  })

  describe('checkForUpdate', () => {
    it('Service Workerの更新をチェックする', async () => {
      const mockUpdate = vi.fn().mockResolvedValue(undefined)
      const mockGetRegistration = vi.fn().mockResolvedValue({
        update: mockUpdate,
      })
      Object.defineProperty(navigator, 'serviceWorker', {
        value: { getRegistration: mockGetRegistration },
        configurable: true,
      })

      const { result } = renderHook(() => usePwaUpdate(), {
        wrapper: PwaUpdateProvider,
      })

      await act(async () => {
        await result.current.checkForUpdate()
      })

      expect(mockGetRegistration).toHaveBeenCalled()
      expect(mockUpdate).toHaveBeenCalled()
    })

    it('dismissedをfalseにリセットする', async () => {
      ;(useRegisterSW as Mock).mockReturnValue({
        needRefresh: [true, mockSetNeedRefresh],
        offlineReady: [false, vi.fn()],
        updateServiceWorker: mockUpdateServiceWorker,
      })

      const mockGetRegistration = vi.fn().mockResolvedValue(null)
      Object.defineProperty(navigator, 'serviceWorker', {
        value: { getRegistration: mockGetRegistration },
        configurable: true,
      })

      const { result } = renderHook(() => usePwaUpdate(), {
        wrapper: PwaUpdateProvider,
      })

      // まずdismissする
      act(() => {
        result.current.dismissUpdate()
      })
      expect(result.current.needRefresh).toBe(false)

      // checkForUpdateでdismissedがリセットされる
      await act(async () => {
        await result.current.checkForUpdate()
      })

      await waitFor(() => {
        expect(result.current.needRefresh).toBe(true)
      })
    })

    it('registrationがnullの場合もエラーにならない', async () => {
      const mockGetRegistration = vi.fn().mockResolvedValue(null)
      Object.defineProperty(navigator, 'serviceWorker', {
        value: { getRegistration: mockGetRegistration },
        configurable: true,
      })

      const { result } = renderHook(() => usePwaUpdate(), {
        wrapper: PwaUpdateProvider,
      })

      await expect(
        act(async () => {
          await result.current.checkForUpdate()
        })
      ).resolves.not.toThrow()
    })

    it('更新がある場合はupdateAvailable: trueを返す', async () => {
      ;(useRegisterSW as Mock).mockReturnValue({
        needRefresh: [true, mockSetNeedRefresh],
        offlineReady: [false, vi.fn()],
        updateServiceWorker: mockUpdateServiceWorker,
      })

      const mockGetRegistration = vi.fn().mockResolvedValue(null)
      Object.defineProperty(navigator, 'serviceWorker', {
        value: { getRegistration: mockGetRegistration },
        configurable: true,
      })

      const { result } = renderHook(() => usePwaUpdate(), {
        wrapper: PwaUpdateProvider,
      })

      let checkResult: { updateAvailable: boolean } | undefined
      await act(async () => {
        checkResult = await result.current.checkForUpdate()
      })

      expect(checkResult).toEqual({ updateAvailable: true })
    })

    it('更新がない場合はupdateAvailable: falseを返す', async () => {
      ;(useRegisterSW as Mock).mockReturnValue({
        needRefresh: [false, mockSetNeedRefresh],
        offlineReady: [false, vi.fn()],
        updateServiceWorker: mockUpdateServiceWorker,
      })

      const mockGetRegistration = vi.fn().mockResolvedValue(null)
      Object.defineProperty(navigator, 'serviceWorker', {
        value: { getRegistration: mockGetRegistration },
        configurable: true,
      })

      const { result } = renderHook(() => usePwaUpdate(), {
        wrapper: PwaUpdateProvider,
      })

      let checkResult: { updateAvailable: boolean } | undefined
      await act(async () => {
        checkResult = await result.current.checkForUpdate()
      })

      expect(checkResult).toEqual({ updateAvailable: false })
    })
  })

  describe('dismissUpdate', () => {
    it('needRefreshをfalseにする', () => {
      ;(useRegisterSW as Mock).mockReturnValue({
        needRefresh: [true, mockSetNeedRefresh],
        offlineReady: [false, vi.fn()],
        updateServiceWorker: mockUpdateServiceWorker,
      })

      const { result } = renderHook(() => usePwaUpdate(), {
        wrapper: PwaUpdateProvider,
      })

      expect(result.current.needRefresh).toBe(true)

      act(() => {
        result.current.dismissUpdate()
      })

      expect(result.current.needRefresh).toBe(false)
    })
  })
})
