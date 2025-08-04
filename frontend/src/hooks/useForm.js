import { useState, useCallback } from 'react'

export const useForm = (initialValues = {}, validationSchema = {}) => {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Validar un campo específico
  const validateField = useCallback((name, value) => {
    const rules = validationSchema[name]
    if (!rules) return ''

    for (const rule of rules) {
      const { test, message } = rule
      if (!test(value)) {
        return message
      }
    }
    return ''
  }, [validationSchema])

  // Validar todos los campos
  const validateForm = useCallback(() => {
    const newErrors = {}
    let isValid = true

    Object.keys(validationSchema).forEach(fieldName => {
      const error = validateField(fieldName, values[fieldName])
      if (error) {
        newErrors[fieldName] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }, [values, validationSchema, validateField])

  // Manejar cambios en los campos
  const handleChange = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }))
    
    // Validar el campo si ya ha sido tocado
    if (touched[name]) {
      const error = validateField(name, value)
      setErrors(prev => ({ ...prev, [name]: error }))
    }
  }, [touched, validateField])

  // Manejar blur de los campos
  const handleBlur = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }))
    const error = validateField(name, values[name])
    setErrors(prev => ({ ...prev, [name]: error }))
  }, [values, validateField])

  // Resetear el formulario
  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
  }, [initialValues])

  // Manejar envío del formulario
  const handleSubmit = useCallback(async (onSubmit) => {
    setIsSubmitting(true)
    
    // Marcar todos los campos como tocados
    const allTouched = {}
    Object.keys(validationSchema).forEach(fieldName => {
      allTouched[fieldName] = true
    })
    setTouched(allTouched)
    
    // Validar formulario
    const isValid = validateForm()
    
    if (isValid) {
      try {
        await onSubmit(values)
      } catch (error) {
        console.error('Error en submit:', error)
      }
    }
    
    setIsSubmitting(false)
  }, [values, validateForm])

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setValues,
    setErrors
  }
}

// Reglas de validación predefinidas
export const validationRules = {
  required: (message = 'Este campo es requerido') => ({
    test: (value) => value !== undefined && value !== null && value !== '',
    message
  }),
  
  email: (message = 'Email inválido') => ({
    test: (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(value)
    },
    message
  }),
  
  minLength: (length, message) => ({
    test: (value) => value && value.length >= length,
    message: message || `Debe tener al menos ${length} caracteres`
  }),
  
  maxLength: (length, message) => ({
    test: (value) => value && value.length <= length,
    message: message || `Debe tener máximo ${length} caracteres`
  }),
  
  phone: (message = 'Número de teléfono inválido') => ({
    test: (value) => {
      const phoneRegex = /^\+?[\d\s\-\(\)]+$/
      return phoneRegex.test(value)
    },
    message
  }),
  
  pattern: (regex, message) => ({
    test: (value) => regex.test(value),
    message
  })
} 