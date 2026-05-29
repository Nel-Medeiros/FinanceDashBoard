import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { TransactionForm } from '../components/TransactionForm'

vi.mock('../api/categories', () => ({
  addCategory: vi.fn().mockResolvedValue(['Food', 'Rent', 'Groceries'])
}))

import { addCategory } from '../api/categories'

const categories = ['Food', 'Rent']
const noop = () => {}

describe('TransactionForm — add category', () => {
  it('renders an add-category button', () => {
    render(<TransactionForm categories={categories} onSubmit={noop} onCancel={noop} />)
    expect(screen.getByLabelText('Add category')).toBeInTheDocument()
  })

  it('shows the new-category input when add button is clicked', () => {
    render(<TransactionForm categories={categories} onSubmit={noop} onCancel={noop} />)
    fireEvent.click(screen.getByLabelText('Add category'))
    expect(screen.getByPlaceholderText('New category name')).toBeInTheDocument()
  })

  it('Add button is disabled when input is empty', () => {
    render(<TransactionForm categories={categories} onSubmit={noop} onCancel={noop} />)
    fireEvent.click(screen.getByLabelText('Add category'))
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled()
  })

  it('calls addCategory and onCategoryAdded when Add is clicked', async () => {
    const onCategoryAdded = vi.fn()
    render(<TransactionForm categories={categories} onSubmit={noop} onCancel={noop} onCategoryAdded={onCategoryAdded} />)
    fireEvent.click(screen.getByLabelText('Add category'))
    fireEvent.change(screen.getByPlaceholderText('New category name'), { target: { value: 'Groceries' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add' }))
    await waitFor(() => {
      expect(addCategory).toHaveBeenCalledWith('Groceries')
      expect(onCategoryAdded).toHaveBeenCalled()
    })
  })

  it('hides the input after a successful save', async () => {
    render(<TransactionForm categories={categories} onSubmit={noop} onCancel={noop} onCategoryAdded={vi.fn()} />)
    fireEvent.click(screen.getByLabelText('Add category'))
    fireEvent.change(screen.getByPlaceholderText('New category name'), { target: { value: 'Groceries' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add' }))
    await waitFor(() => {
      expect(screen.queryByPlaceholderText('New category name')).not.toBeInTheDocument()
    })
  })

  it('submits with the new category after inline add', async () => {
    const onSubmit = vi.fn()
    // Simulate parent reload: onCategoryAdded updates categories to include Groceries
    const { rerender } = render(
      <TransactionForm categories={categories} onSubmit={onSubmit} onCancel={noop} onCategoryAdded={vi.fn()} />
    )
    fireEvent.click(screen.getByLabelText('Add category'))
    fireEvent.change(screen.getByPlaceholderText('New category name'), { target: { value: 'Groceries' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add' }))
    // Wait for handleSaveCategory to complete, then rerender with updated categories
    await waitFor(() => expect(addCategory).toHaveBeenCalledWith('Groceries'))
    rerender(
      <TransactionForm categories={[...categories, 'Groceries']} onSubmit={onSubmit} onCancel={noop} onCategoryAdded={vi.fn()} />
    )
    // Amount is required; fill it so the form can submit
    fireEvent.change(screen.getByPlaceholderText('Amount'), { target: { value: '50' } })
    fireEvent.submit(screen.getByRole('button', { name: 'Save' }).closest('form'))
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ category: 'Groceries' }))
  })

  it('shows error message when addCategory fails', async () => {
    addCategory.mockRejectedValueOnce(new Error('Network error'))
    render(<TransactionForm categories={categories} onSubmit={noop} onCancel={noop} />)
    fireEvent.click(screen.getByLabelText('Add category'))
    fireEvent.change(screen.getByPlaceholderText('New category name'), { target: { value: 'Groceries' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add' }))
    await waitFor(() => {
      expect(screen.getByText('Failed to add category. Please try again.')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('New category name')).toBeInTheDocument()
    })
  })
})
