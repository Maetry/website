import type { ReactNode } from 'react';

export default function BookingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg">
      {children}
    </div>
  );
}
