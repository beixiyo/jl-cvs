import type { ChangeEvent, ClipboardEvent as ReactClipboardEvent } from 'react'
import type { TextareaCounterProps } from './TextareaCounter'
import { forwardRef, memo, useCallback, useMemo, useRef, useState } from 'react'
import TurndownService from 'turndown'
import { cn } from '@/utils'
import { TextareaProvider } from './TextareaContext'
import { TextareaCounter } from './TextareaCounter'

/**
 * 初始化 Turndown 服务实例
 * 你可以根据需要配置 Turndown
 */
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
  bulletListMarker: '-',
})

const InnerTextarea = forwardRef<HTMLTextAreaElement, TextareaProps>((props, ref) => {
  const {
    children,
    placeholder,
    disabled = false,
    readOnly = false,

    autoResize = false,
    maxLength,
    showCount = false,
    error = false,
    errorMessage,
    required = false,
    className,
    focusedClassName,
    containerClassName,
    size = 'md',
    enableRichPaste = false,

    onChange,
    onFocus,
    onBlur,
    onKeyDown,
    onKeyUp,
    onPaste,
    onPressEnter,

    label,
    labelPosition = 'top',
    value,

    /** 计数器属性 */
    counterPosition,
    counterFormat,

    ...rest
  } = props

  const textareaRef = useRef<HTMLTextAreaElement | null>()
  const [isFocused, setIsFocused] = useState(false)

  const [internalVal, setInternalVal] = useState('')
  const isControlMode = value !== undefined
  const realValue = isControlMode
    ? value
    : internalVal
  const handleChangeVal = useCallback(
    (val: string, e: ChangeEvent<HTMLTextAreaElement>) => {
      isControlMode
        ? onChange?.(val, e)
        : setInternalVal(val)
    },
    [isControlMode, onChange],
  )

  /** 调整高度的函数 */
  const adjustHeight = useCallback(() => {
    const currentTextarea = textareaRef.current
    if (!currentTextarea || !autoResize) // 仅在 autoResize 为 true 时调整
      return

    /** 先重置高度以获取正确的 scrollHeight */
    currentTextarea.style.height = 'auto'
    const newHeight = currentTextarea.scrollHeight
    currentTextarea.style.height = `${newHeight}px`
  }, [autoResize])

  /** 处理输入变化 (由用户输入或程序化粘贴触发) */
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value.slice(0, maxLength)
      e.target.value = value
      handleChangeVal?.(value, e)

      if (autoResize) {
        /** 使用 requestAnimationFrame 确保在 DOM 更新后（特别是值更新后）计算 scrollHeight */
        requestAnimationFrame(() => adjustHeight())
      }
    },
    [adjustHeight, autoResize, handleChangeVal, maxLength],
  )

  /** 处理粘贴事件 */
  const handlePaste = useCallback(
    (e: ReactClipboardEvent<HTMLTextAreaElement>) => {
      onPaste?.(e)

      if (enableRichPaste && !disabled && !readOnly) {
        const clipboardData = e.clipboardData
        const types = clipboardData.types

        let pastedText = ''

        if (types.includes('text/html')) {
          e.preventDefault() // 阻止默认的纯文本粘贴行为
          const htmlContent = clipboardData.getData('text/html')
          try {
            pastedText = turndownService.turndown(htmlContent)
          }
          catch (err) {
            console.error('Error converting HTML to Markdown:', err)
            pastedText = clipboardData.getData('text/plain') // 转换失败则回退到纯文本
          }
        }
        else if (types.includes('text/plain')) {
          /**
           * 如果没有 HTML，但有纯文本，也阻止默认行为，以便统一处理光标和 onChange
           * 如果不阻止，纯文本会由浏览器自行粘贴，可能不会触发我们的 handleChange
           * 或者说，触发的 onChange 事件对象是浏览器原生的，而我们可能想构造自己的。
           * 为简单起见，如果是纯文本且未被阻止，则让浏览器处理，然后 handleChange 会捕获它。
           * 但为了统一控制插入逻辑和光标位置，最好总是 e.preventDefault() 并手动处理。
           */
          e.preventDefault()
          pastedText = clipboardData.getData('text/plain')
        }
        else {
          /** 没有可处理的文本类型，直接返回，不阻止默认行为（如果有的话） */
          return
        }

        if (pastedText && textareaRef.current) {
          const ta = textareaRef.current
          const start = ta.selectionStart
          const end = ta.selectionEnd

          /** 构建新的文本值 */
          const newTextValue = ta.value.slice(0, start) + pastedText + ta.value.slice(end)

          /**
           * 创建一个模拟的 ChangeEvent 来调用 handleChange
           * 这样可以复用 handleChange 中的逻辑（如状态更新、外部 onChange 调用、自动调整高度）
           */
          const syntheticEvent = {
            target: { ...ta, value: newTextValue }, // 关键：value 是新值
            currentTarget: { ...ta, value: newTextValue },
            bubbles: true, // 通常 change 事件会冒泡
            cancelable: false,
            /** 可以从原始粘贴事件中复制一些属性 */
            timeStamp: e.timeStamp,
            type: 'change', // 伪装成 change 事件
            nativeEvent: e.nativeEvent, // 可以传递原始的 nativeEvent
            preventDefault: () => e.preventDefault(), // 传递控制权
            isDefaultPrevented: () => e.defaultPrevented,
            stopPropagation: () => e.stopPropagation(),
            isPropagationStopped: () => e.isPropagationStopped,
            persist: () => { }, // React SyntheticEvent specific
          } as unknown as ChangeEvent<HTMLTextAreaElement>

          handleChange(syntheticEvent)

          /**
           * 更新光标位置到粘贴内容的末尾
           * 需要在 React 更新 DOM 之后执行
           */
          requestAnimationFrame(() => {
            if (textareaRef.current) {
              const newCursorPosition = start + pastedText.length
              textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition)
            }
          })
        }
      }
      /** 如果 enableRichPaste 为 false，则不执行任何操作，允许默认粘贴行为 */
    },
    [disabled, enableRichPaste, handleChange, onPaste, readOnly],
  )

  /** 处理聚焦 */
  const handleFocus = useCallback(
    (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(true)
      onFocus?.(e)
    },
    [onFocus],
  )

  /** 处理失焦 */
  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(false)
      onBlur?.(e)
    },
    [onBlur],
  )

  /** 处理按键 */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      onKeyDown?.(e)
      if (e.key === 'Enter' && onPressEnter) {
        onPressEnter(e)
      }
    },
    [onKeyDown, onPressEnter],
  )

  /** 尺寸样式映射 */
  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-base',
    lg: 'px-4 py-3 text-lg',
  }

  /** 组合所有样式 */
  const textareaClasses = cn(
    'w-full h-full border transition-all duration-200 ease-in-out outline-none',
    'resize-none dark:bg-slate-900 dark:text-slate-300 rounded-xl',
    autoResize && 'overflow-y-hidden',
    sizeClasses[size],
    {
      'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900': !error && !disabled,
      'border-rose-500 hover:border-rose-600 focus-within:border-rose-500': error && !disabled,
      'border-slate-200 bg-slate-50 dark:bg-slate-800 text-slate-400 cursor-not-allowed': disabled,
      '': isFocused && !error && !disabled,
      'hover:border-slate-400 dark:hover:border-slate-600': !isFocused && !error && !disabled,

      [focusedClassName || '']: isFocused,
    },
    className,
  )

  /** 上下文值 */
  const contextValue = useMemo(() => ({
    disabled,
    required,
    error,
    errorMessage,
    isFocused,
    value: realValue || '',
    maxLength,
  }), [disabled, error, errorMessage, isFocused, maxLength, realValue, required])

  return (
    <TextareaProvider value={ contextValue }>
      <div className={ cn(
        'flex h-full',
        {
          'flex-col gap-1': labelPosition === 'top', // 仅当label在顶部时应用gap
          'flex-row items-start gap-2': labelPosition === 'left', // label在左侧时应用不同的gap和对齐
        },
        /** 如果没有label，但有counter，也需要一个布局 */
        (showCount && !label) && labelPosition === 'top'
          ? 'flex-col'
          : '',
        containerClassName,
      ) }>
        {/* Label (假设你有Label组件或直接渲染) */ }
        { label && (
          <label
            htmlFor={ rest.id }
            className={ cn(
              'block text-sm font-medium text-slate-700 dark:text-slate-300',
              labelPosition === 'top'
                ? 'mb-1'
                : 'mr-2 pt-px', // 根据位置调整边距
              /** 确保 pt-px 或类似值使 label 与 textarea 对齐（当 size 不同时） */
            ) }
          >
            { label }
            { required && <span className="ml-1 text-rose-500">*</span> }
          </label>
        ) }

        <div className={ cn(
          'relative w-full h-full',
          label && labelPosition === 'left'
            ? 'flex-1'
            : '', // 如果label在左边，textarea部分占剩余空间
        ) }>
          <textarea
            ref={ (node) => {
              if (typeof ref === 'function') {
                ref(node)
              }
              else if (ref) {
                ref.current = node
              }
              textareaRef.current = node
            } }
            value={ realValue }
            onChange={ handleChange }
            onFocus={ handleFocus }
            onBlur={ handleBlur }
            onKeyDown={ handleKeyDown }
            onKeyUp={ onKeyUp }
            onPaste={ handlePaste }
            placeholder={ placeholder }
            disabled={ disabled }
            readOnly={ readOnly }
            maxLength={ maxLength }
            className={ textareaClasses }
            aria-invalid={ error }
            aria-errormessage={ error && errorMessage
              ? `${rest.id}-error`
              : undefined }
            aria-required={ required }
            { ...rest }
          />

          { children }

          { showCount && <TextareaCounter
            format={ counterFormat }
            position={ counterPosition }
          /> }

          {/* 错误信息 */ }
          { error && errorMessage && (
            <div
              id={ `${rest.id}-error` }
              className="mt-1 text-sm text-rose-500"
            >
              { errorMessage }
            </div>
          ) }
        </div>
      </div>
    </TextareaProvider>
  )
})

export const Textarea = memo(InnerTextarea) as typeof InnerTextarea

export type TextareaProps
  = Omit<React.PropsWithChildren<React.TextareaHTMLAttributes<HTMLTextAreaElement>>, 'onPaste' | 'onChange' | 'value'>
    & {
    /**
     * 占位文本
     */
      placeholder?: string
      /**
       * 是否禁用
       * @default false
       */
      disabled?: boolean
      /**
       * 是否为只读
       * @default false
       */
      readOnly?: boolean
      /**
       * 是否自动调整高度
       * @default false
       */
      autoResize?: boolean
      /**
       * 最大字符数
       */
      maxLength?: number
      /**
       * 是否显示字符计数
       * @default false
       */
      showCount?: boolean
      /**
       * 错误状态
       * @default false
       */
      error?: boolean
      /**
       * 错误信息
       */
      errorMessage?: string
      /**
       * 是否必填
       * @default false
       */
      required?: boolean
      /**
       * 类名
       */
      focusedClassName?: string
      /**
       * 容器类名
       */
      containerClassName?: string
      /**
       * 尺寸
       * @default 'md'
       */
      size?: 'sm' | 'md' | 'lg'
      value?: string
      /**
       * 输入内容变化时的回调
       */
      onChange?: (value: string, e: ChangeEvent<HTMLTextAreaElement>) => void
      /**
       * 聚焦时的回调
       */
      onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void
      /**
       * 失焦时的回调
       */
      onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void
      /**
       * 按下键盘时的回调
       */
      onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
      /**
       * 按键释放时的回调
       */
      onKeyUp?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
      /**
       * 按下回车键时的回调
       */
      onPressEnter?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
      /**
       * 粘贴事件回调
       * 如果启用了 enableRichPaste，此回调会在富文本处理逻辑之后被调用。
       * 事件对象的 preventDefault 可能已经被调用。
       */
      onPaste?: (e: ReactClipboardEvent<HTMLTextAreaElement>) => void
      /**
       * 标签文本
       */
      label?: string
      /**
       * 标签位置
       * @default 'top'
       */
      labelPosition?: 'top' | 'left'
      /**
       * 是否启用富文本粘贴功能 (将粘贴的 HTML 转换为 Markdown)
       * @default false
       */
      enableRichPaste?: boolean
      /**
       * 计数器位置。'left'/'right' 控制 TextareaCounter 内部的 text-align
       * @default 'right'
       */
      counterPosition?: TextareaCounterProps['position']
      /**
       * 格式化计数器文本
       */
      counterFormat?: TextareaCounterProps['format']
    }

Textarea.displayName = 'Textarea'
