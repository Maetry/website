"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import { detectPlatform, type PlatformInfo } from "./detectPlatform";

type PlatformProviderProps = {
  userAgent?: string;
  children: ReactNode;
};

const PlatformContext = createContext<PlatformInfo>(detectPlatform());

export const PlatformProvider = ({ userAgent, children }: PlatformProviderProps) => {
  const platformInfo = useMemo(() => detectPlatform(userAgent), [userAgent]);

  return <PlatformContext.Provider value={platformInfo}>{children}</PlatformContext.Provider>;
};

export const usePlatform = () => useContext(PlatformContext);


