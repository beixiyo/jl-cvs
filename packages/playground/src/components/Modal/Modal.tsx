'use client'

import { useLatestCallback, useLatestRef, useTheme } from '@/hooks'
import { cn } from '@/utils'
import { AnimatePresence, motion } from 'motion/react'
import { forwardRef, memo, useEffect, useId, useImperativeHandle, useRef, useState } from 'react'
import { DATA_ATTR } from '../../constants/dataAttributes'
import { Z } from '../../constants/z-index'
import { KeyboardLayerHostContext } from '../../hooks/useKeyboardLayerHost'
import { CloseBtn } from '../CloseBtn'
import { Mask } from '../Mask'
import { SafePortal } from '../SafePortal'
import { DURATION, variantStyles } from './constants'
import { useModalFocus } from './hooks/useModalFocus'
import { useModalStack } from './hooks/useModalStack'
import { extendModal } from './subcomponents/extendModal'
import { Footer } from './subcomponents/Footer'
import { Header } from './subcomponents/Header'
import type { ModalProps, ModalRef, ModelType } from './types'

const InnerModal = forwardRef<ModalRef, ModalProps>((
  props,
  ref,
) => {
  const [theme] = useTheme()
  const {
    width = 400,
    height,
    minWidth = 400,
    minHeight,
    autoHeight = false,

    isOpen,
    onClose,
    onExitComplete,
    onOk,
    closeOnOk = true,

    zIndex: zIndexProp,
    titleText = 'Modal Title',
    titleAlign,
    showIcon,
    okText = 'OK',
    cancelText = 'Cancel',
    okLoading = false,
    cancelLoading = false,
    cancelButtonProps,
    okButtonProps,

    header,
    footer,

    children,
    className,
    style,
    variant = 'default',
    fixedCloseBtn,
    innerCloseBtn,

    maskClassName,
    headerClassName,
    headerStyle,

    bodyClassName,
    bodyStyle,

    footerClassName,
    footerStyle,

    clickOutsideClose = false,
    escToClose = true,
    enterToConfirm = true,
    center = true,
    bordered = theme !== 'light',
    ariaLabel,
    ariaLabelledby,
  } = props
  const variantStyle = variantStyles[variant]
  /** 是否提供了有效宽度：区分 undefined 与 0/''，决定走 style.width 还是兜底类 */
  const hasWidth = width != null && width !== ''
  /** 没有显式给高度时，默认按内容自适应 */
  const shouldAutoHeight = autoHeight || height == null
  const resolvedMinHeight = minHeight ?? (shouldAutoHeight
    ? 0
    : 182)
  const [open, setOpen] = useState(isOpen)
  /** 异步 `onOk` 在飞：确认按钮转 loading、Enter 与再次点击都不重复提交 */
  const [okPending, setOkPending] = useState(false)
  const okBusy = okLoading || okPending

  /**
   * 异步 `onOk` 落定时要用最新的宿主状态：点击那一刻的闭包可能已经过期
   * （宿主换了 `onClose`，或用户中途关掉了弹窗）
   *
   * 「还开着吗」要 prop 与内部状态同时成立：宿主从非离散事件（定时器、消息回调）翻
   * `isOpen` 时，把它同步进内部 `open` 的是 passive effect，会比这次 commit 晚一拍，
   * 只看 `open` 会在这段窗口里把已经关掉的弹窗当成还开着；而 `hide()` 只改内部 `open`，
   * 也不能只看 prop
   */
  const settleRef = useLatestRef({ open: isOpen && open, onClose, closeOnOk })

  /**
   * 确认的唯一出口，声明式与命令式共用
   *
   * 早先只有命令式包装（`extendModal`）管 loading 与自动关闭，声明式 `<Modal>` 的确认按钮
   * 就是裸 `onClick={ onOk }`：同一个 prop 两套语义，业务层每处都得自己再写一遍
   * 「await、转 loading、成功后 onClose」，漏写就是「动作跑完了、弹窗还杵着」
   *
   * 不传参调用：直接把它接到按钮 `onClick` 会把 MouseEvent 塞进第一个参数，
   * 带默认参数的 `confirmDelete(createNext = false)` 这类回调会被事件对象误当成 true
   *
   * 同步抛出的异常不拦：这里没有状态要收拾（`okPending` 还没置起来），拦下来一样是
   * 「保持打开」，只是把 `onOk` 里的编程错误吞成一条日志，让它照常冒泡到错误上报
   */
  const handleOk = useLatestCallback(() => {
    if (okBusy) return

    const settle = (result: unknown) => {
      const { open: stillOpen, onClose: latestClose, closeOnOk: shouldClose } = settleRef.current
      /** 落定前弹窗已经被关掉（异步 onOk 在飞时按了 Esc）：这次自动关闭不该再通知一遍宿主 */
      if (!stillOpen) return

      if (result !== false && shouldClose) latestClose?.()
    }

    const result = onOk?.()
    if (!isPromiseLike(result)) {
      settle(result)
      return
    }

    setOkPending(true)
    result.then(
      (value) => {
        setOkPending(false)
        settle(value)
      },
      (err) => {
        setOkPending(false)
        console.error('[Modal] onOk rejected:', err)
      },
    )
  })

  /**
   * 接入全局栈：自增 z-index、栈顶感知、仅栈顶响应 ESC
   *
   * `requestClose` 与 Esc 同一条判据：Esc 能关的，`closeAllModals` 才能替用户关
   */
  const { zIndex: autoZIndex, isTop } = useModalStack({
    open,
    zIndex: zIndexProp,
    requestClose: escToClose
      ? onClose
      : undefined,
  })
  /** 用户显式传入的 zIndex 优先；否则用栈分配的递增值，未就绪时回退到基础层级 */
  const zIndex = zIndexProp ?? autoZIndex ?? Z.modal
  const modalRef = useRef<HTMLDivElement>(null)
  const maskRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  /**
   * Enter 只在「有东西可确认」时接管：宿主给了 `onOk`，或默认页脚里渲染着确认按钮
   *
   * 早先无条件挂 `handleOk`，它对没有 `onOk` 的弹窗一样会按 `closeOnOk` 自动关闭：
   * `footer={ null }` 且自带 `<form>` 的宿主在输入框里按 Enter，事件先在这里被
   * preventDefault，浏览器的隐式提交没了，弹窗反而被当成「确认」关掉
   */
  const hasEnterConfirmTarget = !!onOk || footer === undefined
  const handleModalKeyDown = useModalFocus({
    open,
    containerRef: modalRef,
    focusScopeRef: maskRef,
    priority: zIndex,
    isTop,
    onClose,
    onOk: hasEnterConfirmTarget
      ? handleOk
      : undefined,
    escToClose,
    enterToConfirm,
    confirmDisabled: okBusy || !!okButtonProps?.disabled || !!okButtonProps?.loading,
  })
  const fixedCloseBtnConfig = typeof fixedCloseBtn === 'object'
    ? fixedCloseBtn
    : {}
  const {
    variant: fixedCloseBtnVariant,
    className: fixedCloseBtnClassName,
    size: fixedCloseBtnSize,
    ...fixedCloseBtnProps
  } = fixedCloseBtnConfig
  const innerCloseBtnConfig = typeof innerCloseBtn === 'object'
    ? innerCloseBtn
    : {}
  const {
    variant: innerCloseBtnVariant,
    className: innerCloseBtnClassName,
    size: innerCloseBtnSize,
    ...innerCloseBtnProps
  } = innerCloseBtnConfig
  const showFixedCloseBtn = !!fixedCloseBtn
  const showInnerCloseBtn = !!innerCloseBtn

  useEffect(() => {
    setOpen(isOpen)
  }, [isOpen])

  /**
   * Ref
   */
  useImperativeHandle(ref, () => ({
    hide: () => {
      setOpen(false)
    },
  }))

  const ModalContent = (
    <AnimatePresence onExitComplete={ onExitComplete }>
      { open && (
        <Mask
          ref={ maskRef }
          { ...{ [DATA_ATTR.modal.top]: isTop } }
          /** 键盘处理挂在焦点范围（遮罩）上：fixed 关闭按钮是 dialog 的兄弟节点，挂 dialog 会漏掉它 */
          onKeyDown={ handleModalKeyDown }
          style={ {
            zIndex,
            ...(!isTop
              ? { backgroundColor: 'transparent' }
              : {}),
          } }
          className={ cn(
            'fixed',
            !center && 'items-start! pt-16',
            maskClassName,
          ) }
        >
          { showFixedCloseBtn && (
            <CloseBtn
              { ...fixedCloseBtnProps }
              onClick={ onClose }
              mode="fixed"
              variant={ fixedCloseBtnVariant ?? 'filled' }
              className={ cn('z-modal right-4 top-4', fixedCloseBtnClassName) }
              size={ fixedCloseBtnSize ?? 'xl' }
            />
          ) }

          <div
            onClick={ clickOutsideClose
              ? onClose
              : undefined }
            className="fixed inset-0"
            aria-hidden="true"
          >
          </div>

          <motion.div
            ref={ modalRef }
            role="dialog"
            aria-modal="true"
            aria-label={ ariaLabelledby || (header === undefined && titleText)
              ? undefined
              : ariaLabel }
            aria-labelledby={ ariaLabelledby ?? (header === undefined && titleText
              ? titleId
              : undefined) }
            tabIndex={ -1 }
            className={ cn(
              'relative flex flex-col max-h-[90vh] rounded-[20px] bg-background text-text shadow-card',
              bordered && 'border border-border',
              shouldAutoHeight && 'h-fit',
              /** 仅在未提供有效宽度时使用兜底类，避免与下方 style.width 语义冲突（区分 undefined 与 0/''） */
              !hasWidth && 'w-[calc(100vw-2rem)] max-w-2xl',
              'mx-auto',
              variantStyle.bg,
              variantStyle.border,
            ) }
            style={ {
              ...(hasWidth
                ? { width }
                : {}),
              minWidth: `${minWidth}px`,
              minHeight: `${resolvedMinHeight}px`,
              height: shouldAutoHeight
                ? undefined
                : height,
              ...style,
            } }
            initial={ { scale: 0.5, opacity: 0 } }
            animate={ { scale: 1, opacity: 1 } }
            exit={ { scale: 0.5, opacity: 0 } }
            transition={ { duration: DURATION } }
          >
            { showInnerCloseBtn && (
              <CloseBtn
                { ...innerCloseBtnProps }
                onClick={ onClose }
                mode="absolute"
                variant={ innerCloseBtnVariant ?? 'default' }
                className={ cn('right-4 top-3 z-1', innerCloseBtnClassName) }
                size={ innerCloseBtnSize ?? 'lg' }
              />
            ) }

            <div
              className={ cn(
                shouldAutoHeight
                  ? 'flex-none flex flex-col gap-4 px-6 pb-6 pt-6'
                  : 'flex-1 min-h-0 flex flex-col gap-4 px-6 pb-6 pt-6',
                className,
              ) }
            >
              { header === null
                ? null
                : header === undefined
                ? (
                  <Header
                    variant={ variant }
                    titleText={ titleText }
                    titleAlign={ titleAlign }
                    showIcon={ showIcon }
                    titleId={ titleId }
                    header={ header }
                    headerClassName={ headerClassName }
                    headerStyle={ headerStyle }
                  />
                )
                : header }

              <div
                className={ cn(
                  `overflow-y-auto overflow-x-hidden flex-1 text-sm leading-5.5`,
                  bodyClassName,
                ) }
                style={ bodyStyle }
              >
                { children }
              </div>

              { footer === null
                ? null
                : footer === undefined
                ? (
                  <Footer
                    isOpen={ open }
                    variant={ variant }
                    onClose={ onClose }
                    onOk={ handleOk }
                    okText={ okText }
                    cancelText={ cancelText }
                    okLoading={ okBusy }
                    cancelLoading={ cancelLoading }
                    cancelButtonProps={ cancelButtonProps }
                    okButtonProps={ okButtonProps }
                    footer={ footer }
                    footerClassName={ footerClassName }
                    footerStyle={ footerStyle }
                  />
                )
                : footer }
            </div>
          </motion.div>
        </Mask>
      ) }
    </AnimatePresence>
  )

  /**
   * 把自己的键盘优先级交给上下文：弹窗里不走 Portal 的下拉 / 面板据此抬到弹窗之上，
   * 否则它们开着时按 Esc 关掉的是整个弹窗（见 `useNestedLayerPriority`）
   */
  return (
    <SafePortal>
      <KeyboardLayerHostContext.Provider value={ zIndex }>
        { ModalContent }
      </KeyboardLayerHostContext.Provider>
    </SafePortal>
  )
})

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return !!value && typeof (value as PromiseLike<unknown>).then === 'function'
}

export const Modal = memo<ModalProps>(InnerModal) as unknown as ModelType<typeof InnerModal>
Modal.displayName = 'Modal'

extendModal()
