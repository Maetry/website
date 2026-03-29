/**
 * Метрики шапки листа букинга под iOS (SF Large Title + Subheadline, отступы как у строки с leading image).
 * Маркетинг не использует.
 *
 * @see https://developer.apple.com/design/human-interface-guidelines/typography
 */
export const BOOKING_IOS_SHEET_HEADER = {
  /** Между аватаром и текстовым блоком (~12pt, как leading spacing в списках). */
  avatarToTextGap: 12,
  /** Между названием и адресом (плотная стопка, как subtitle cell). */
  titleToSubtitleGap: 4,
  /** Leading image — 56pt как крупный контакт / аватар в шапке (HIG). */
  avatarSize: 56,
  /** TextStyle largeTitle */
  titleFontSize: 34,
  titleLineHeight: 41,
  titleFontWeight: "700" as const,
  /** TextStyle subheadline */
  subtitleFontSize: 15,
  subtitleLineHeight: 20,
  initialsFontSize: 17,
} as const;
