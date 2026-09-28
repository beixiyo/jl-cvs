import { cn } from '@/utils'
import type { ChangeEvent } from 'react'
import { memo, useState } from 'react'
import { DATA_ATTR } from '../../constants/dataAttributes'
import { useFormField } from '../Form'
import { Checkmark } from './subcomponents/Checkmark'
import type { CheckboxProps } from './types'
import { getSizeValue } from './utils'

/**
 * 交互式复选框组件，基于 Checkmark 组件构建
 *
 * 支持受控和非受控两种模式：
 * - 受控模式：通过 `checked` 和 `onChange` 属性完全控制组件状态
 * - 非受控模式：通过 `defaultChecked` 属性设置初始状态，组件内部管理状态变化
 *
 * 尺寸、圆角、边框宽度都写在内联 style 上：圆角随 `size` 等比缩放，
 * 需要自定义时传 `style.borderRadius`（`className` 的 `rounded-*` 会被内联样式覆盖）
 *
 * @example
 * // 受控模式
 * <Checkbox
 *   checked={isChecked}
 *   onChange={setIsChecked}
 *   label="同意条款"
 * />
 *
 * @example
 * // 非受控模式
 * <Checkbox
 *   defaultChecked={true}
 *   onChange={(checked) => console.log('状态变化:', checked)}
 *   label="记住我"
 * />
 */
export const Checkbox = memo<CheckboxProps>((props) => {
  const {
    checked: controlledChecked,
    defaultChecked = false,
    onChange,
    disabled = false,
    className,
    style,
    size = 'md',
    /**
     * 内部打勾线条粗细
     */
    checkmarkWidth = 2,
    /**
     * 边框宽度
     */
    borderWidth,
    /**
     * 边框颜色
     */
    borderColor,
    /**
     * 选中时背景色，默认使用 token 中的按钮主色（light -> 黑，dark -> 白）
     * 借助设计 Token `--button` 实现深浅色自动切换
     */
    checkedBackgroundColor = `rgb(var(--button) / 1)`,
    uncheckedBackgroundColor = 'transparent',
    /**
     * 打勾颜色，默认使用 token 中的按钮次色（与背景形成对比）
     * 使用 `--button3` 可以在 light/dark 下得到相反的颜色
     */
    checkmarkColor = `rgb(var(--button3) / 1)`,
    label,
    labelPosition = 'right',
    labelClassName,
    indeterminate = false,
    required = false,
    name,
    animationDuration = 0.6,
    ...rest
  } = props

  /** 受控/非受控模式管理 */
  const isControlled = controlledChecked !== undefined
  const [internalChecked, setInternalChecked] = useState(defaultChecked)

  /** 使用受控值或内部状态 */
  const checked = isControlled
    ? controlledChecked
    : internalChecked

  /** 使用 useFormField 集成表单功能 */
  const {
    isInForm,
    actualValue,
    handleChangeVal,
    handleBlur,
  } = useFormField<boolean, ChangeEvent<HTMLInputElement>>({
    name,
    value: checked,
    defaultValue: false,
    onChange,
  })

  /** 使用表单值或组件自身的值 */
  const isChecked = actualValue ?? checked

  const backgroundColor = (isChecked || indeterminate)
    ? checkedBackgroundColor
    : uncheckedBackgroundColor

  const toggleChecked = (e: ChangeEvent<HTMLInputElement> | React.MouseEvent | React.KeyboardEvent) => {
    if (disabled) return
    const newChecked = !checked
    if (!isControlled) {
      setInternalChecked(newChecked)
    }
    handleChangeVal(newChecked, e as unknown as ChangeEvent<HTMLInputElement>)
    /** useFormField 非受控+非表单时不触发 onChange，需手动调用 */
    if (!isControlled && !isInForm) {
      onChange?.(newChecked, e as unknown as ChangeEvent<HTMLInputElement>)
    }
  }

  const handleClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    toggleChecked(e)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggleChecked(e)
    }
  }

  const sizeValue = getSizeValue(size)
  const innerSize = Math.round(sizeValue * 0.9)
  /** 圆角按设计基准（19px 框 → 7px）等比缩放，避免固定圆角在大尺寸下显方 */
  const cornerRadius = Math.round(sizeValue * (7 / 19))
  /** 选中后是纯色块，再压一圈描边会让边缘发灰 */
  const resolvedBorderWidth = borderWidth ?? ((isChecked || indeterminate)
    ? 0
    : 2)

  const checkboxElement = (
    <span
      role="checkbox"
      aria-checked={ indeterminate
        ? 'mixed'
        : isChecked }
      aria-disabled={ disabled }
      aria-required={ required }
      tabIndex={ disabled
        ? -1
        : 0 }
      onClick={ label
        ? undefined
        : handleClick }
      onKeyDown={ handleKeyDown }
      onBlur={ handleBlur }
      { ...rest }
      { ...{
        [DATA_ATTR.state]: indeterminate
          ? 'indeterminate'
          : isChecked
          ? 'checked'
          : 'unchecked',
        [DATA_ATTR.disabled]: disabled,
      } }
      className={ cn(
        'inline-flex items-center justify-center box-border border-solid border-text',
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : label
          ? ''
          : 'cursor-pointer',
        className,
      ) }
      style={ {
        width: sizeValue,
        height: sizeValue,
        background: backgroundColor,
        borderRadius: cornerRadius,
        borderWidth: resolvedBorderWidth,
        borderColor: borderColor || undefined,
        ...style,
      } }
    >
      <Checkmark
        size={ innerSize }
        strokeWidth={ checkmarkWidth }
        borderColor="transparent"
        backgroundColor="transparent"
        checkmarkColor={ checkmarkColor }
        show={ isChecked || indeterminate }
        indeterminate={ indeterminate }
        showCircle={ false }
        animationDuration={ animationDuration }
      />
    </span>
  )

  /** 如果有标签，则渲染带标签的组件 */
  if (label) {
    return (
      <label
        className={ cn(
          'flex items-center gap-2',
          labelPosition === 'left'
            ? 'flex-row-reverse'
            : '',
          'cursor-pointer',
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : '',
          labelClassName,
        ) }
        onClick={ toggleChecked }
      >
        { checkboxElement }
        <span
          className={ cn(
            required
              ? 'before:content-["*"] before:mr-1 before:text-red-500'
              : '',
          ) }
        >
          { label }
        </span>
      </label>
    )
  }

  return checkboxElement
})

Checkbox.displayName = 'Checkbox'
