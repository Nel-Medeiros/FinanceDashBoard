import { render, screen, fireEvent } from '@testing-library/react'
import { TransactionForm } from '../components/TransactionForm'

const categories = ['Food', 'Rent']
const noop = () => {}

describe('TransactionForm', () => {
  it('renders all fields', () => {
    render(<TransactionForm categories={categories} onSubmit={noop} onCancel={noop} />)
    expect(screen.getByPlaceholderText('Amount')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Description')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('renders categories as options', () => {
    render(<TransactionForm categories={categories} onSubmit={noop} onCancel={noop} />)
    expect(screen.getByRole('option', { name: 'Food' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Rent' })).toBeInTheDocument()
  })

  it('calls onSubmit with form data including selected category', () => {
    const onSubmit = vi.fn()
    render(<TransactionForm categories={categories} onSubmit={onSubmit} onCancel={noop} />)
    fireEvent.change(screen.getByPlaceholderText('Amount'), { target: { value: '100' } })
    fireEvent.change(screen.getAllByRole('combobox')[2], { target: { value: 'Food' } })
    fireEvent.submit(screen.getByRole('button', { name: 'Save' }).closest('form'))
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ amount: 100, category: 'Food' }))
  })

  it('calls onCancel when Cancel is clicked', () => {
    const onCancel = vi.fn()
    render(<TransactionForm categories={categories} onSubmit={noop} onCancel={onCancel} />)
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalled()
  })

  it('pre-fills fields when editing an existing transaction', () => {
    const tx = { date: '2024-03-15', type: 'income', amount: 250, currency: 'EUR', category: 'Rent', description: 'March rent' }
    render(<TransactionForm initial={tx} categories={categories} onSubmit={noop} onCancel={noop} />)
    expect(screen.getByDisplayValue('March rent')).toBeInTheDocument()
    expect(screen.getByDisplayValue('250')).toBeInTheDocument()
  })
})
