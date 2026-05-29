import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { ManageCategoriesPanel } from '../components/ManageCategoriesPanel'

const categories = ['Food', 'Rent', 'Transport']

describe('ManageCategoriesPanel', () => {
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
})
