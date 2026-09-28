/**
 * 键盘按键的类型枚举：`KeyboardEvent.key` 与 `KeyboardEvent.code` 各一份
 */

/**
 * 逻辑键名，对应 `KeyboardEvent.key`
 *
 * 受输入法、Shift 和 macOS 的 Option 影响：Option + A 得到的是 `å` 而不是 `a`
 */
export type KeyEnum =
  | (
    /** `KeyboardEvent.key` 里 Ctrl 的值是 `Control`，写 `Ctrl` 永远匹配不上 */
    | 'Control'
    | 'Shift'
    | 'Alt'
    | 'Meta'
    | 'Enter'
    | 'Escape'
    | 'Tab'
    | 'ArrowUp'
    | 'ArrowDown'
    | 'ArrowLeft'
    | 'ArrowRight'
    | 'Backspace'
    | 'Delete'
    | 'Insert'
    | 'Home'
    | 'End'
    | 'PageUp'
    | 'PageDown'
    | 'F1'
    | 'F2'
    | 'F3'
    | 'F4'
    | 'F5'
    | 'F6'
    | 'F7'
    | 'F8'
    | 'F9'
    | 'F10'
    | 'F11'
    | 'F12'
    | 'CapsLock'
    | 'NumLock'
    | 'ScrollLock'
    | 'PrintScreen'
    | 'Pause'
    | 'Break'
    | 'Clear'
    | 'ContextMenu'
    | 'Scroll'
    | 'Unidentified'
  )
  | (string & {})

/**
 * 物理键位，对应 `KeyboardEvent.code`
 *
 * 不受输入法与修饰键改写影响，带 Alt / Option 的字母组合键应该用它
 */
export type KeyCodeEnum =
  | `Key${LetterCode}`
  | `Digit${DigitCode}`
  | `Numpad${DigitCode}`
  | FunctionCode
  | (
    | 'Enter'
    | 'Escape'
    | 'Space'
    | 'Tab'
    | 'Backspace'
    | 'Delete'
    | 'Insert'
    | 'Home'
    | 'End'
    | 'PageUp'
    | 'PageDown'
    | 'ArrowUp'
    | 'ArrowDown'
    | 'ArrowLeft'
    | 'ArrowRight'
    | 'ControlLeft'
    | 'ControlRight'
    | 'ShiftLeft'
    | 'ShiftRight'
    | 'AltLeft'
    | 'AltRight'
    | 'MetaLeft'
    | 'MetaRight'
    | 'CapsLock'
    | 'Backquote'
    | 'Minus'
    | 'Equal'
    | 'BracketLeft'
    | 'BracketRight'
    | 'Backslash'
    | 'Semicolon'
    | 'Quote'
    | 'Comma'
    | 'Period'
    | 'Slash'
  )
  | (string & {})

/** 键盘事件类型 */
export type KeyEventType = 'keydown' | 'keyup'

type LetterCode =
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'G'
  | 'H'
  | 'I'
  | 'J'
  | 'K'
  | 'L'
  | 'M'
  | 'N'
  | 'O'
  | 'P'
  | 'Q'
  | 'R'
  | 'S'
  | 'T'
  | 'U'
  | 'V'
  | 'W'
  | 'X'
  | 'Y'
  | 'Z'

type DigitCode = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'

type FunctionCode = 'F1' | 'F2' | 'F3' | 'F4' | 'F5' | 'F6' | 'F7' | 'F8' | 'F9' | 'F10' | 'F11' | 'F12'
