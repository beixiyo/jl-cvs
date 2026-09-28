import { useEffect, useRef, useState } from 'react'
import type { DropdownProps, DropdownSection } from '../types'
import { getDesiredExpandedSections } from '../utils'

export function useExpandedSections({
  normalizedSections,
  defaultExpanded,
  accordion,
  onExpandedChange,
}: UseExpandedSectionsParams) {
  /** 跟踪用户是否手动修改过某个 section 的状态 */
  const userModifiedRef = useRef<Set<string>>(new Set())

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    // Keep initial state consistent with the sync logic to avoid first-frame flicker.
    return getDesiredExpandedSections(normalizedSections, defaultExpanded, accordion)
  })

  useEffect(() => {
    setExpandedSections((prev) => {
      const desired = getDesiredExpandedSections(normalizedSections, defaultExpanded, accordion)
      const next: Record<string, boolean> = {}

      normalizedSections.forEach((section) => {
        const wasUserModified = userModifiedRef.current.has(section.name)
        next[section.name] = wasUserModified
          ? (prev[section.name] ?? false)
          : (desired[section.name] ?? false)
      })

      const currentSectionNames = new Set(normalizedSections.map((s) => s.name))
      userModifiedRef.current.forEach((name) => {
        if (!currentSectionNames.has(name)) {
          userModifiedRef.current.delete(name)
        }
      })

      const prevKeys = Object.keys(prev)
      const nextKeys = Object.keys(next)
      if (prevKeys.length !== nextKeys.length) {
        return next
      }

      const sameKeySet = prevKeys.every((key) => key in next) && nextKeys.every((key) => key in prev)
      if (!sameKeySet) {
        return next
      }

      const isEqual = nextKeys.every((key) => prev[key] === next[key])
      return isEqual
        ? prev
        : next
    })
  }, [normalizedSections, defaultExpanded, accordion])

  const toggleSection = (section: string) => {
    userModifiedRef.current.add(section)

    setExpandedSections((prev) => {
      let next: Record<string, boolean> = {}

      if (accordion) {
        /**
         * 在手风琴模式下，标记所有被影响的 section 为用户修改过
         * 这样可以防止 useEffect 重新打开它们
         */
        normalizedSections.forEach((s) => {
          if (s.name !== section && prev[s.name]) {
            userModifiedRef.current.add(s.name)
          }
        })

        normalizedSections.forEach((s) => {
          next[s.name] = s.name === section
            ? !prev[section]
            : false
        })
      }
      else {
        next = {
          ...prev,
          [section]: !prev[section],
        }
      }

      if (onExpandedChange) {
        const expandedNames = Object.entries(next)
          .filter(([_, expanded]) => expanded)
          .map(([name]) => name)
        onExpandedChange(expandedNames)
      }

      return next
    })
  }

  return {
    expandedSections,
    toggleSection,
  }
}

type UseExpandedSectionsParams = {
  normalizedSections: DropdownSection[]
  defaultExpanded: string[]
  accordion: boolean
  onExpandedChange: DropdownProps['onExpandedChange']
}
