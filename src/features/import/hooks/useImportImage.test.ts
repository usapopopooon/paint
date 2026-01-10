import { describe, test, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useImportImage } from './useImportImage'
import * as helpers from '../helpers'

// ヘルパー関数をモック
vi.mock('../helpers', () => ({
  validateImageFile: vi.fn(),
  calculateImageSize: vi.fn(),
}))

describe('useImportImage', () => {
  const mockOnImport = vi.fn()
  const mockOnError = vi.fn()
  const defaultOptions = {
    canvasWidth: 800,
    canvasHeight: 600,
    onImport: mockOnImport,
    onError: mockOnError,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('inputRef', () => {
    test('inputRefが返される', () => {
      const { result } = renderHook(() => useImportImage(defaultOptions))

      expect(result.current.inputRef).toBeDefined()
      expect(result.current.inputRef.current).toBeNull()
    })
  })

  describe('openFilePicker', () => {
    test('inputRefのclickを呼び出す', () => {
      const { result } = renderHook(() => useImportImage(defaultOptions))

      const mockClick = vi.fn()
      const mockInput = { click: mockClick } as unknown as HTMLInputElement
      result.current.inputRef.current = mockInput

      act(() => {
        result.current.openFilePicker()
      })

      expect(mockClick).toHaveBeenCalled()
    })

    test('inputRefがnullの場合はエラーにならない', () => {
      const { result } = renderHook(() => useImportImage(defaultOptions))

      expect(() => {
        act(() => {
          result.current.openFilePicker()
        })
      }).not.toThrow()
    })
  })

  describe('handleFileChange', () => {
    test('ファイルが選択されていない場合は何もしない', async () => {
      const { result } = renderHook(() => useImportImage(defaultOptions))

      const event = {
        target: { files: null, value: '' },
      } as unknown as React.ChangeEvent<HTMLInputElement>

      await act(async () => {
        await result.current.handleFileChange(event)
      })

      expect(helpers.validateImageFile).not.toHaveBeenCalled()
      expect(mockOnImport).not.toHaveBeenCalled()
      expect(mockOnError).not.toHaveBeenCalled()
    })

    test('空のファイルリストの場合は何もしない', async () => {
      const { result } = renderHook(() => useImportImage(defaultOptions))

      const event = {
        target: { files: [], value: '' },
      } as unknown as React.ChangeEvent<HTMLInputElement>

      await act(async () => {
        await result.current.handleFileChange(event)
      })

      expect(helpers.validateImageFile).not.toHaveBeenCalled()
      expect(mockOnImport).not.toHaveBeenCalled()
      expect(mockOnError).not.toHaveBeenCalled()
    })

    test('無効なファイル形式の場合はonErrorを呼び出す', async () => {
      vi.mocked(helpers.validateImageFile).mockResolvedValue(false)

      const { result } = renderHook(() => useImportImage(defaultOptions))

      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' })
      const event = {
        target: { files: [mockFile], value: 'C:\\fakepath\\test.txt' },
      } as unknown as React.ChangeEvent<HTMLInputElement>

      await act(async () => {
        await result.current.handleFileChange(event)
      })

      expect(helpers.validateImageFile).toHaveBeenCalledWith(mockFile)
      expect(mockOnError).toHaveBeenCalledWith('invalid-file-type')
      expect(mockOnImport).not.toHaveBeenCalled()
    })

    test('inputのvalueがリセットされる（同じファイルを再選択可能にする）', async () => {
      vi.mocked(helpers.validateImageFile).mockResolvedValue(false)

      const { result } = renderHook(() => useImportImage(defaultOptions))

      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' })
      const eventTarget = { files: [mockFile], value: 'C:\\fakepath\\test.txt' }
      const event = {
        target: eventTarget,
      } as unknown as React.ChangeEvent<HTMLInputElement>

      await act(async () => {
        await result.current.handleFileChange(event)
      })

      expect(eventTarget.value).toBe('')
    })
  })

  describe('戻り値の型', () => {
    test('必要なプロパティがすべて返される', () => {
      const { result } = renderHook(() => useImportImage(defaultOptions))

      expect(result.current).toHaveProperty('inputRef')
      expect(result.current).toHaveProperty('openFilePicker')
      expect(result.current).toHaveProperty('handleFileChange')
      expect(typeof result.current.openFilePicker).toBe('function')
      expect(typeof result.current.handleFileChange).toBe('function')
    })
  })
})
