import { createSystem, defaultConfig } from "@chakra-ui/react";

/** Единая тема маркетинга: Manrope с html, семантические цвета Maetry */
export const maetryMarketingSystem = createSystem(defaultConfig, {
  theme: {
    tokens: {
      fonts: {
        heading: {
          value:
            "var(--font-manrope), system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        },
        body: {
          value:
            "var(--font-manrope), system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        },
      },
      colors: {
        maetry: {
          ink: { value: "#13131A" },
          inkMuted: { value: "rgba(19, 19, 26, 0.72)" },
          inkSubtle: { value: "rgba(19, 19, 26, 0.58)" },
          border: { value: "rgba(19, 19, 26, 0.08)" },
          surface: { value: "#ffffff" },
          wash: { value: "#fdfdfd" },
          peach: { value: "#FFF8F3" },
          frost: { value: "#F7FAFF" },
          panel: { value: "#1D2840" },
          /** Акцент секций и номеров шагов (плоский стиль без градиентов) */
          accent: { value: "#3182CE" },
          sectionMuted: { value: "#F9F9F9" },
        },
      },
      radii: {
        marketing: { value: "2rem" },
        marketingLg: { value: "2rem" },
        marketingSm: { value: "1.375rem" },
      },
    },
    semanticTokens: {
      colors: {
        "marketing.fg": {
          value: { base: "{colors.maetry.ink}", _dark: "white" },
        },
        "marketing.fgMuted": {
          value: {
            base: "{colors.maetry.inkMuted}",
            _dark: "rgba(255,255,255,0.72)",
          },
        },
        "marketing.fgSubtle": {
          value: {
            base: "{colors.maetry.inkSubtle}",
            _dark: "rgba(255,255,255,0.58)",
          },
        },
        "marketing.border": {
          value: {
            base: "{colors.maetry.border}",
            _dark: "rgba(255,255,255,0.10)",
          },
        },
        "marketing.surface": {
          value: {
            base: "{colors.maetry.surface}",
            _dark: "rgba(255,255,255,0.06)",
          },
        },
        "marketing.peach": {
          value: {
            base: "{colors.maetry.peach}",
            _dark: "#16181f",
          },
        },
        "marketing.accent": {
          value: {
            base: "{colors.maetry.accent}",
            _dark: "{colors.maetry.accent}",
          },
        },
        "marketing.sectionMuted": {
          value: {
            base: "{colors.maetry.sectionMuted}",
            _dark: "#14161d",
          },
        },
        "marketing.cardDark": {
          value: {
            base: "{colors.maetry.ink}",
            _dark: "#1a1d26",
          },
        },
      },
    },
  },
});
