import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Input from '../Input'

describe('Input Component', () => {
  it('renders correctly with label', () => {
    render(<Input label="Email" placeholder="Enter email" />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/enter email/i)).toBeInTheDocument()
  })

  it('shows error message when error prop is provided', () => {
    render(<Input label="Email" error="Email is required" />)
    expect(screen.getByText(/email is required/i)).toBeInTheDocument()
    expect(screen.getByText(/email is required/i)).toHaveClass('text-red-600')
  })

  it('shows success message when success prop is provided', () => {
    render(<Input label="Email" success="Email is valid" />)
    expect(screen.getByText(/email is valid/i)).toBeInTheDocument()
    expect(screen.getByText(/email is valid/i)).toHaveClass('text-green-600')
  })

  it('shows helper text when helperText prop is provided', () => {
    render(<Input label="Email" helperText="We'll never share your email" />)
    expect(screen.getByText(/we'll never share your email/i)).toBeInTheDocument()
    expect(screen.getByText(/we'll never share your email/i)).toHaveClass('text-gray-500')
  })

  it('handles focus and blur events', () => {
    const onFocus = jest.fn()
    const onBlur = jest.fn()
    
    render(<Input label="Email" onFocus={onFocus} onBlur={onBlur} />)
    const input = screen.getByLabelText(/email/i)
    
    fireEvent.focus(input)
    expect(onFocus).toHaveBeenCalledTimes(1)
    
    fireEvent.blur(input)
    expect(onBlur).toHaveBeenCalledTimes(1)
  })

  it('handles change events', () => {
    const onChange = jest.fn()
    render(<Input label="Email" onChange={onChange} />)
    
    const input = screen.getByLabelText(/email/i)
    fireEvent.change(input, { target: { value: 'test@example.com' } })
    
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(input.value).toBe('test@example.com')
  })

  it('applies error styles when error is present', () => {
    render(<Input label="Email" error="Invalid email" />)
    const input = screen.getByLabelText(/email/i)
    expect(input).toHaveClass('border-red-300')
  })

  it('applies success styles when success is present', () => {
    render(<Input label="Email" success="Valid email" />)
    const input = screen.getByLabelText(/email/i)
    expect(input).toHaveClass('border-green-300')
  })

  it('renders with left icon', () => {
    const leftIcon = <span data-testid="left-icon">📧</span>
    render(<Input label="Email" leftIcon={leftIcon} />)
    expect(screen.getByTestId('left-icon')).toBeInTheDocument()
  })

  it('renders with right icon', () => {
    const rightIcon = <span data-testid="right-icon">✓</span>
    render(<Input label="Email" rightIcon={rightIcon} />)
    expect(screen.getByTestId('right-icon')).toBeInTheDocument()
  })
}) 