import type { ElementType } from "react";

export type LegacyTextVariantId = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type TextSemanticVariant =
  | "display"
  | "body"
  | "eyebrow"
  | "title"
  | "accent"
  | "featureTitle"
  | "eyebrowInverse";

interface TextVariantProps {
  text: string;
  variant?: TextSemanticVariant;
  id?: number;
  className?: string;
}

type VariantConfig = {
  className: string;
  tag: ElementType;
  wrapperClassName?: string;
};

const legacyVariantMap: Record<LegacyTextVariantId, TextSemanticVariant> = {
  1: "display",
  2: "body",
  3: "eyebrow",
  4: "title",
  5: "accent",
  6: "featureTitle",
  7: "eyebrowInverse",
};

const variantConfig: Record<TextSemanticVariant, VariantConfig> = {
  display: {
    tag: "h1",
    className:
      "text-[clamp(2.5rem,6vw,4.5rem)] font-medium leading-none tracking-tight",
  },
  body: {
    tag: "p",
    className:
      "text-[clamp(0.9375rem,0.88rem+0.3vw,1rem)] font-light leading-7",
  },
  eyebrow: {
    tag: "p",
    className:
      "text-[clamp(0.875rem,0.82rem+0.25vw,1rem)] leading-6 dark:text-dark-text/40 text-lightText/40",
  },
  title: {
    tag: "h3",
    className:
      "text-[clamp(1.125rem,1rem+0.6vw,1.5rem)] font-medium leading-tight tracking-tight",
  },
  accent: {
    tag: "p",
    className:
      "text-[clamp(0.875rem,0.82rem+0.25vw,1rem)] leading-6",
    wrapperClassName: "gradient__text",
  },
  featureTitle: {
    tag: "p",
    className:
      "text-[clamp(1.375rem,1.15rem+1vw,2rem)] font-medium leading-tight tracking-tight",
  },
  eyebrowInverse: {
    tag: "p",
    className:
      "text-[clamp(0.875rem,0.82rem+0.25vw,1rem)] leading-6 text-dark-text/40 dark:text-lightText/40",
  },
};

function cx(...values: Array<string | undefined | false | null>) {
  return values.filter(Boolean).join(" ");
}

function resolveVariant(
  variant?: TextSemanticVariant,
  id?: number,
): TextSemanticVariant {
  if (variant) {
    return variant;
  }

  if (id && id in legacyVariantMap) {
    return legacyVariantMap[id as LegacyTextVariantId];
  }

  return "body";
}

const TextVariant = ({ text, variant, id, className }: TextVariantProps) => {
  const resolvedVariant = resolveVariant(variant, id);
  const config = variantConfig[resolvedVariant];
  const Tag = config.tag;

  if (config.wrapperClassName) {
    return (
      <div className={config.wrapperClassName}>
        <Tag className={cx(config.className, className)}>{text}</Tag>
      </div>
    );
  }

  return <Tag className={cx(config.className, className)}>{text}</Tag>;
};

export default TextVariant;
