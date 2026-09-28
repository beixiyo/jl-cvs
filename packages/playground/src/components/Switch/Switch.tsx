'use client'

import { useLatestCallback } from '@/hooks'
import { cn } from '@/utils'
import React, { memo, useId } from 'react'
import { DATA_ATTR } from '../../constants/dataAttributes'
import { useFormField } from '../Form'
import { switchSizeConfig, switchVariants, thumbVariants, trackVariants } from './styles'
import type { SwitchProps } from './types'

export const Switch = memo<SwitchProps>((props) => {
  const {
    checked,
    onChange,
    disabled = false,
    size = 'md',
    background = 'rgb(var(--brand) / 1)',
    checkedIcon,
    uncheckedIcon,
    name,
    containerClassName,
    error = false,
    errorMessage,
    icon,
    withGradient = false,
    label,
    labelClassName,
    defaultChecked = false,
    trackWidth,
    trackHeight,
    trackClassName,
    thumbWidth,
    thumbHeight,
    thumbInset,
    thumbClassName,
    ariaLabel,
    id,
    ...rest
  } = props
  /** 添加内部状态用于非受控模式 */
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked)

  /** 稳定 id，用于 label 关联与 errorMessage 的 aria-describedby */
  const generatedId = useId()
  const inputId = name ?? id ?? generatedId
  const errorId = `${inputId}-error`

  /** 判断是否为受控组件 */
  const isControlled = checked !== undefined

  /** 使用 useFormField hook 处理表单集成 */
  const {
    isInForm,
    actualValue: formChecked,
    actualError,
    actualErrorMessage,
    handleChangeVal,
    handleBlur,
  } = useFormField<boolean, React.ChangeEvent<HTMLInputElement>>({
    name,
    value: checked,
    error,
    errorMessage,
    onChange,
  })

  /** 根据是否受控选择使用的值 */
  const realChecked = isControlled
    ? formChecked
    : internalChecked
  const sizePreset = switchSizeConfig[size ?? 'md']
  const actualTrackWidth = trackWidth ?? sizePreset.trackWidth
  const actualTrackHeight = trackHeight ?? sizePreset.trackHeight
  const actualThumbWidth = thumbWidth ?? sizePreset.thumbWidth
  const actualThumbHeight = thumbHeight ?? sizePreset.thumbHeight
  const actualThumbInset = thumbInset ?? sizePreset.thumbInset
  const checkedThumbOffset = Math.max(
    actualTrackWidth - actualThumbWidth - actualThumbInset * 2,
    0,
  )
  const hasCustomSize = trackWidth !== undefined
    || trackHeight !== undefined
    || thumbWidth !== undefined
    || thumbHeight !== undefined
    || thumbInset !== undefined

  const trackStyle = {
    ...(realChecked && !withGradient
      ? { background }
      : undefined),
    ...(hasCustomSize
      ? {
        width: actualTrackWidth,
        height: actualTrackHeight,
      }
      : undefined),
  } satisfies React.CSSProperties

  const thumbStyle = {
    transform: realChecked
      ? `translateX(${checkedThumbOffset}px)`
      : 'translateX(0)',
    ...(hasCustomSize
      ? {
        top: actualThumbInset,
        left: actualThumbInset,
        width: actualThumbWidth,
        height: actualThumbHeight,
      }
      : undefined),
  } satisfies React.CSSProperties

  const handleChange = useLatestCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return

    const newChecked = event.target.checked

    if (isControlled) {
      handleChangeVal(newChecked, event)
      handleBlur()
    }
    else {
      setInternalChecked(newChecked)
      handleChangeVal(newChecked, event)
      handleBlur()
      /** useFormField 非受控+非表单时不触发 onChange，需手动调用 */
      if (!isInForm) {
        onChange?.(newChecked)
      }
    }
  })

  const stateDataProps = {
    [DATA_ATTR.state]: realChecked
      ? 'checked'
      : 'unchecked',
    [DATA_ATTR.disabled]: disabled,
    [DATA_ATTR.invalid]: Boolean(actualError),
  }

  return (
    <div
      className={ cn('flex flex-col', containerClassName) }
      { ...stateDataProps }
    >
      <div className="flex items-center">
        <label
          className={ cn(switchVariants({
            variant: disabled
              ? 'disabled'
              : 'default',
          })) }
        >
          <input
            { ...rest }
            id={ inputId }
            type="checkbox"
            role="switch"
            className="sr-only"
            checked={ realChecked }
            onChange={ handleChange }
            disabled={ disabled }
            name={ name }
            aria-label={ ariaLabel ?? rest['aria-label'] ?? (typeof label === 'string'
              ? label
              : undefined) }
            aria-checked={ realChecked }
            aria-invalid={ actualError || undefined }
            aria-describedby={ actualError && actualErrorMessage
              ? errorId
              : undefined }
            { ...stateDataProps }
          />
          <div
            { ...stateDataProps }
            className={ cn(
              trackVariants({
                size,
                checked: realChecked,
                withGradient,
              }),
              trackClassName,
            ) }
            style={ Object.keys(trackStyle).length
              ? trackStyle
              : undefined }
          >
            <div
              className={ cn(
                thumbVariants({ size, checked: realChecked }),
                thumbClassName,
              ) }
              style={ thumbStyle }
            >
              { icon && icon }
              { !icon && realChecked && checkedIcon }
              { !icon && !realChecked && uncheckedIcon }
            </div>
          </div>
        </label>
        { label && (
          <label
            htmlFor={ inputId }
            className={ cn(
              'ml-2 text-sm text-text2',
              disabled
                ? 'cursor-not-allowed opacity-50'
                : 'cursor-pointer',
              labelClassName,
            ) }
          >
            { label }
          </label>
        ) }
      </div>
      { actualError && actualErrorMessage && (
        <div id={ errorId } className="mt-1 text-sm text-systemRed">
          { actualErrorMessage }
        </div>
      ) }
    </div>
  )
})

Switch.displayName = 'Switch'
