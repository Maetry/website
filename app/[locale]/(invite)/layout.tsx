import type { ReactNode } from 'react';

import { AppThemeProvider } from "@/shared/ui/theme-switcher";

export default function InviteLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AppThemeProvider>{children}</AppThemeProvider>;
}
