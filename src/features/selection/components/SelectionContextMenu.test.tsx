import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SelectionContextMenu } from './SelectionContextMenu'

// i18nのモック
vi.mock('@/features/i18n', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'menu.cut': 'Cut',
        'menu.copy': 'Copy',
        'menu.paste': 'Paste',
        'menu.delete': 'Delete',
        'menu.selectAll': 'Select All',
        'menu.deselect': 'Deselect',
      }
      return translations[key] || key
    },
  }),
}))

// platformのモック
vi.mock('@/lib/platform', () => ({
  getModifierKey: () => 'Ctrl',
}))

describe('SelectionContextMenu', () => {
  const defaultProps = {
    hasSelection: false,
    hasClipboard: false,
    onCut: vi.fn(),
    onCopy: vi.fn(),
    onPaste: vi.fn(),
    onDelete: vi.fn(),
    onDeselect: vi.fn(),
    onSelectAll: vi.fn(),
    children: <div>Test Content</div>,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('レンダリング', () => {
    it('子要素をレンダリングする', () => {
      render(<SelectionContextMenu {...defaultProps} />)
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('showContextMenu=falseの場合はdivでラップする', () => {
      render(<SelectionContextMenu {...defaultProps} showContextMenu={false} />)
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })
  })

  describe('コンテキストメニュー', () => {
    it('右クリックでメニューが開く', async () => {
      const user = userEvent.setup()
      render(<SelectionContextMenu {...defaultProps} />)

      await user.pointer({ keys: '[MouseRight]', target: screen.getByText('Test Content') })

      expect(screen.getByText('Cut')).toBeInTheDocument()
      expect(screen.getByText('Copy')).toBeInTheDocument()
      expect(screen.getByText('Paste')).toBeInTheDocument()
      expect(screen.getByText('Delete')).toBeInTheDocument()
      expect(screen.getByText('Select All')).toBeInTheDocument()
      expect(screen.getByText('Deselect')).toBeInTheDocument()
    })

    it('ショートカットキーが表示される', async () => {
      const user = userEvent.setup()
      render(<SelectionContextMenu {...defaultProps} />)

      await user.pointer({ keys: '[MouseRight]', target: screen.getByText('Test Content') })

      expect(screen.getByText('Ctrl+X')).toBeInTheDocument()
      expect(screen.getByText('Ctrl+C')).toBeInTheDocument()
      expect(screen.getByText('Ctrl+V')).toBeInTheDocument()
      expect(screen.getByText('Del')).toBeInTheDocument()
      expect(screen.getByText('Ctrl+A')).toBeInTheDocument()
      expect(screen.getByText('Ctrl+D')).toBeInTheDocument()
    })
  })

  describe('メニュー項目の無効化', () => {
    it('選択なしの場合、Cut/Copy/Delete/Deselectが無効', async () => {
      const user = userEvent.setup()
      render(<SelectionContextMenu {...defaultProps} hasSelection={false} />)

      await user.pointer({ keys: '[MouseRight]', target: screen.getByText('Test Content') })

      expect(screen.getByText('Cut').closest('[data-disabled]')).toBeInTheDocument()
      expect(screen.getByText('Copy').closest('[data-disabled]')).toBeInTheDocument()
      expect(screen.getByText('Delete').closest('[data-disabled]')).toBeInTheDocument()
      expect(screen.getByText('Deselect').closest('[data-disabled]')).toBeInTheDocument()
    })

    it('選択ありの場合、Cut/Copy/Delete/Deselectが有効', async () => {
      const user = userEvent.setup()
      render(<SelectionContextMenu {...defaultProps} hasSelection={true} />)

      await user.pointer({ keys: '[MouseRight]', target: screen.getByText('Test Content') })

      expect(screen.getByText('Cut').closest('[data-disabled]')).not.toBeInTheDocument()
      expect(screen.getByText('Copy').closest('[data-disabled]')).not.toBeInTheDocument()
      expect(screen.getByText('Delete').closest('[data-disabled]')).not.toBeInTheDocument()
      expect(screen.getByText('Deselect').closest('[data-disabled]')).not.toBeInTheDocument()
    })

    it('クリップボードなしの場合、Pasteが無効', async () => {
      const user = userEvent.setup()
      render(<SelectionContextMenu {...defaultProps} hasClipboard={false} />)

      await user.pointer({ keys: '[MouseRight]', target: screen.getByText('Test Content') })

      expect(screen.getByText('Paste').closest('[data-disabled]')).toBeInTheDocument()
    })

    it('クリップボードありの場合、Pasteが有効', async () => {
      const user = userEvent.setup()
      render(<SelectionContextMenu {...defaultProps} hasClipboard={true} />)

      await user.pointer({ keys: '[MouseRight]', target: screen.getByText('Test Content') })

      expect(screen.getByText('Paste').closest('[data-disabled]')).not.toBeInTheDocument()
    })

    it('Select Allは常に有効', async () => {
      const user = userEvent.setup()
      render(<SelectionContextMenu {...defaultProps} />)

      await user.pointer({ keys: '[MouseRight]', target: screen.getByText('Test Content') })

      expect(screen.getByText('Select All').closest('[data-disabled]')).not.toBeInTheDocument()
    })
  })

  describe('コールバック', () => {
    it('Select Allクリックでコールバックが呼ばれる', async () => {
      const user = userEvent.setup()
      const onSelectAll = vi.fn()
      render(<SelectionContextMenu {...defaultProps} onSelectAll={onSelectAll} />)

      await user.pointer({ keys: '[MouseRight]', target: screen.getByText('Test Content') })
      await user.click(screen.getByText('Select All'))

      expect(onSelectAll).toHaveBeenCalled()
    })

    it('Cutクリックでコールバックが呼ばれる（選択あり）', async () => {
      const user = userEvent.setup()
      const onCut = vi.fn()
      render(<SelectionContextMenu {...defaultProps} hasSelection={true} onCut={onCut} />)

      await user.pointer({ keys: '[MouseRight]', target: screen.getByText('Test Content') })
      await user.click(screen.getByText('Cut'))

      expect(onCut).toHaveBeenCalled()
    })

    it('Copyクリックでコールバックが呼ばれる（選択あり）', async () => {
      const user = userEvent.setup()
      const onCopy = vi.fn()
      render(<SelectionContextMenu {...defaultProps} hasSelection={true} onCopy={onCopy} />)

      await user.pointer({ keys: '[MouseRight]', target: screen.getByText('Test Content') })
      await user.click(screen.getByText('Copy'))

      expect(onCopy).toHaveBeenCalled()
    })

    it('Pasteクリックでコールバックが呼ばれる（クリップボードあり）', async () => {
      const user = userEvent.setup()
      const onPaste = vi.fn()
      render(<SelectionContextMenu {...defaultProps} hasClipboard={true} onPaste={onPaste} />)

      await user.pointer({ keys: '[MouseRight]', target: screen.getByText('Test Content') })
      await user.click(screen.getByText('Paste'))

      expect(onPaste).toHaveBeenCalled()
    })

    it('Deleteクリックでコールバックが呼ばれる（選択あり）', async () => {
      const user = userEvent.setup()
      const onDelete = vi.fn()
      render(<SelectionContextMenu {...defaultProps} hasSelection={true} onDelete={onDelete} />)

      await user.pointer({ keys: '[MouseRight]', target: screen.getByText('Test Content') })
      await user.click(screen.getByText('Delete'))

      expect(onDelete).toHaveBeenCalled()
    })

    it('Deselectクリックでコールバックが呼ばれる（選択あり）', async () => {
      const user = userEvent.setup()
      const onDeselect = vi.fn()
      render(<SelectionContextMenu {...defaultProps} hasSelection={true} onDeselect={onDeselect} />)

      await user.pointer({ keys: '[MouseRight]', target: screen.getByText('Test Content') })
      await user.click(screen.getByText('Deselect'))

      expect(onDeselect).toHaveBeenCalled()
    })
  })

  describe('showContextMenu', () => {
    it('falseの場合、onContextMenuコールバックが呼ばれる', async () => {
      const user = userEvent.setup()
      const onContextMenu = vi.fn((e: React.MouseEvent) => e.preventDefault())
      render(
        <SelectionContextMenu
          {...defaultProps}
          showContextMenu={false}
          onContextMenu={onContextMenu}
        />
      )

      await user.pointer({ keys: '[MouseRight]', target: screen.getByText('Test Content') })

      expect(onContextMenu).toHaveBeenCalled()
    })
  })
})
