import type { ReactElement, ReactNode } from 'react'
import type { Root } from 'react-dom/client'
import { Children, isValidElement } from 'react'
import { createRoot } from 'react-dom/client'

/**
 * 获取组件 key
 */
export function getCompKey(
  component: ReactElement<any>,
  opts: GetCompKeyOpts = {},
) {
  const { defalueKey = '' } = opts
  return component.key || defalueKey
}

/**
 * 从React子节点中过滤出有效的组件元素
 *
 * @param children - 要过滤的React子节点
 * @param condition - 可选的额外过滤条件函数，接收ReactElement参数并返回布尔值
 * @returns 过滤后的有效ReactElement数组
 *
 * @example
 * // 过滤出所有有效的React元素
 * const validElements = filterValidComps(children)
 *
 * @example
 * // 过滤出类型为Button的组件
 * const buttons = filterValidComps(children, child => child.type === Button)
 */
export function filterValidComps(
  children: ReactNode,
  condition?: (child: ReactElement<any>) => boolean,
): ReactElement<any>[] {
  return Children.toArray(children)
    .filter(
      child => isValidElement(child) && (condition
        ? condition(child)
        : true),
    ) as ReactElement<any>[]
}

/**
 * 将一个 React 组件注入到当前页面，并使用 Shadow DOM 进行样式隔离。
 *
 * @param reactNode - 要渲染的 React 节点，例如 `<App />`
 * @param opts - 可选的配置项。
 * @returns 返回一个卸载函数，调用该函数可以清理所有注入的 DOM 和卸载 React 组件
 */
export function injectReactApp(
  reactNode: ReactNode,
  opts: InjectReactAppOpts = {},
) {
  const {
    styleStrOrUrl,
    container = document.createElement('div'),
    inSandbox = false,
  } = opts

  if (!document.body.contains(container)) {
    document.body.appendChild(container)
  }

  let reactRoot: Root
  let root: HTMLElement | ShadowRoot
  let rootHead: HTMLHeadElement | ShadowRoot

  if (inSandbox) {
    /** 如果已有 shadowRoot，则不再附加 */
    if (container.shadowRoot) {
      root = container.shadowRoot
    }
    else {
      root = container.attachShadow({ mode: 'open' })
    }

    rootHead = root
    const appRoot = document.createElement('div')

    root.appendChild(appRoot)
    reactRoot = createRoot(appRoot)
    reactRoot.render(reactNode)
  }
  else {
    root = container
    rootHead = document.head
    reactRoot = createRoot(root)
    reactRoot.render(reactNode)
  }

  if (styleStrOrUrl) {
    try {
      new URL(styleStrOrUrl) // 尝试解析
      const style = document.createElement('link')
      style.rel = 'stylesheet'
      style.href = styleStrOrUrl
      rootHead.appendChild(style)
    }
    catch (e) {
      /** 如果解析失败，则认为是 CSS 字符串 */
      const style = document.createElement('style')
      style.textContent = styleStrOrUrl
      rootHead.appendChild(style)
    }
  }

  return () => {
    reactRoot.unmount()
    if (document.body.contains(container)) {
      document.body.removeChild(container)
    }
  }
}

type GetCompKeyOpts = {
  defalueKey?: string
}

type InjectReactAppOpts = {
  /**
   * CSS 样式字符串或一个外部 CSS 文件的 URL
   * 用于隔离在 Shadow DOM 中
   */
  styleStrOrUrl?: string
  /**
   * 承载 React 应用的容器元素
   * 如果不提供，会自动创建一个 div 并附加到 body
   */
  container?: HTMLElement
  /**
   * 是否创建 attachShadow 在沙箱模式下运行
   * @default false
   */
  inSandbox?: boolean
}
