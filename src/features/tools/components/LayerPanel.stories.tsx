import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test'
import { LayerPanel } from './LayerPanel'
import type { Layer } from '@/features/layer'
import { BACKGROUND_LAYER_ID } from '@/features/layer'

const sampleLayers: readonly Layer[] = [
  {
    id: 'layer-1',
    name: 'Layer 1',
    type: 'drawing',
    isVisible: true,
    isLocked: false,
    opacity: 1,
    blendMode: 'normal',
    drawables: [],
  },
  {
    id: 'layer-2',
    name: 'Layer 2',
    type: 'drawing',
    isVisible: true,
    isLocked: false,
    opacity: 1,
    blendMode: 'normal',
    drawables: [],
  },
  {
    id: 'layer-3',
    name: 'Layer 3',
    type: 'drawing',
    isVisible: true,
    isLocked: false,
    opacity: 1,
    blendMode: 'normal',
    drawables: [],
  },
]

const meta = {
  title: 'Features/Tools/LayerPanel',
  component: LayerPanel,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    layers: sampleLayers,
    drawingLayerCount: 3,
    onLayerSelect: fn(),
    onLayerVisibilityChange: fn(),
    onLayerAdd: fn(),
    onLayerDelete: fn(),
    onLayerNameChange: fn(),
    onLayerBlendModeChange: fn(),
    onLayerOpacityChange: fn(),
    onLayerMove: fn(),
  },
} satisfies Meta<typeof LayerPanel>

export default meta
type Story = StoryObj<typeof LayerPanel>

export const Default: Story = {
  args: {
    activeLayerId: 'layer-1',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByText('Layers')).toBeInTheDocument()
    await expect(canvas.getByText('Layer 1')).toBeInTheDocument()
    await expect(canvas.getByText('Layer 2')).toBeInTheDocument()
    await expect(canvas.getByText('Layer 3')).toBeInTheDocument()
  },
}

export const Layer2Active: Story = {
  args: {
    activeLayerId: 'layer-2',
  },
}

export const Layer3Active: Story = {
  args: {
    activeLayerId: 'layer-3',
  },
}

export const WithHiddenLayer: Story = {
  args: {
    layers: [{ ...sampleLayers[0]!, isVisible: false }, sampleLayers[1]!, sampleLayers[2]!],
    activeLayerId: 'layer-1',
  },
}

const onLayerSelectFn = fn()
export const SelectLayer: Story = {
  args: {
    activeLayerId: 'layer-1',
    onLayerSelect: onLayerSelectFn,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const layer2 = canvas.getByText('Layer 2')

    await userEvent.click(layer2)
    await expect(onLayerSelectFn).toHaveBeenCalledWith('layer-2')
  },
}

const onVisibilityChangeFn = fn()
export const ToggleVisibility: Story = {
  args: {
    activeLayerId: 'layer-1',
    onLayerVisibilityChange: onVisibilityChangeFn,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const visibilityButtons = canvas.getAllByRole('button', { name: 'Hide' })

    await userEvent.click(visibilityButtons[0]!)
    await expect(onVisibilityChangeFn).toHaveBeenCalledWith('layer-3', false)
  },
}

export const SingleLayer: Story = {
  args: {
    layers: [sampleLayers[0]!],
    drawingLayerCount: 1,
    activeLayerId: 'layer-1',
  },
}

/**
 * 背景レイヤーはUI上から非表示になることを確認
 */
const layersWithBackground: readonly Layer[] = [
  {
    id: BACKGROUND_LAYER_ID,
    name: 'Background',
    type: 'background',
    isVisible: false,
    isLocked: true,
    opacity: 1,
    blendMode: 'normal',
    drawables: [],
  },
  ...sampleLayers,
]

export const WithBackgroundLayer: Story = {
  args: {
    layers: layersWithBackground,
    activeLayerId: 'layer-1',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // 描画レイヤーは表示される
    await expect(canvas.getByText('Layer 1')).toBeInTheDocument()
    await expect(canvas.getByText('Layer 2')).toBeInTheDocument()
    await expect(canvas.getByText('Layer 3')).toBeInTheDocument()

    // 背景レイヤーはUI上に表示されない
    await expect(canvas.queryByText('Background')).not.toBeInTheDocument()
  },
}

const onLayerAddFn = fn()
export const AddLayer: Story = {
  args: {
    activeLayerId: 'layer-1',
    onLayerAdd: onLayerAddFn,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const addButton = canvas.getByRole('button', { name: 'Add layer' })

    await userEvent.click(addButton)
    await expect(onLayerAddFn).toHaveBeenCalled()
  },
}

/**
 * 最後の1枚のレイヤーは削除できない
 */
export const CannotDeleteLastLayer: Story = {
  args: {
    layers: [sampleLayers[0]!],
    drawingLayerCount: 1,
    activeLayerId: 'layer-1',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const deleteButton = canvas.getByRole('button', { name: 'Delete layer' })

    // 削除ボタンは無効化されている
    await expect(deleteButton).toBeDisabled()
  },
}

const onLayerNameChangeFn = fn()
/**
 * レイヤー名をダブルクリックで編集できる
 */
export const RenameLayer: Story = {
  args: {
    activeLayerId: 'layer-1',
    onLayerNameChange: onLayerNameChangeFn,
  },
  play: async ({ canvasElement }) => {
    onLayerNameChangeFn.mockClear()
    const canvas = within(canvasElement)
    const body = within(document.body)
    const layer1Name = canvas.getByText('Layer 1')

    // ダブルクリックでダイアログを開く
    await userEvent.dblClick(layer1Name)

    // ダイアログが開かれたことを確認（ダイアログはportal経由でbodyに追加される）
    await waitFor(() => {
      expect(body.getByRole('dialog')).toBeInTheDocument()
    })
    await expect(body.getByText('Rename layer')).toBeInTheDocument()

    // 入力フィールドに新しい名前を入力
    const input = body.getByRole('textbox') as HTMLInputElement

    // inputにフォーカスが当たるまで待つ
    await waitFor(() => {
      expect(input).toHaveFocus()
    })

    // Ctrl+Aで全選択してからBackspaceで削除し、入力
    await userEvent.keyboard('{Control>}a{/Control}{Backspace}')
    await userEvent.type(input, 'New Layer Name')

    // OKボタンをクリック
    const okButton = body.getByRole('button', { name: 'OK' })
    await userEvent.click(okButton)

    // コールバックが呼ばれたことを確認
    await waitFor(() => {
      expect(onLayerNameChangeFn).toHaveBeenCalledWith('layer-1', 'New Layer Name')
    })
  },
}

const onLayerNameChangeCancelFn = fn()
/**
 * レイヤー名変更をキャンセルできる
 */
export const RenameLayerCancel: Story = {
  args: {
    activeLayerId: 'layer-1',
    onLayerNameChange: onLayerNameChangeCancelFn,
  },
  play: async ({ canvasElement }) => {
    onLayerNameChangeCancelFn.mockClear()
    const canvas = within(canvasElement)
    const body = within(document.body)
    const layer1Name = canvas.getByText('Layer 1')

    // ダブルクリックでダイアログを開く
    await userEvent.dblClick(layer1Name)

    // ダイアログが開くのを待つ
    await waitFor(() => {
      expect(body.getByRole('dialog')).toBeInTheDocument()
    })

    // 入力フィールドに新しい名前を入力（ダイアログはportal経由でbodyに追加される）
    const input = body.getByRole('textbox') as HTMLInputElement

    // inputにフォーカスが当たるまで待つ
    await waitFor(() => {
      expect(input).toHaveFocus()
    })

    // Ctrl+Aで全選択してからBackspaceで削除し、入力
    await userEvent.keyboard('{Control>}a{/Control}{Backspace}')
    await userEvent.type(input, 'New Layer Name')

    // キャンセルボタンをクリック
    const cancelButton = body.getByRole('button', { name: 'Cancel' })
    await userEvent.click(cancelButton)

    // コールバックは呼ばれていないことを確認
    await expect(onLayerNameChangeCancelFn).not.toHaveBeenCalled()
  },
}

/**
 * 長いレイヤー名は省略表示される
 */
export const LongLayerName: Story = {
  args: {
    layers: [
      {
        ...sampleLayers[0]!,
        name: 'This is a very long layer name that should be truncated with ellipsis',
      },
      sampleLayers[1]!,
      sampleLayers[2]!,
    ],
    activeLayerId: 'layer-1',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const longName = canvas.getByText(
      'This is a very long layer name that should be truncated with ellipsis'
    )

    // title属性でフルネームが表示されることを確認
    await expect(longName).toHaveAttribute(
      'title',
      'This is a very long layer name that should be truncated with ellipsis'
    )

    // truncateクラスが適用されていることを確認
    await expect(longName).toHaveClass('truncate')
  },
}

/**
 * ドラッグ可能なレイヤーパネル（ドラッグハンドルが表示される）
 */
export const Draggable: Story = {
  args: {
    activeLayerId: 'layer-1',
    onLayerMove: fn(),
  },
  play: async ({ canvasElement }) => {
    // ドラッグハンドル（GripVerticalアイコン）が表示されていることを確認
    // 3つのレイヤーがあるので、ドラッグ可能な要素が3つあるはず
    const draggableItems = canvasElement.querySelectorAll('[draggable="true"]')
    await expect(draggableItems.length).toBe(3)
  },
}

/**
 * ドラッグ無効（onLayerMoveが設定されていない場合）
 */
export const NotDraggable: Story = {
  args: {
    activeLayerId: 'layer-1',
    onLayerMove: undefined,
  },
  play: async ({ canvasElement }) => {
    // ドラッグ可能な要素がないことを確認
    const draggableItems = canvasElement.querySelectorAll('[draggable="true"]')
    await expect(draggableItems.length).toBe(0)
  },
}

/**
 * 異なるブレンドモードと透明度を持つレイヤー
 */
const layersWithBlendModes: readonly Layer[] = [
  {
    id: 'layer-1',
    name: 'Normal Layer',
    type: 'drawing',
    isVisible: true,
    isLocked: false,
    opacity: 1,
    blendMode: 'normal',
    drawables: [],
  },
  {
    id: 'layer-2',
    name: 'Multiply Layer',
    type: 'drawing',
    isVisible: true,
    isLocked: false,
    opacity: 0.8,
    blendMode: 'multiply',
    drawables: [],
  },
  {
    id: 'layer-3',
    name: 'Screen Layer',
    type: 'drawing',
    isVisible: true,
    isLocked: false,
    opacity: 0.5,
    blendMode: 'screen',
    drawables: [],
  },
]

export const WithBlendModes: Story = {
  args: {
    layers: layersWithBlendModes,
    drawingLayerCount: 3,
    activeLayerId: 'layer-2',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // 各レイヤーの透明度が表示されている
    await expect(canvas.getByText('100%')).toBeInTheDocument()
    await expect(canvas.getByText('80%')).toBeInTheDocument()
    await expect(canvas.getByText('50%')).toBeInTheDocument()

    // 合成モードのセレクトボックスが存在する
    await expect(canvas.getByRole('combobox')).toBeInTheDocument()
  },
}

const onBlendModeChangeFn = fn()
/**
 * 合成モード変更時に初回警告ダイアログが表示される
 */
export const BlendModeWarningDialog: Story = {
  args: {
    activeLayerId: 'layer-1',
    onLayerBlendModeChange: onBlendModeChangeFn,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(document.body)

    // 合成モードのセレクトボックスをクリック
    const combobox = canvas.getByRole('combobox')
    await userEvent.click(combobox)

    // 乗算を選択
    const multiplyOption = body.getByRole('option', { name: 'Multiply' })
    await userEvent.click(multiplyOption)

    // 警告ダイアログが表示される
    await expect(body.getByRole('alertdialog')).toBeInTheDocument()
    await expect(body.getByText('Blend Mode Warning')).toBeInTheDocument()
    await expect(body.getByText(/Blend modes may cause heavy browser load/)).toBeInTheDocument()

    // OKをクリック
    const okButton = body.getByRole('button', { name: 'OK' })
    await userEvent.click(okButton)

    // コールバックが呼ばれる
    await expect(onBlendModeChangeFn).toHaveBeenCalledWith('layer-1', 'multiply')
  },
}

const onBlendModeChangeCancelFn = fn()
/**
 * 合成モード警告ダイアログでキャンセルした場合は変更されない
 */
export const BlendModeWarningDialogCancel: Story = {
  args: {
    activeLayerId: 'layer-1',
    onLayerBlendModeChange: onBlendModeChangeCancelFn,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(document.body)

    // 合成モードのセレクトボックスをクリック
    const combobox = canvas.getByRole('combobox')
    await userEvent.click(combobox)

    // スクリーンを選択
    const screenOption = body.getByRole('option', { name: 'Screen' })
    await userEvent.click(screenOption)

    // 警告ダイアログが表示される
    await expect(body.getByRole('alertdialog')).toBeInTheDocument()

    // キャンセルをクリック
    const cancelButton = body.getByRole('button', { name: 'Cancel' })
    await userEvent.click(cancelButton)

    // コールバックは呼ばれない
    await expect(onBlendModeChangeCancelFn).not.toHaveBeenCalled()
  },
}

const onLayerNameEmptyFn = fn()
/**
 * 空のレイヤー名は保存できない（バリデーションエラー）
 */
export const RenameLayerEmptyValidation: Story = {
  args: {
    activeLayerId: 'layer-1',
    onLayerNameChange: onLayerNameEmptyFn,
  },
  play: async ({ canvasElement }) => {
    onLayerNameEmptyFn.mockClear()
    const canvas = within(canvasElement)
    const body = within(document.body)
    const layer1Name = canvas.getByText('Layer 1')

    // ダブルクリックでダイアログを開く
    await userEvent.dblClick(layer1Name)

    // ダイアログが開くのを待つ
    await waitFor(() => {
      expect(body.getByRole('dialog')).toBeInTheDocument()
    })

    // 入力フィールドをクリア
    const input = body.getByRole('textbox') as HTMLInputElement

    // inputにフォーカスが当たるまで待つ
    await waitFor(() => {
      expect(input).toHaveFocus()
    })

    // Ctrl+Aで全選択してからBackspaceで削除
    await userEvent.keyboard('{Control>}a{/Control}{Backspace}')

    // blurイベントを発火してバリデーションをトリガー
    fireEvent.blur(input)

    // エラーメッセージが表示される
    await waitFor(() => {
      expect(body.getByText('Please enter a layer name')).toBeInTheDocument()
    })

    // OKボタンが無効になっている
    const okButton = body.getByRole('button', { name: 'OK' })
    await expect(okButton).toBeDisabled()

    // キャンセルボタンはクリック可能
    const cancelButton = body.getByRole('button', { name: 'Cancel' })
    await userEvent.click(cancelButton)

    // コールバックは呼ばれない
    await expect(onLayerNameEmptyFn).not.toHaveBeenCalled()
  },
}

const onLayerNameTooLongFn = fn()
/**
 * 50文字を超えるレイヤー名は保存できない（バリデーションエラー）
 */
export const RenameLayerTooLongValidation: Story = {
  args: {
    activeLayerId: 'layer-1',
    onLayerNameChange: onLayerNameTooLongFn,
  },
  play: async ({ canvasElement }) => {
    onLayerNameTooLongFn.mockClear()
    const canvas = within(canvasElement)
    const body = within(document.body)
    const layer1Name = canvas.getByText('Layer 1')

    // ダブルクリックでダイアログを開く
    await userEvent.dblClick(layer1Name)

    // ダイアログが開くのを待つ
    await waitFor(() => {
      expect(body.getByRole('dialog')).toBeInTheDocument()
    })

    // 51文字の名前を入力
    const input = body.getByRole('textbox') as HTMLInputElement

    // inputにフォーカスが当たるまで待つ
    await waitFor(() => {
      expect(input).toHaveFocus()
    })

    // 51文字を直接設定（userEvent.typeは大量の文字で不安定なため）
    const longName = 'a'.repeat(51)
    fireEvent.change(input, { target: { value: longName } })

    // 入力値を確認（51文字入力されているはず）
    await waitFor(() => {
      expect(input.value.length).toBe(51)
    })

    // blurイベントを発火してバリデーションをトリガー
    fireEvent.blur(input)

    // エラーメッセージが表示される
    await waitFor(
      () => {
        expect(body.getByText('Layer name must be 50 characters or less')).toBeInTheDocument()
      },
      { timeout: 3000 }
    )

    // OKボタンが無効になっている
    const okButton = body.getByRole('button', { name: 'OK' })
    await expect(okButton).toBeDisabled()

    // キャンセルボタンはクリック可能
    const cancelButton = body.getByRole('button', { name: 'Cancel' })
    await userEvent.click(cancelButton)

    // コールバックは呼ばれない
    await expect(onLayerNameTooLongFn).not.toHaveBeenCalled()
  },
}
