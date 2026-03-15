export type HeaderLink = {
  href: string;
  label: string;
};

export type HeaderAction = HeaderLink & {
  tone?: "primary" | "secondary";
};
