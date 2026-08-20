import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { EmptyNotes } from "@/components/empty-notes";
import { NoteCard } from "@/components/note-card";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { sortNotes } from "@/lib/notebook-utils";
import { useNotebook } from "@/providers/notebook-provider";

export default function FolderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useColors();
  const { data, activeNotes, createNote } = useNotebook();
  const folder = data.folders.find((item) => item.id === id);
  const notes = useMemo(() => sortNotes(activeNotes.filter((item) => item.folderId === id), data.settings.sortOption), [activeNotes, data.settings.sortOption, id]);
  const addNote = async () => { const note = await createNote({ folderId: id }); router.replace({ pathname: "/note/[id]", params: { id: note.id } }); };
  if (!folder) return <ScreenContainer className="p-5"><EmptyNotes title="لم نعثر على هذا المجلد" description="قد يكون قد حُذف أو نُقل." cta="العودة إلى المجلدات" onPress={() => router.replace("/(tabs)/folders")} /></ScreenContainer>;
  return <ScreenContainer className="px-5"><FlatList data={notes} keyExtractor={(item) => item.id} renderItem={({ item }) => <NoteCard note={item} onPress={() => router.push({ pathname: "/note/[id]", params: { id: item.id } })} />} contentContainerStyle={styles.content} ListHeaderComponent={<View style={styles.header}><Pressable onPress={() => router.back()} style={({ pressed }) => [styles.back, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}><MaterialIcons name="arrow-forward" size={22} color={colors.foreground} /></Pressable><View style={styles.heading}><View style={[styles.icon, { backgroundColor: `${folder.color}22` }]}><MaterialIcons name="folder" size={24} color={folder.color} /></View><Text style={[styles.title, { color: colors.foreground }]}>{folder.name}</Text></View></View>} ListEmptyComponent={<EmptyNotes title="المجلد ينتظر أول ملاحظة" description="أنشئ ملاحظة جديدة لتبقى أفكارك المنظمة هنا." cta="ملاحظة جديدة" onPress={addNote} />} /></ScreenContainer>;
}

const styles = StyleSheet.create({ content: { paddingBottom: 25 }, header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 8, paddingBottom: 25 }, back: { height: 42, width: 42, borderRadius: 15, alignItems: "center", justifyContent: "center", borderWidth: StyleSheet.hairlineWidth }, heading: { flexDirection: "row", alignItems: "center", gap: 9 }, icon: { height: 38, width: 38, borderRadius: 14, alignItems: "center", justifyContent: "center" }, title: { fontSize: 25, fontWeight: "900", writingDirection: "rtl" }, pressed: { opacity: 0.7 } });
