import { useRef } from 'react';
import { flushSync } from 'react-dom';
import {
  extractPhoneDigits,
  formatOrgPhoneMask,
  getPhoneCaretDigitIndex,
  getPhoneSlotIndexForCaret,
  placeOrgPhoneCaret,
} from '../../lib/input-masks';

type OrgPhoneFieldProps = {
  id?: string;
  className?: string;
  value: string;
  onChange: (digits: string) => void;
};

export function OrgPhoneField({ id, className, value, onChange }: OrgPhoneFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const caretDigitRef = useRef(0);

  const digits = value.slice(0, 10);
  const isEmpty = digits.length === 0;
  const displayValue = isEmpty ? '' : formatOrgPhoneMask(digits);

  const syncCaret = (digitIndex: number) => {
    const input = inputRef.current;

    if (!input || digits.length === 0) {
      return;
    }

    const safeIndex = Math.max(0, Math.min(digitIndex, digits.length));
    caretDigitRef.current = safeIndex;
    placeOrgPhoneCaret(input, safeIndex);
  };

  const applyDigits = (nextDigits: string, nextCaretDigit: number) => {
    const normalized = nextDigits.slice(0, 10);
    const input = inputRef.current;
    const safeCaret = Math.max(0, Math.min(nextCaretDigit, normalized.length));

    flushSync(() => {
      onChange(normalized);
    });

    if (input && document.activeElement === input && normalized.length > 0) {
      caretDigitRef.current = safeCaret;
      placeOrgPhoneCaret(input, safeCaret);
    }
  };

  const rememberCaret = () => {
    const input = inputRef.current;

    if (!input || digits.length === 0) {
      caretDigitRef.current = 0;
      return;
    }

    caretDigitRef.current = getPhoneCaretDigitIndex(input);
  };

  const insertDigitAt = (slotIndex: number, digit: string) => {
    const index = Math.max(0, Math.min(slotIndex, 10));
    let nextDigits = digits;

    if (digits.length < 10) {
      nextDigits = `${digits.slice(0, index)}${digit}${digits.slice(index)}`.slice(0, 10);
    } else {
      nextDigits = `${digits.slice(0, index)}${digit}${digits.slice(index + 1)}`.slice(0, 10);
    }

    applyDigits(nextDigits, index + 1);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const selectionStart = input.selectionStart ?? 0;
    const selectionEnd = input.selectionEnd ?? selectionStart;

    if (event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    if (event.key === 'Tab' || event.key === 'Escape') {
      return;
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'Home' || event.key === 'End') {
      requestAnimationFrame(rememberCaret);
      return;
    }

    event.preventDefault();

    if (selectionStart !== selectionEnd) {
      const from = getPhoneSlotIndexForCaret(selectionStart);
      const to = getPhoneSlotIndexForCaret(selectionEnd);
      const nextDigits = `${digits.slice(0, from)}${digits.slice(to)}`;

      if (event.key === 'Backspace' || event.key === 'Delete') {
        applyDigits(nextDigits, from);
        return;
      }

      if (/^\d$/.test(event.key)) {
        const nextWithDigit = `${digits.slice(0, from)}${event.key}${digits.slice(to)}`.slice(0, 10);
        applyDigits(nextWithDigit, from + 1);
        return;
      }

      return;
    }

    const slotIndex = getPhoneSlotIndexForCaret(selectionStart);
    caretDigitRef.current = slotIndex;

    if (event.key === 'Backspace') {
      if (digits.length === 0 || slotIndex === 0) {
        syncCaret(0);
        return;
      }

      const nextDigits = `${digits.slice(0, slotIndex - 1)}${digits.slice(slotIndex)}`;
      applyDigits(nextDigits, slotIndex - 1);
      return;
    }

    if (event.key === 'Delete') {
      if (slotIndex >= digits.length) {
        syncCaret(slotIndex);
        return;
      }

      const nextDigits = `${digits.slice(0, slotIndex)}${digits.slice(slotIndex + 1)}`;
      applyDigits(nextDigits, slotIndex);
      return;
    }

    if (/^\d$/.test(event.key)) {
      insertDigitAt(slotIndex, event.key);
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();

    const pasted = extractPhoneDigits(event.clipboardData.getData('text'));
    const index = caretDigitRef.current;
    const merged = `${digits.slice(0, index)}${pasted}${digits.slice(index)}`.slice(0, 10);

    applyDigits(merged, Math.min(index + pasted.length, merged.length));
  };

  return (
    <input
      ref={inputRef}
      id={id}
      className={className}
      type="text"
      inputMode="tel"
      autoComplete="tel"
      value={displayValue}
      placeholder="+7(XXX) XXX-XX-XX"
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      onClick={rememberCaret}
      onFocus={rememberCaret}
      onSelect={rememberCaret}
      onChange={() => {
        // Ввод только через keydown/paste.
      }}
    />
  );
}
