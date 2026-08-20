import { Children, type PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";

import { useColors } from "@/hooks/use-colors";

export function LinedPaper({ children }: PropsWithChildren) {
  const colors = useColors();
  return (
    <View style={[styles.paper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View pointerEvents="none" style={styles.lines}>
        {Array.from({ length: 42 }).map((_, index) => <View key={index} style={[styles.line, { backgroundColor: colors.border }]} />)}
      </View>
      <View style={styles.content}>{Children.toArray(children)}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  paper: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 26, overflow: "hidden", minHeight: 490, shadowColor: "#1D2C54", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.06, shadowRadius: 20, elevation: 2 },
  lines: { ...StyleSheet.absoluteFillObject, paddingTop: 66, gap: 29 },
  line: { height: StyleSheet.hairlineWidth, opacity: 0.78 },
  content: { paddingHorizontal: 21, paddingVertical: 23, minHeight: 490 },
});
