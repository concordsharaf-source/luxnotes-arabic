import { useRouter } from "expo-router";
import { useMemo } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

import { EmptyNotes } from "@/components/empty-notes";
import { NoteCard } from "@/components/note-card";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { sortNotes } from "@/lib/notebook-utils";
import { useNotebook } from "@/providers/notebook-provider";

export default function FavoritesScreen() {
  const colors = useColors();
  const router = useRouter();
  const { activeNotes, data } = useNotebook();
  const favorites = useMemo(() => sortNotes(activeNotes.filter((note) => note.isFavorite), data.settings.sortOption), [activeNotes, data.settings.sortOption]);
  return <ScreenContainer className="px-5"><FlatList data={favorites} keyExtractor={(item) => item.id} renderItem={({ item }) => <NoteCard note={item} onPress={() => router.push({ pathname: "/note/[id]", params: { id: item.id } })} />} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} ListHeaderComponent={<View style={styles.header}><Text style={[styles.title, { color: colors.foreground }]}>المفضلة</Text><Text style={[styles.subtitle, { color: colors.muted }]}>كل ما اخترت الاحتفاظ به قريبًا</Text></View>} ListEmptyComponent={<EmptyNotes title="لا توجد ملاحظات مفضلة" description="اضغط النجمة من محرر الملاحظة لإضافتها هنا." />} /></ScreenContainer>;
}

const styles = StyleSheet.create({ content: { paddingBottom: 25 }, header: { alignItems: "flex-end", paddingTop: 11, paddingBottom: 24 }, title: { fontSize: 29, fontWeight: "900", writingDirection: "rtl" }, subtitle: { fontSize: 14, marginTop: 5, writingDirection: "rtl" } });
