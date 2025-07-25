import { createContext, memo, useCallback, useContext, useMemo, useReducer } from 'react'
import { cn } from '@/utils'

/** 表单状态类型定义 */
interface FormState {
  values: Record<string, any>
  errors: Record<string, string>
  touched: Record<string, boolean>
  isValid: boolean
  isSubmitting: boolean
  isDirty: boolean
}

/** 表单操作类型 */
type FormAction
  = | { type: 'SET_VALUES', payload: Record<string, any> }
    | { type: 'SET_FIELD_VALUE', payload: { name: string, value: any } }
    | { type: 'SET_ERRORS', payload: Record<string, string> }
    | { type: 'SET_FIELD_ERROR', payload: { name: string, error: string } }
    | { type: 'SET_TOUCHED', payload: { name: string, touched: boolean } }
    | { type: 'SET_ALL_TOUCHED', payload: boolean }
    | { type: 'SET_SUBMITTING', payload: boolean }
    | { type: 'SET_VALID', payload: boolean }
    | { type: 'SET_DIRTY', payload: boolean }
    | { type: 'RESET_FORM', payload?: { values?: Record<string, any> } }

/** 表单上下文类型 */
export interface FormContextType {
  state: FormState
  dispatch: React.Dispatch<FormAction>
  handleSubmit: (e: React.FormEvent) => void
  setFieldValue: (name: string, value: any) => void
  setFieldError: (name: string, error: string) => void
  setFieldTouched: (name: string, touched: boolean) => void
  validateField: (name: string) => boolean
  validateForm: () => boolean
  resetForm: (values?: Record<string, any>) => void
  setValues: (values: Record<string, any>) => void
  getValues: () => Record<string, any>
  getErrors: () => Record<string, string>
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

export type FieldValidator = (value: any) => string | undefined

export interface FormProps {
  style?: React.CSSProperties
  className?: string
  initialValues?: Record<string, any>
  onSubmit?: (values: Record<string, any>, form: FormContextType) => void | Promise<void>
  onReset?: () => void
  validators?: Record<string, FieldValidator>
  children?: React.ReactNode
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
  const resetForm = useCallback((values?: Record<string, any>) => {
    dispatch({ type: 'RESET_FORM', payload: { values } })
    onReset?.()
  }, [onReset])

  /** 获取当前表单值 */
  const getValues = useCallback(() => {
    return { ...state.values }
  }, [state.values])

  /** 获取当前表单错误 */
  const getErrors = useCallback(() => {
    return { ...state.errors }
  }, [state.errors])

  /** 表单提交处理 */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
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
  }, [validateForm, onSubmit, state.values])

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
  }), [state, handleSubmit, setFieldValue, setFieldError, setFieldTouched, validateField, validateForm, resetForm, setValues, getValues, getErrors])

  return (
    <FormContext.Provider value={ contextValue }>
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
    </FormContext.Provider>
  )
})

Form.displayName = 'Form'

/** 自定义Hook：useForm */
export function useForm() {
  const context = useContext(FormContext)

  if (!context) {
    throw new Error('useForm必须在Form组件内部使用')
  }

  return context
}
