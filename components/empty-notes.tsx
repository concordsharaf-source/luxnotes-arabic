import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { GlassSurface } from "@/components/glass-surface";
import { useColors } from "@/hooks/use-colors";

export function EmptyNotes({ title, description, cta, onPress }: { title: string; description: string; cta?: string; onPress?: () => void }) {
  const colors = useColors();
  return (
    <GlassSurface style={styles.card} accent="blue">
      <View style={[styles.icon, { backgroundColor: "#DEE2FF" }]}><MaterialIcons name="auto-stories" size={30} color={colors.primary} /></View>
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.description, { color: colors.muted }]}>{description}</Text>
      {cta && onPress && <Pressable onPress={onPress} style={({ pressed }) => [styles.button, { backgroundColor: colors.primary }, pressed && styles.pressed]}><Text style={styles.buttonText}>{cta}</Text></Pressable>}
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: "center", paddingHorizontal: 30, paddingVertical: 31, marginTop: 18 },
  icon: { width: 62, height: 62, borderRadius: 22, justifyContent: "center", alignItems: "center", marginBottom: 15 },
  title: { fontSize: 19, lineHeight: 28, fontWeight: "800", textAlign: "center", writingDirection: "rtl" },
  description: { fontSize: 14, lineHeight: 23, textAlign: "center", writingDirection: "rtl", marginTop: 7 },
  button: { marginTop: 20, borderRadius: 16, paddingVertical: 12, paddingHorizontal: 18 },
  buttonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800", writingDirection: "rtl" },
  pressed: { opacity: 0.84, transform: [{ scale: 0.98 }] },
});
