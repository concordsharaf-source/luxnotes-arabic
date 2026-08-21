import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Alert, Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { GlassSurface } from "@/components/glass-surface";
import { useColors } from "@/hooks/use-colors";
import { useNotebook } from "@/providers/notebook-provider";
import type { Note } from "@/types/note";

const labelColors = ["#6D77E8", "#D06B9D", "#479F89", "#D49147", "#946EBD"];

type NoteActionsSheetProps = { note: Note; visible: boolean; onClose: () => void };

export function NoteActionsSheet({ note, visible, onClose }: NoteActionsSheetProps) {
  const colors = useColors();
  const { toggleFavorite, togglePinned, deleteNote, updateNote } = useNotebook();
  const confirmDelete = () => {
    Alert.alert("نقل إلى سلة المحذوفات", "يمكنك استعادة الملاحظة لاحقًا من الإعدادات.", [
      { text: "إلغاء", style: "cancel" },
      { text: "نقل إلى السلة", style: "destructive", onPress: () => void deleteNote(note.id) },
    ]);
    onClose();
  };
  const changeLabelColor = async (labelColor: string | null) => { await updateNote(note.id, { labelColor }); onClose(); };

  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={styles.overlay}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <GlassSurface style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>{note.title || "ملاحظة بلا عنوان"}</Text>
        <View style={styles.actionGrid}>
          <Pressable onPress={() => { void togglePinned(note.id); onClose(); }} style={({ pressed }) => [styles.action, pressed && styles.pressed]}><View style={[styles.icon, { backgroundColor: "#EEF0FF" }]}><MaterialIcons name="push-pin" size={21} color={colors.primary} /></View><Text style={[styles.actionText, { color: colors.foreground }]}>{note.isPinned ? "إلغاء التثبيت" : "تثبيت"}</Text></Pressable>
          <Pressable onPress={() => { void toggleFavorite(note.id); onClose(); }} style={({ pressed }) => [styles.action, pressed && styles.pressed]}><View style={[styles.icon, { backgroundColor: "#FCF0F7" }]}><MaterialIcons name={note.isFavorite ? "star" : "star-border"} size={22} color="#D06B9D" /></View><Text style={[styles.actionText, { color: colors.foreground }]}>{note.isFavorite ? "إزالة المفضلة" : "إلى المفضلة"}</Text></Pressable>
          <Pressable onPress={confirmDelete} style={({ pressed }) => [styles.action, pressed && styles.pressed]}><View style={[styles.icon, { backgroundColor: "#FBEDEE" }]}><MaterialIcons name="delete-outline" size={22} color="#C94E59" /></View><Text style={[styles.actionText, { color: "#C94E59" }]}>حذف</Text></Pressable>
        </View>
        <Text style={[styles.labelTitle, { color: colors.muted }]}>لون الملاحظة</Text>
        <View style={styles.colors}>
          <Pressable accessibilityLabel="إزالة لون الملاحظة" onPress={() => void changeLabelColor(null)} style={[styles.noColor, { borderColor: colors.border }, note.labelColor === null && { borderColor: colors.primary, borderWidth: 2 }]}><MaterialIcons name="format-color-reset" size={19} color={colors.muted} /></Pressable>
          {labelColors.map((labelColor) => <Pressable key={labelColor} accessibilityLabel="اختيار لون الملاحظة" onPress={() => void changeLabelColor(labelColor)} style={[styles.color, { backgroundColor: labelColor }, note.labelColor === labelColor && styles.selectedColor]} />)}
        </View>
      </GlassSurface>
    </View>
  </Modal>;
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(12, 20, 42, 0.25)", padding: 12 }, sheet: { borderRadius: 28, paddingHorizontal: 18, paddingBottom: 23, paddingTop: 10 }, handle: { alignSelf: "center", width: 38, height: 4, borderRadius: 3, backgroundColor: "#C9CEDC", marginBottom: 16 }, title: { fontSize: 17, fontWeight: "900", textAlign: "right", writingDirection: "rtl", marginBottom: 18 }, actionGrid: { flexDirection: "row", justifyContent: "space-around", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E4E7F0", paddingBottom: 17 }, action: { width: 86, alignItems: "center", gap: 7 }, icon: { height: 47, width: 47, borderRadius: 17, alignItems: "center", justifyContent: "center" }, actionText: { fontSize: 12, fontWeight: "800", textAlign: "center", writingDirection: "rtl" }, labelTitle: { fontSize: 13, fontWeight: "800", textAlign: "right", writingDirection: "rtl", marginTop: 16, marginBottom: 10 }, colors: { flexDirection: "row", justifyContent: "flex-end", gap: 11 }, color: { height: 31, width: 31, borderRadius: 16 }, selectedColor: { borderWidth: 3, borderColor: "#FFFFFF", outlineWidth: 2, outlineColor: "#5364CE" }, noColor: { height: 31, width: 31, borderRadius: 16, borderWidth: 1, alignItems: "center", justifyContent: "center" }, pressed: { opacity: 0.67, transform: [{ scale: 0.96 }] },
});
