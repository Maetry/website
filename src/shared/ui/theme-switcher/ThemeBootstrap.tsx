"use client";

import { useEffect } from "react";

import { useTheme } from "next-themes";

import { setTheme } from "@/entities/theme";
import { useAppDispatch } from "@/lib/hooks";

/** Синхронизация Redux с resolved-темой next-themes (источник — класс на html) */
const ThemeBootstrap = () => {
  const dispatch = useAppDispatch();
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!resolvedTheme) {
      return;
    }
    dispatch(setTheme(resolvedTheme === "dark"));
  }, [resolvedTheme, dispatch]);

  return null;
};

export default ThemeBootstrap;
