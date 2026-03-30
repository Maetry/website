"use client";

import type { ComponentProps } from "react";

import dynamic from "next/dynamic";

const VisitView = dynamic(() => import("./VisitView"), {
  loading: () => <div style={{ minHeight: "100dvh", width: "100%" }} />,
  ssr: false,
});

export function VisitViewIsland(props: ComponentProps<typeof VisitView>) {
  return <VisitView {...props} />;
}
