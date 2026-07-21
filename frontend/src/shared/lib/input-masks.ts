const ORG_PHONE_DIGIT_POSITIONS = [3, 4, 5, 8, 9, 10, 12, 13, 15, 16] as const;

export function extractPhoneDigits(rawValue: string) {
  let digits = rawValue.replace(/\D/g, '');

  if (digits.startsWith('7') || digits.startsWith('8')) {
    digits = digits.slice(1);
  }

  return digits.slice(0, 10);
}

export function formatOrgPhoneMask(phoneDigits: string) {
  const maskedDigits = `${phoneDigits}${'X'.repeat(10)}`.slice(0, 10);
  const area = maskedDigits.slice(0, 3);
  const first = maskedDigits.slice(3, 6);
  const second = maskedDigits.slice(6, 8);
  const third = maskedDigits.slice(8, 10);

  return `+7(${area}) ${first}-${second}-${third}`;
}

export function getPhoneSlotIndexForCaret(caret: number) {
  const safeCaret = Math.max(0, caret);

  for (let slotIndex = 0; slotIndex < ORG_PHONE_DIGIT_POSITIONS.length; slotIndex += 1) {
    if (safeCaret <= ORG_PHONE_DIGIT_POSITIONS[slotIndex]) {
      return slotIndex;
    }
  }

  return ORG_PHONE_DIGIT_POSITIONS.length;
}

export function caretFromPhoneDigitIndex(digitIndex: number) {
  if (digitIndex <= 0) {
    return ORG_PHONE_DIGIT_POSITIONS[0];
  }

  if (digitIndex >= ORG_PHONE_DIGIT_POSITIONS.length) {
    return ORG_PHONE_DIGIT_POSITIONS[ORG_PHONE_DIGIT_POSITIONS.length - 1] + 1;
  }

  return ORG_PHONE_DIGIT_POSITIONS[digitIndex];
}

export function placeOrgPhoneCaret(input: HTMLInputElement, digitIndex: number) {
  const nextCaret = caretFromPhoneDigitIndex(digitIndex);
  input.setSelectionRange(nextCaret, nextCaret);
}

export function getPhoneCaretDigitIndex(input: HTMLInputElement) {
  const caret = input.selectionStart ?? 0;

  return getPhoneSlotIndexForCaret(caret);
}

export function sanitizeDigitPart(value: string, maxLength: number) {
  return value.replace(/\D/g, '').slice(0, maxLength);
}
