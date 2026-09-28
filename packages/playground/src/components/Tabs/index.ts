import { TabsContent } from './subcomponents/TabsContent'
import { Tabs as InnerTabs } from './Tabs'

export const Tabs = Object.assign(
  InnerTabs,
  { TabsContent },
)
export type { TabItemType, TabsContentItem, TabsContentProps, TabsProps } from './types'
