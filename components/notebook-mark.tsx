import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/use-colors";

export function NotebookMark({ compact = false }: { compact?: boolean }) {
  const colors = useColors();
  return (
    <View style={[styles.wrap, compact && styles.compactWrap]}>
      <View style={[styles.book, compact && styles.compactBook]}>
        <View style={[styles.spine, { backgroundColor: colors.primary }]} />
        <View style={[styles.line, { backgroundColor: colors.border }]} />
        <View style={[styles.line, { backgroundColor: colors.border }]} />
        <View style={[styles.line, { backgroundColor: colors.border }]} />
      </View>
      {!compact && <Text style={[styles.wordmark, { color: colors.foreground }]}>دفتري</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", flexDirection: "row", gap: 9 },
  compactWrap: { gap: 0 },
  book: { width: 33, height: 38, borderRadius: 10, backgroundColor: "#F2F3FE", justifyContent: "center", gap: 4, paddingLeft: 11, overflow: "hidden" },
  compactBook: { transform: [{ scale: 0.82 }] },
  spine: { width: 4, height: 38, borderRadius: 2, position: "absolute", left: 0, top: 0 },
  line: { height: 2, width: 14, borderRadius: 2 },
  wordmark: { fontSize: 21, fontWeight: "800", writingDirection: "rtl" },
});
