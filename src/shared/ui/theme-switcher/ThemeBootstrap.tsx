"use client";

import { getThemeInitializationScript } from "./theme";

const ThemeBootstrap = () => {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: getThemeInitializationScript() }}
    />
  );
};

export default ThemeBootstrap;
