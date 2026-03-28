export type HeaderLink = {
  href: string;
  label: string;
};

export type HeaderAction = HeaderLink & {
  tone?: "primary" | "secondary";
  /** Внешний вид кнопки в шапке (secondary: с обводкой, secondaryGhost: без) */
  linkVariant?: "secondary" | "secondaryGhost";
};
