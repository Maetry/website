import type { LucideIcon } from "lucide-react";
import {
  Brush,
  Clock3,
  Droplets,
  Eye,
  FlaskConical,
  HandHeart,
  Palette,
  PenTool,
  Pin,
  ScanFace,
  Scissors,
  Sparkles,
  Tag,
  Zap,
} from "lucide-react";

import { BOOKING_UNCATEGORIZED_SERVICE_CATEGORY_ID } from "./date-utils";

/**
 * Иконки категорий услуг по коду тега API (`ServiceTags` в shared DTO).
 * Для вывода без тега / неизвестного id — запасные варианты.
 */
const TAG_ICON_MAP: Record<string, LucideIcon> = {
  barbershop: Scissors,
  nails: Sparkles,
  massage: HandHeart,
  spa: Droplets,
  cosmetology: FlaskConical,
  hairdressing: Brush,
  epilation: Zap,
  "permanent makeup": PenTool,
  permanentmakeup: PenTool,
  piercing: Pin,
  makeup: Palette,
  brows: ScanFace,
  lashes: Eye,
};

export function resolveServiceCategoryLucideIcon(categoryId: string): LucideIcon {
  if (categoryId === BOOKING_UNCATEGORIZED_SERVICE_CATEGORY_ID) {
    return Tag;
  }

  const normalized = categoryId.trim().toLowerCase().replace(/\s+/g, " ");
  const direct = TAG_ICON_MAP[normalized];
  if (direct) {
    return direct;
  }

  const compact = normalized.replace(/\s/g, "");
  return TAG_ICON_MAP[compact] ?? Clock3;
}
