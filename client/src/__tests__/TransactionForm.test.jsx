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
