import { useEffect, useCallback, useRef } from 'react';

export interface ShortcutDefinition {
  combo: string; // e.g., 'Ctrl+1', 'Meta+1', 'Ctrl+Enter', 'Alt+L', '?', 'Escape'
  handler: (e: KeyboardEvent) => void;
  description?: string;
  category?: 'Navigation' | 'Annotation' | 'Workspace' | 'Modal';
  preventDefault?: boolean;
  disabled?: boolean;
}

export interface ShortcutOptions {
  preventDefault?: boolean;
  ignoreInputs?: boolean; // Defaults to true (ignores when user is typing in input/textarea/select)
  disabled?: boolean;
}

/**
 * Checks whether an event matches a key combo string like "Ctrl+1", "Ctrl+Enter", "Meta+Shift+E", "?", etc.
 */
export function matchesShortcut(e: KeyboardEvent, combo: string): boolean {
  const parts = combo.toLowerCase().split('+').map((p) => p.trim());
  
  const requiresCtrl = parts.includes('ctrl') || parts.includes('control');
  const requiresMeta = parts.includes('meta') || parts.includes('cmd') || parts.includes('command');
  const requiresAlt = parts.includes('alt') || parts.includes('opt') || parts.includes('option');
  const requiresShift = parts.includes('shift');

  // Handle Ctrl or Meta (Command on Mac, Ctrl on Windows/Linux)
  // If user specified 'ctrl', allow either e.ctrlKey or e.metaKey for cross-platform ease
  const hasCtrlOrMeta = requiresCtrl || requiresMeta;
  if (hasCtrlOrMeta) {
    if (!e.ctrlKey && !e.metaKey) return false;
  } else {
    // If not required, ensure neither is pressed (unless Shift or Alt is required)
    if (e.ctrlKey || e.metaKey) return false;
  }

  if (requiresAlt !== e.altKey) return false;
  if (requiresShift !== e.shiftKey) return false;

  // The actual key identifier (the last token in "Ctrl+Shift+K" is "k")
  const keyToken = parts.find((p) => !['ctrl', 'control', 'meta', 'cmd', 'command', 'alt', 'opt', 'option', 'shift'].includes(p));
  if (!keyToken) return false;

  const eventKey = e.key.toLowerCase();
  const eventCode = e.code.toLowerCase();

  // Handle special keys
  if (keyToken === 'enter') return eventKey === 'enter';
  if (keyToken === 'escape' || keyToken === 'esc') return eventKey === 'escape';
  if (keyToken === 'space') return eventKey === ' ' || eventCode === 'space';
  if (keyToken === 'delete' || keyToken === 'del') return eventKey === 'delete';
  if (keyToken === 'backspace') return eventKey === 'backspace';
  if (keyToken === '?') return e.key === '?' || (e.shiftKey && (e.key === '/' || eventCode === 'slash'));

  return eventKey === keyToken;
}

/**
 * Hook to bind a single keyboard shortcut.
 * e.g., useKeyboardShortcut('Ctrl+1', () => switchTab('vision'))
 */
export function useKeyboardShortcut(
  combo: string | string[],
  handler: (e: KeyboardEvent) => void,
  options: ShortcutOptions = {}
) {
  const { preventDefault = true, ignoreInputs = true, disabled = false } = options;
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  const combos = Array.isArray(combo) ? combo : [combo];

  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input element
      if (ignoreInputs) {
        const target = e.target as HTMLElement | null;
        if (target) {
          const tagName = target.tagName;
          const isEditable = target.isContentEditable || tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT';
          if (isEditable) {
            // Allow Escape key to blur inputs
            if (e.key === 'Escape') {
              target.blur();
            } else {
              return;
            }
          }
        }
      }

      for (const c of combos) {
        if (matchesShortcut(e, c)) {
          if (preventDefault) {
            e.preventDefault();
          }
          handlerRef.current(e);
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [combos, preventDefault, ignoreInputs, disabled]);
}

/**
 * Hook to bind a list of keyboard shortcuts simultaneously.
 */
export function useKeyboardShortcutManager(
  shortcuts: ShortcutDefinition[],
  options: ShortcutOptions = {}
) {
  const { ignoreInputs = true, disabled = false } = options;
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (ignoreInputs) {
        const target = e.target as HTMLElement | null;
        if (target) {
          const tagName = target.tagName;
          const isEditable = target.isContentEditable || tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT';
          if (isEditable && e.key !== 'Escape') {
            return;
          }
        }
      }

      for (const def of shortcutsRef.current) {
        if (def.disabled) continue;
        if (matchesShortcut(e, def.combo)) {
          if (def.preventDefault !== false) {
            e.preventDefault();
          }
          def.handler(e);
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [ignoreInputs, disabled]);
}
