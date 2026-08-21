import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";

import { EmptyNotes } from "@/components/empty-notes";
import { GlassSurface } from "@/components/glass-surface";
import { NotebookMark } from "@/components/notebook-mark";
import { NoteCard } from "@/components/note-card";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useNotebook } from "@/providers/notebook-provider";
import type { SortOption } from "@/types/note";

const sortLabels: Record<SortOption, string> = {
  updated_desc: "آخر تعديل",
  created_desc: "الأحدث",
  created_asc: "الأقدم",
  title_asc: "أ ← ي",
  title_desc: "ي ← أ",
};

export default function NotesHomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { data, isReady, activeNotes, createNote, search, updateSettings } = useNotebook();
  const [query, setQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const notes = useMemo(() => search(query), [query, search]);
  const sortOption = data.settings.sortOption;

  const createAndOpenNote = useCallback(async () => {
    const note = await createNote();
    router.push({ pathname: "/note/[id]", params: { id: note.id } });
  }, [createNote, router]);

  const cycleSort = useCallback(async () => {
    const values: SortOption[] = ["updated_desc", "created_desc", "created_asc", "title_asc", "title_desc"];
    const next = values[(values.indexOf(sortOption) + 1) % values.length];
    await updateSettings({ sortOption: next });
  }, [sortOption, updateSettings]);

  const refresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 350);
  }, []);

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NoteCard note={item} query={query} onPress={() => router.push({ pathname: "/note/[id]", params: { id: item.id } })} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor={colors.primary} />}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <Pressable accessibilityLabel="فتح الإعدادات" onPress={() => router.push("/settings")} style={({ pressed }) => [styles.iconButton, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}>
                <MaterialIcons name="tune" size={21} color={colors.foreground} />
              </Pressable>
              <NotebookMark />
            </View>
            <View style={styles.heading}>
              <Text style={[styles.title, { color: colors.foreground }]}>مساحة أفكارك</Text>
              <Text style={[styles.subtitle, { color: colors.muted }]}>{activeNotes.length ? `${activeNotes.length} ملاحظة محفوظة بأمان` : "اكتب بتركيز، وسيُحفظ كل شيء تلقائيًا"}</Text>
            </View>
            <GlassSurface style={styles.searchBox}>
              <MaterialIcons name="search" size={22} color={colors.muted} />
              <TextInput value={query} onChangeText={setQuery} placeholder="ابحث في ملاحظاتك…" placeholderTextColor={colors.muted} style={[styles.searchInput, { color: colors.foreground }]} textAlign="right" returnKeyType="search" />
              {query.length > 0 && <Pressable accessibilityLabel="مسح البحث" onPress={() => setQuery("")} style={({ pressed }) => [styles.clearButton, pressed && styles.pressed]}><MaterialIcons name="close" size={18} color={colors.muted} /></Pressable>}
            </GlassSurface>
            <View style={styles.toolbar}>
              <Pressable onPress={cycleSort} style={({ pressed }) => [styles.sortButton, { borderColor: colors.border, backgroundColor: colors.surface }, pressed && styles.pressed]}>
                <MaterialIcons name="sort" size={17} color={colors.primary} />
                <Text style={[styles.sortText, { color: colors.foreground }]}>{sortLabels[sortOption]}</Text>
              </Pressable>
              <Text style={[styles.sectionLabel, { color: colors.muted }]}>{query ? `نتائج البحث (${notes.length})` : "كل الملاحظات"}</Text>
            </View>
          </View>
        }
        ListEmptyComponent={isReady ? <EmptyNotes title={query ? "لا توجد نتيجة مطابقة" : "دفترك جاهز لأول فكرة"} description={query ? "جرّب كلمة أخرى في عنوان الملاحظة أو محتواها." : "أنشئ ملاحظة جديدة وابدأ الكتابة في صفحة مريحة ومسطرة."} cta={query ? undefined : "اكتب ملاحظة"} onPress={query ? undefined : createAndOpenNote} /> : <View style={styles.loading}><Text style={{ color: colors.muted }}>يجري تجهيز دفترك…</Text></View>}
      />
      <Pressable accessibilityLabel="إنشاء ملاحظة جديدة" onPress={createAndOpenNote} style={({ pressed }) => [styles.fab, { backgroundColor: colors.primary }, pressed && styles.fabPressed]}>
        <MaterialIcons name="add" size={29} color="#FFFFFF" />
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContent: { paddingBottom: 116 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 8 },
  iconButton: { borderWidth: StyleSheet.hairlineWidth, height: 43, width: 43, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  heading: { alignItems: "flex-end", marginTop: 25, marginBottom: 19 },
  title: { fontSize: 29, lineHeight: 39, fontWeight: "900", writingDirection: "rtl" },
  subtitle: { fontSize: 14, lineHeight: 23, marginTop: 3, writingDirection: "rtl", textAlign: "right" },
  searchBox: { height: 56, paddingHorizontal: 15, alignItems: "center", flexDirection: "row", gap: 9, borderRadius: 18 },
  searchInput: { flex: 1, fontSize: 15, height: "100%", textAlign: "right" },
  clearButton: { padding: 4 },
  toolbar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 21, marginBottom: 11 },
  sectionLabel: { fontSize: 13, fontWeight: "700", writingDirection: "rtl" },
  sortButton: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 11, paddingVertical: 8, borderRadius: 13, borderWidth: StyleSheet.hairlineWidth },
  sortText: { fontSize: 12, fontWeight: "700", writingDirection: "rtl" },
  fab: { position: "absolute", right: 24, bottom: 22, width: 60, height: 60, borderRadius: 21, alignItems: "center", justifyContent: "center", shadowColor: "#4252BB", shadowOpacity: 0.32, shadowRadius: 14, shadowOffset: { width: 0, height: 7 }, elevation: 7 },
  fabPressed: { transform: [{ scale: 0.96 }], opacity: 0.92 },
  pressed: { opacity: 0.68 },
  loading: { alignItems: "center", paddingTop: 44 },
});
