import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { ManageCategoriesPanel } from '../components/ManageCategoriesPanel'

vi.mock('../api/categories', () => ({
  addCategory: vi.fn().mockResolvedValue(['Food', 'Rent', 'Transport', 'Groceries']),
}))

import { addCategory } from '../api/categories'

const categories = ['Food', 'Rent', 'Transport']

describe('ManageCategoriesPanel', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders all categories', () => {
    render(<ManageCategoriesPanel categories={categories} onDelete={vi.fn()} />)
    expect(screen.getByText('Food')).toBeInTheDocument()
    expect(screen.getByText('Rent')).toBeInTheDocument()
    expect(screen.getByText('Transport')).toBeInTheDocument()
  })

  it('calls onDelete with the category name when user confirms', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const onDelete = vi.fn()
    render(<ManageCategoriesPanel categories={categories} onDelete={onDelete} />)
    fireEvent.click(screen.getByLabelText('Delete Food'))
    expect(onDelete).toHaveBeenCalledWith('Food')
  })

  it('does not call onDelete when user cancels the confirmation', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    const onDelete = vi.fn()
    render(<ManageCategoriesPanel categories={categories} onDelete={onDelete} />)
    fireEvent.click(screen.getByLabelText('Delete Food'))
    expect(onDelete).not.toHaveBeenCalled()
  })

  it('shows the correct confirmation message', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<ManageCategoriesPanel categories={categories} onDelete={vi.fn()} />)
    fireEvent.click(screen.getByLabelText('Delete Food'))
    expect(confirmSpy).toHaveBeenCalledWith(
      'Delete "Food"? Existing transactions using this category will keep their name.'
    )
  })

  it('calls addCategory and onCategoryAdded when Add is clicked', async () => {
    const onCategoryAdded = vi.fn()
    render(<ManageCategoriesPanel categories={categories} onDelete={vi.fn()} onCategoryAdded={onCategoryAdded} />)
    fireEvent.change(screen.getByPlaceholderText('New category name'), { target: { value: 'Groceries' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add' }))
    await waitFor(() => {
      expect(addCategory).toHaveBeenCalledWith('Groceries')
      expect(onCategoryAdded).toHaveBeenCalled()
    })
  })

  it('clears the input after a successful add', async () => {
    render(<ManageCategoriesPanel categories={categories} onDelete={vi.fn()} onCategoryAdded={vi.fn()} />)
    const input = screen.getByPlaceholderText('New category name')
    fireEvent.change(input, { target: { value: 'Groceries' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(input.value).toBe(''))
  })

  it('shows error message when addCategory fails', async () => {
    addCategory.mockRejectedValueOnce(new Error('Network error'))
    render(<ManageCategoriesPanel categories={categories} onDelete={vi.fn()} />)
    fireEvent.change(screen.getByPlaceholderText('New category name'), { target: { value: 'Groceries' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(screen.getByText('Failed to add category. Please try again.')).toBeInTheDocument())
  })

  it('Add button is disabled when input is empty', () => {
    render(<ManageCategoriesPanel categories={categories} onDelete={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled()
  })
})
