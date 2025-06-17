export interface KeepAliveProps {
  children: React.ReactNode
  active: boolean
}

export interface KeepAliveContextType {
  registerActiveEffect: (key: keyof any, effectCallback: Function) => void
  registerDeactiveEffect: (key: keyof any, effectCallback: Function) => void

  findEffect: (key?: keyof any) => {
    activeEffect: Function[]
    deactiveEffect: Function[]
  }

  delActiveEffect: (key?: keyof any) => void
  delDeactiveEffect: (key?: keyof any) => void
}
