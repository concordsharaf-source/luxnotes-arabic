import { useEffect } from "react";
import { useColorScheme as useSystemColorScheme } from "react-native";

import { useThemeContext } from "@/lib/theme-provider";
import { useNotebook } from "@/providers/notebook-provider";

export function NotebookThemeSync() {
  const { data, isReady } = useNotebook();
  const { setColorScheme } = useThemeContext();
  const systemScheme = useSystemColorScheme() ?? "light";

  useEffect(() => {
    if (!isReady) return;
    const setting = data.settings.themeMode;
    setColorScheme(setting === "system" ? systemScheme : setting);
  }, [data.settings.themeMode, isReady, setColorScheme, systemScheme]);

  return null;
}
