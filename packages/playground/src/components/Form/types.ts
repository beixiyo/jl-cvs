import type { ChangeEvent } from 'react'

/**
 * 字段校验函数，返回错误文案；返回 undefined/空串表示通过
 */
export type FieldValidator = (value: any) => string | undefined

export interface FormProps {
  /** 根 form 元素的内联样式 */
  style?: React.CSSProperties
  /** 根 form 元素的类名 */
  className?: string
  /**
   * 表单初始值
   * @default {}
   */
  initialValues?: Record<string, any>
  /** 校验通过后的提交回调，第二个参数为表单实例句柄 */
  onSubmit?: (values: Record<string, any>, form: FormContextType) => void | Promise<void>
  /** 表单重置时的回调 */
  onReset?: () => void
  /**
   * 字段校验器，key 为字段名
   * @default {}
   */
  validators?: Record<string, FieldValidator>
  children?: React.ReactNode
}

/** 表单状态类型定义 */
export interface FormState {
  values: Record<string, any>
  errors: Record<string, string>
  touched: Record<string, boolean>
  isValid: boolean
  isSubmitting: boolean
  isDirty: boolean
}

/** 表单操作类型 */
export type FormAction =
  | { type: 'SET_VALUES'; payload: Record<string, any> }
  | { type: 'SET_FIELD_VALUE'; payload: { name: string; value: any } }
  | { type: 'SET_ERRORS'; payload: Record<string, string> }
  | { type: 'SET_FIELD_ERROR'; payload: { name: string; error: string } }
  | { type: 'SET_TOUCHED'; payload: { name: string; touched: boolean } }
  | { type: 'SET_ALL_TOUCHED'; payload: boolean }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_VALID'; payload: boolean }
  | { type: 'SET_DIRTY'; payload: boolean }
  | { type: 'RESET_FORM'; payload?: { values?: Record<string, any> } }

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
export interface UseFormFieldProps<V = any, E = ChangeEvent<HTMLInputElement>, PV = V> {
  /**
   * 字段名称（用于表单）
   */
  name?: string
  /**
   * 字段值
   */
  value?: V
  /**
   * 默认值（当非受控模式时使用）
   */
  defaultValue?: V
  /**
   * 错误状态
   */
  error?: boolean
  /**
   * 错误信息
   */
  errorMessage?: string
  /**
   * 值变更时的回调函数
   */
  onChange?: (value: PV, e: E) => void
}
