import type { ChangeEvent } from 'react'
import { useCallback, useContext, useState } from 'react'
import { Form, FormContext, useForm } from './Form'

/**
 * 通用表单字段 hook，处理表单组件与 FormContext 的交互逻辑
 */
export function useFormField<
  V = any,
  E = ChangeEvent<HTMLElement>,
  PV = V,
>({
  name,
  value,
  error,
  errorMessage,
  onChange,
  defaultValue = '' as unknown as V,
}: UseFormFieldProps<V, E, PV>) {
  /** 连接表单上下文 */
  const formContext = useContext(FormContext)
  const isInForm = !!formContext && !!name
  const formState = isInForm
    ? formContext.state
    : null

  /** 表单状态 */
  const fieldValue = isInForm && name
    ? formState?.values[name] as V
    : undefined
  const fieldError = isInForm && name
    ? formState?.touched[name] && !!formState?.errors[name]
    : false
  const fieldErrorMessage = isInForm && name && formState?.touched[name]
    ? formState?.errors[name]
    : undefined

  /** 确定是使用表单上下文的值还是组件自己的值 */
  const actualValue = isInForm && name
    ? fieldValue
    : value
  const actualError = isInForm && name
    ? fieldError
    : error
  const actualErrorMessage = isInForm && name
    ? fieldErrorMessage
    : errorMessage

  /** 内部状态管理 */
  const [internalVal, setInternalVal] = useState<V>(defaultValue)
  const isControlMode = actualValue !== undefined
  const realValue = isControlMode
    ? actualValue
    : internalVal

  /** 处理值变更 */
  const handleChangeVal = useCallback(
    (val: V, e: E) => {
      if (isInForm && name) {
        /** 更新表单值 */
        formContext.setFieldValue(name, val)
      }
      else if (isControlMode) {
        /** 外部控制模式 */
        onChange?.(val as unknown as PV, e)
      }
      else {
        /** 内部状态 */
        setInternalVal(val)
      }

      /** 同时触发外部onChange */
      if (isInForm && onChange) {
        onChange(val as unknown as PV, e)
      }
    },
    [isControlMode, onChange, isInForm, name, formContext],
  )

  /** 处理表单字段的 blur 事件 */
  const handleBlur = useCallback(() => {
    if (isInForm && name) {
      formContext.setFieldTouched(name, true)
      formContext.validateField(name)
    }
  }, [isInForm, name, formContext])

  return {
    isInForm,
    formContext,
    actualValue: realValue,
    actualError,
    actualErrorMessage,
    isControlMode,
    handleChangeVal,
    handleBlur,
  }
}

export interface UseFormFieldProps<V = any, E = ChangeEvent<HTMLElement>, PV = V> {
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

export {
  Form,
  FormContext,
  useForm,
}
