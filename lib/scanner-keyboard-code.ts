const IGNORED_CODES = new Set([
  "ShiftLeft",
  "ShiftRight",
  "ControlLeft",
  "ControlRight",
  "AltLeft",
  "AltRight",
  "MetaLeft",
  "MetaRight",
  "CapsLock",
  "Tab",
  "Escape",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Home",
  "End",
  "PageUp",
  "PageDown",
  "Insert",
  "Delete",
  "ContextMenu",
  "NumLock",
  "ScrollLock",
  "Pause",
  "PrintScreen",
  "Enter",
  "NumpadEnter",
])

for (let i = 1; i <= 12; i += 1) {
  IGNORED_CODES.add(`F${i}`)
}

/**
 * Maps physical key codes to US QWERTY characters (layout-independent).
 * Returns null for Enter, modifiers, navigation, and unsupported keys.
 */
export function keyboardEventToUsChar(event: KeyboardEvent): string | null {
  const { code } = event

  if (IGNORED_CODES.has(code)) {
    return null
  }

  if (event.ctrlKey || event.metaKey || event.altKey) {
    return null
  }

  if (code.startsWith("Key") && code.length === 4) {
    return code.slice(3).toLowerCase()
  }

  if (code.startsWith("Digit") && code.length === 6) {
    return code.slice(5)
  }

  if (code.startsWith("Numpad") && code.length === 7) {
    const digit = code.slice(6)
    if (digit >= "0" && digit <= "9") {
      return digit
    }
  }

  switch (code) {
    case "Minus":
    case "NumpadSubtract":
      return "-"
    case "Equal":
      return "="
    case "Slash":
    case "NumpadDivide":
      return "/"
    case "Backslash":
      return "\\"
    case "Period":
    case "NumpadDecimal":
      return "."
    case "Comma":
      return ","
    case "Semicolon":
      return ";"
    case "Quote":
      return "'"
    case "BracketLeft":
      return "["
    case "BracketRight":
      return "]"
    case "Backquote":
      return event.shiftKey ? "~" : "`"
    case "NumpadAdd":
      return "+"
    case "NumpadMultiply":
      return "*"
    default:
      return null
  }
}

export function isScannerEnterKey(event: KeyboardEvent): boolean {
  return event.key === "Enter" || event.code === "Enter" || event.code === "NumpadEnter"
}
