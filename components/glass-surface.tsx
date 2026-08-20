import type { PropsWithChildren } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { useColors } from "@/hooks/use-colors";

type GlassSurfaceProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  accent?: "blue" | "rose" | "plain";
}>;

export function GlassSurface({ children, style, accent = "plain" }: GlassSurfaceProps) {
  const colors = useColors();
  const background = accent === "blue" ? "#EEF0FF" : accent === "rose" ? "#FCF0F7" : colors.surface;
  return (
    <View style={[styles.surface, { backgroundColor: background, borderColor: colors.border }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 24,
    shadowColor: "#1D2C54",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 3,
  },
});
