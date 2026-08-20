import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { GlassSurface } from "@/components/glass-surface";
import { useColors } from "@/hooks/use-colors";
import { formatDate, getExcerpt } from "@/lib/notebook-utils";
import type { Note } from "@/types/note";

type NoteCardProps = {
  note: Note;
  query?: string;
  onPress: () => void;
};

function HighlightedText({ text, query, style }: { text: string; query?: string; style: object }) {
  const colors = useColors();
  const safeText = text || "ملاحظة بلا عنوان";
  if (!query?.trim()) return <Text style={style} numberOfLines={1}>{safeText}</Text>;
  const index = safeText.toLocaleLowerCase().indexOf(query.trim().toLocaleLowerCase());
  if (index < 0) return <Text style={style} numberOfLines={1}>{safeText}</Text>;
  const before = safeText.slice(0, index);
  const match = safeText.slice(index, index + query.trim().length);
  const after = safeText.slice(index + query.trim().length);
  return <Text style={style} numberOfLines={1}>{before}<Text style={{ backgroundColor: "#E6E8FF", color: colors.foreground }}>{match}</Text>{after}</Text>;
}

export function NoteCard({ note, query, onPress }: NoteCardProps) {
  const colors = useColors();
  const hasImage = Boolean(note.images[0]?.uri);
  const excerpt = getExcerpt(note.content) || (hasImage ? "ملاحظة تتضمن صورًا مرفقة" : "ابدأ بكتابة فكرتك هنا…");
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.pressable, pressed && styles.pressed]} accessibilityRole="button">
      <GlassSurface style={styles.card}>
        <View style={styles.topRow}>
          <View style={styles.titleArea}>
            <View style={styles.badges}>
              {note.isPinned && <MaterialIcons name="push-pin" size={15} color={colors.primary} />}
              {note.isFavorite && <MaterialIcons name="star" size={16} color="#D06B9D" />}
            </View>
            <HighlightedText text={note.title} query={query} style={[styles.title, { color: colors.foreground }]} />
          </View>
          {hasImage && <Image source={{ uri: note.images[0].uri }} style={styles.thumbnail} />}
        </View>
        <Text style={[styles.excerpt, { color: colors.muted, writingDirection: "rtl" }]} numberOfLines={2}>{excerpt}</Text>
        <View style={styles.meta}>
          <Text style={[styles.metaText, { color: colors.muted }]}>{formatDate(note.updatedAt)}</Text>
          <View style={[styles.dot, { backgroundColor: colors.border }]} />
          <Text style={[styles.metaText, { color: colors.muted }]}>{note.wordCount} كلمة</Text>
        </View>
      </GlassSurface>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: { marginBottom: 11 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.985 }] },
  card: { paddingHorizontal: 17, paddingVertical: 16 },
  topRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  titleArea: { flex: 1, minWidth: 0 },
  badges: { height: 17, flexDirection: "row", gap: 6, marginBottom: 5, justifyContent: "flex-end" },
  title: { textAlign: "right", writingDirection: "rtl", fontSize: 17, lineHeight: 23, fontWeight: "800" },
  excerpt: { textAlign: "right", fontSize: 14, lineHeight: 22, marginTop: 9 },
  thumbnail: { width: 54, height: 54, borderRadius: 14, backgroundColor: "#E9E8FF" },
  meta: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", gap: 7, marginTop: 12 },
  metaText: { fontSize: 12, writingDirection: "rtl" },
  dot: { height: 3, width: 3, borderRadius: 3 },
});
