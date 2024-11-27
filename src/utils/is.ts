export const isStr = (data: any): data is string => typeof data === 'string'
export const isNum = (data: any): data is number => typeof data === 'number'
export const isBool = (data: any): data is boolean => typeof data === 'boolean'

export const isFn = (data: any): data is Function => typeof data === 'function'

/**
 * typeof data === 'object' && data !== null
 */
export const isObj = (data: any): data is object => typeof data === 'object' && data !== null
export const isArr = <T>(data: any): data is Array<T> => Array.isArray(data)

/** Object.is */
export const isSame = (a: any, b: any) => Object.is(a, b)
