import { renderHook, act } from '@testing-library/react'
import { useForm, validationRules } from '../useForm'

describe('useForm Hook', () => {
  const initialValues = {
    email: '',
    password: '',
    name: ''
  }

  const validationSchema = {
    email: [validationRules.required(), validationRules.email()],
    password: [validationRules.required(), validationRules.minLength(6)],
    name: [validationRules.required()]
  }

  it('initializes with provided values', () => {
    const { result } = renderHook(() => useForm(initialValues, validationSchema))
    
    expect(result.current.values).toEqual(initialValues)
    expect(result.current.errors).toEqual({})
    expect(result.current.touched).toEqual({})
    expect(result.current.isSubmitting).toBe(false)
  })

  it('handles field changes', () => {
    const { result } = renderHook(() => useForm(initialValues, validationSchema))
    
    act(() => {
      result.current.handleChange('email', 'test@example.com')
    })
    
    expect(result.current.values.email).toBe('test@example.com')
  })

  it('validates fields on blur', () => {
    const { result } = renderHook(() => useForm(initialValues, validationSchema))
    
    act(() => {
      result.current.handleBlur('email')
    })
    
    expect(result.current.touched.email).toBe(true)
    expect(result.current.errors.email).toBe('Este campo es requerido')
  })

  it('validates fields when touched and changed', () => {
    const { result } = renderHook(() => useForm(initialValues, validationSchema))
    
    // First blur to mark as touched
    act(() => {
      result.current.handleBlur('email')
    })
    
    // Then change to trigger validation
    act(() => {
      result.current.handleChange('email', 'invalid-email')
    })
    
    expect(result.current.errors.email).toBe('Email inválido')
  })

  it('resets form to initial values', () => {
    const { result } = renderHook(() => useForm(initialValues, validationSchema))
    
    // Change some values
    act(() => {
      result.current.handleChange('email', 'test@example.com')
      result.current.handleBlur('email')
    })
    
    // Reset
    act(() => {
      result.current.reset()
    })
    
    expect(result.current.values).toEqual(initialValues)
    expect(result.current.errors).toEqual({})
    expect(result.current.touched).toEqual({})
  })

  it('handles form submission with valid data', async () => {
    const onSubmit = jest.fn()
    const { result } = renderHook(() => useForm(initialValues, validationSchema))
    
    // Set valid values
    act(() => {
      result.current.setValues({
        email: 'test@example.com',
        password: 'password123',
        name: 'John Doe'
      })
    })
    
    await act(async () => {
      await result.current.handleSubmit(onSubmit)
    })
    
    expect(onSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      name: 'John Doe'
    })
  })

  it('prevents submission with invalid data', async () => {
    const onSubmit = jest.fn()
    const { result } = renderHook(() => useForm(initialValues, validationSchema))
    
    await act(async () => {
      await result.current.handleSubmit(onSubmit)
    })
    
    expect(onSubmit).not.toHaveBeenCalled()
    expect(result.current.errors).not.toEqual({})
  })

  it('sets isSubmitting state correctly', async () => {
    const onSubmit = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)))
    const { result } = renderHook(() => useForm(initialValues, validationSchema))
    
    // Set valid values
    act(() => {
      result.current.setValues({
        email: 'test@example.com',
        password: 'password123',
        name: 'John Doe'
      })
    })
    
    const submitPromise = act(async () => {
      await result.current.handleSubmit(onSubmit)
    })
    
    // Check that isSubmitting is true during submission
    expect(result.current.isSubmitting).toBe(true)
    
    await submitPromise
    
    // Check that isSubmitting is false after submission
    expect(result.current.isSubmitting).toBe(false)
  })
})

describe('validationRules', () => {
  describe('required', () => {
    it('validates required fields correctly', () => {
      const rule = validationRules.required('Campo requerido')
      
      expect(rule.test('')).toBe(false)
      expect(rule.test(null)).toBe(false)
      expect(rule.test(undefined)).toBe(false)
      expect(rule.test('value')).toBe(true)
    })
  })

  describe('email', () => {
    it('validates email format correctly', () => {
      const rule = validationRules.email('Email inválido')
      
      expect(rule.test('test@example.com')).toBe(true)
      expect(rule.test('invalid-email')).toBe(false)
      expect(rule.test('test@')).toBe(false)
      expect(rule.test('@example.com')).toBe(false)
    })
  })

  describe('minLength', () => {
    it('validates minimum length correctly', () => {
      const rule = validationRules.minLength(6, 'Mínimo 6 caracteres')
      
      expect(rule.test('123456')).toBe(true)
      expect(rule.test('12345')).toBe(false)
      expect(rule.test('')).toBe(false)
    })
  })

  describe('maxLength', () => {
    it('validates maximum length correctly', () => {
      const rule = validationRules.maxLength(10, 'Máximo 10 caracteres')
      
      expect(rule.test('1234567890')).toBe(true)
      expect(rule.test('12345678901')).toBe(false)
      expect(rule.test('123')).toBe(true)
    })
  })
}) 