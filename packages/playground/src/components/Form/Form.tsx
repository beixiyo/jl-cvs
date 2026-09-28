'use client'

import { useLatestCallback } from '@/hooks'
import { cn } from '@/utils'
import { createContext, memo, use, useCallback, useMemo, useReducer } from 'react'
import type { FormAction, FormContextType, FormProps, FormState } from './types'

/** 创建上下文 */
export const FormContext = createContext<FormContextType | undefined>(undefined)

/** 状态reducer */
function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_VALUES':
      return {
        ...state,
        values: { ...action.payload },
        isDirty: true,
      }

    case 'SET_FIELD_VALUE':
      return {
        ...state,
        values: {
          ...state.values,
          [action.payload.name]: action.payload.value,
        },
        isDirty: true,
      }

    case 'SET_ERRORS':
      return {
        ...state,
        errors: { ...action.payload },
        isValid: Object.keys(action.payload).length === 0,
      }

    case 'SET_FIELD_ERROR':
      const newErrors = {
        ...state.errors,
      }

      if (action.payload.error) {
        newErrors[action.payload.name] = action.payload.error
      }
      else {
        delete newErrors[action.payload.name]
      }

      return {
        ...state,
        errors: newErrors,
        isValid: Object.keys(newErrors).length === 0,
      }

    case 'SET_TOUCHED':
      return {
        ...state,
        touched: {
          ...state.touched,
          [action.payload.name]: action.payload.touched,
        },
      }

    case 'SET_ALL_TOUCHED':
      const allTouched: Record<string, boolean> = {}
      Object.keys(state.values).forEach((key) => {
        allTouched[key] = action.payload
      })
      return {
        ...state,
        touched: allTouched,
      }

    case 'SET_SUBMITTING':
      return {
        ...state,
        isSubmitting: action.payload,
      }

    case 'SET_VALID':
      return {
        ...state,
        isValid: action.payload,
      }

    case 'SET_DIRTY':
      return {
        ...state,
        isDirty: action.payload,
      }

    case 'RESET_FORM':
      return {
        ...initialState,
        values: action.payload?.values || {},
      }

    default:
      return state
  }
}

// Form组件
export const Form = memo<FormProps>((
  {
    style,
    className,
    initialValues = {},
    onSubmit,
    onReset,
    validators = {},
    children,
    ...rest
  },
) => {
  const [state, dispatch] = useReducer(formReducer, {
    ...initialState,
    values: initialValues,
  })

  /** 表单验证函数 */
  const validateField = useCallback(
    (name: string): boolean => {
      const value = state.values[name]
      const validator = validators[name]

      if (validator) {
        const error = validator(value)
        dispatch({
          type: 'SET_FIELD_ERROR',
          payload: { name, error: error || '' },
        })
        return !error
      }

      return true
    },
    [state.values, validators],
  )

  const validateForm = useCallback(() => {
    let isValid = true
    const newErrors: Record<string, string> = {}

    Object.keys(validators).forEach((fieldName) => {
      const value = state.values[fieldName]
      const validator = validators[fieldName]

      if (validator) {
        const error = validator(value)
        if (error) {
          isValid = false
          newErrors[fieldName] = error
        }
      }
    })

    dispatch({ type: 'SET_ERRORS', payload: newErrors })
    return isValid
  }, [state.values, validators])

  /** 字段值设置函数 */
  const setFieldValue = useCallback((name: string, value: any) => {
    dispatch({ type: 'SET_FIELD_VALUE', payload: { name, value } })

    /** 立即使用新值进行验证 */
    const validator = validators[name]
    if (validator) {
      const error = validator(value)
      dispatch({ type: 'SET_FIELD_ERROR', payload: { name, error: error || '' } })
    }
  }, [validators])

  /** 字段错误设置函数 */
  const setFieldError = useCallback((name: string, error: string) => {
    dispatch({ type: 'SET_FIELD_ERROR', payload: { name, error } })
  }, [])

  /** 字段触碰设置函数 */
  const setFieldTouched = useCallback((name: string, touched: boolean) => {
    dispatch({ type: 'SET_TOUCHED', payload: { name, touched } })
  }, [])

  /** 设置整个表单值 */
  const setValues = useCallback((values: Record<string, any>) => {
    dispatch({ type: 'SET_VALUES', payload: values })
  }, [])

  /** 重置表单 */
  const resetForm = useLatestCallback((values?: Record<string, any>) => {
    dispatch({ type: 'RESET_FORM', payload: { values } })
    onReset?.()
  })

  /** 获取当前表单值 */
  const getValues = useCallback(() => {
    return { ...state.values }
  }, [state.values])

  /** 获取当前表单错误 */
  const getErrors = useCallback(() => {
    return { ...state.errors }
  }, [state.errors])

  /**
   * 表单提交处理
   * 用 useLatestCallback 保证回调体始终读到最新的 state.values / onSubmit / contextValue，
   * 避免把后定义的 contextValue 捕获成陈旧快照；返回引用稳定，不会让 contextValue 反复重建
   */
  const handleSubmit = useLatestCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    dispatch({ type: 'SET_SUBMITTING', payload: true })
    dispatch({ type: 'SET_ALL_TOUCHED', payload: true })

    const isValid = validateForm()

    if (isValid && onSubmit) {
      try {
        await onSubmit(state.values, contextValue)
      }
      catch (error) {
        console.error('Submission error:', error)
      }
    }
    dispatch({ type: 'SET_SUBMITTING', payload: false })
  })

  // Context value
  const contextValue: FormContextType = useMemo(() => ({
    state,
    dispatch,
    handleSubmit,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    validateField,
    validateForm,
    resetForm,
    setValues,
    getValues,
    getErrors,
  }), [state, setFieldValue, setFieldError, setFieldTouched, validateField, validateForm, setValues, getValues, getErrors])

  return (
    <FormContext value={ contextValue }>
      <form
        onSubmit={ handleSubmit }
        onReset={ () => resetForm() }
        className={ cn(
          'FormContainer',
          className,
        ) }
        style={ style }
        { ...rest }
      >
        { children }
      </form>
    </FormContext>
  )
})

Form.displayName = 'Form'

/** 自定义Hook：useForm */
export function useForm() {
  const context = use(FormContext)

  if (!context) {
    throw new Error('useForm必须在Form组件内部使用')
  }

  return context
}

/** 初始状态 */
const initialState: FormState = {
  values: {},
  errors: {},
  touched: {},
  isValid: true,
  isSubmitting: false,
  isDirty: false,
}
