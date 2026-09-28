import type { ChangeEvent } from 'react'
import { use, useCallback, useState } from 'react'
import { FormContext } from '../Form'
import type { UseFormFieldProps } from '../types'

/**
 * 通用表单字段 hook，处理表单组件与 FormContext 的交互逻辑
 *
 * @param props 组件相关参数
 * @returns 返回表单字段状态和处理函数
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
  const formContext = use(FormContext)
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
        onChange?.(val as unknown as PV, e)
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
