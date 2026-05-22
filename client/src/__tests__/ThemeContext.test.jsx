import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider, useTheme } from '../context/ThemeContext'

function TestConsumer() {
  const { theme, toggleTheme } = useTheme()
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  )
}

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('defaults to light theme when localStorage is empty', () => {
    render(<ThemeProvider><TestConsumer /></ThemeProvider>)
    expect(screen.getByTestId('theme')).toHaveTextContent('light')
  })

  it('reads initial theme from localStorage', () => {
    localStorage.setItem('theme', 'dark')
    render(<ThemeProvider><TestConsumer /></ThemeProvider>)
    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
  })

  it('toggles from light to dark and adds dark class to html', () => {
    render(<ThemeProvider><TestConsumer /></ThemeProvider>)
    fireEvent.click(screen.getByText('Toggle'))
    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('persists theme to localStorage on toggle', () => {
    render(<ThemeProvider><TestConsumer /></ThemeProvider>)
    fireEvent.click(screen.getByText('Toggle'))
    expect(localStorage.getItem('theme')).toBe('dark')
  })
})
