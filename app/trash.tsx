import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { EmptyNotes } from "@/components/empty-notes";
import { GlassSurface } from "@/components/glass-surface";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { formatDate } from "@/lib/notebook-utils";
import { useNotebook } from "@/providers/notebook-provider";

export default function TrashScreen() {
  const colors = useColors();
  const router = useRouter();
  const { trashedNotes, isReady, restoreNote, permanentlyDeleteNote } = useNotebook();
  const erase = (id: string) => Alert.alert("حذف نهائي", "لن يكون بالإمكان استعادة هذه الملاحظة بعد الحذف.", [{ text: "إلغاء", style: "cancel" }, { text: "حذف نهائي", style: "destructive", onPress: () => void permanentlyDeleteNote(id) }]);
  return <ScreenContainer className="px-5"><FlatList data={trashedNotes} keyExtractor={(item) => item.id} contentContainerStyle={styles.content} ListHeaderComponent={<View style={styles.header}><Pressable onPress={() => router.back()} style={({ pressed }) => [styles.back, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}><MaterialIcons name="arrow-forward" size={22} color={colors.foreground} /></Pressable><View style={styles.heading}><Text style={[styles.title, { color: colors.foreground }]}>سلة المحذوفات</Text><Text style={[styles.subtitle, { color: colors.muted }]}>يمكنك استعادة الملاحظات أو حذفها نهائيًا</Text></View></View>} renderItem={({ item }) => <GlassSurface style={styles.item}><View style={styles.itemText}><Text style={[styles.itemTitle, { color: colors.foreground }]} numberOfLines={1}>{item.title || "ملاحظة بلا عنوان"}</Text><Text style={[styles.itemDate, { color: colors.muted }]}>حُذفت في {item.deletedAt ? formatDate(item.deletedAt) : "وقت سابق"}</Text></View><Pressable onPress={() => void restoreNote(item.id)} style={[styles.action, { backgroundColor: "#EEF0FF" }]}><MaterialIcons name="restore" size={20} color={colors.primary} /></Pressable><Pressable onPress={() => erase(item.id)} style={[styles.action, { backgroundColor: "#FBEDEE" }]}><MaterialIcons name="delete-outline" size={20} color="#C94E59" /></Pressable></GlassSurface>} ListEmptyComponent={isReady ? <EmptyNotes title="سلة المحذوفات فارغة" description="أي ملاحظة تحذفها ستظهر هنا لتستطيع استعادتها لاحقًا." /> : <View style={styles.loading}><Text style={{ color: colors.muted }}>يجري تجهيز السلة…</Text></View>} /></ScreenContainer>;
}

const styles = StyleSheet.create({ content: { paddingTop: 8, paddingBottom: 30 }, header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }, back: { height: 42, width: 42, borderRadius: 15, alignItems: "center", justifyContent: "center", borderWidth: StyleSheet.hairlineWidth }, heading: { alignItems: "flex-end" }, title: { fontSize: 26, fontWeight: "900", writingDirection: "rtl" }, subtitle: { fontSize: 12, marginTop: 4, writingDirection: "rtl" }, item: { padding: 14, marginBottom: 10, flexDirection: "row", alignItems: "center", gap: 8 }, itemText: { flex: 1, alignItems: "flex-end" }, itemTitle: { fontSize: 15, fontWeight: "800", writingDirection: "rtl" }, itemDate: { fontSize: 11, marginTop: 4, writingDirection: "rtl" }, action: { height: 40, width: 40, borderRadius: 14, alignItems: "center", justifyContent: "center" }, pressed: { opacity: 0.68 }, loading: { alignItems: "center", paddingTop: 44 } });
