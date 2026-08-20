import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { GlassSurface } from "@/components/glass-surface";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useNotebook } from "@/providers/notebook-provider";

const folderColors = ["#6D77E8", "#D06B9D", "#479F89", "#D49147", "#946EBD"];

export default function FoldersScreen() {
  const colors = useColors();
  const router = useRouter();
  const { data, activeNotes, addFolder } = useNotebook();
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [chosenColor, setChosenColor] = useState(folderColors[0]);
  const counts = useMemo(() => new Map(data.folders.map((folder) => [folder.id, activeNotes.filter((note) => note.folderId === folder.id).length])), [activeNotes, data.folders]);

  const submit = async () => {
    if (!name.trim()) return;
    await addFolder(name, chosenColor);
    setName("");
    setModalVisible(false);
  };

  return (
    <ScreenContainer className="px-5">
      <FlatList
        data={data.folders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push({ pathname: "/folder/[id]", params: { id: item.id } })} style={({ pressed }) => [pressed && styles.pressed]}>
            <GlassSurface style={styles.folderCard}>
              <View style={[styles.folderIcon, { backgroundColor: `${item.color}22` }]}><MaterialIcons name="folder" size={28} color={item.color} /></View>
              <View style={styles.folderText}><Text style={[styles.folderName, { color: colors.foreground }]}>{item.name}</Text><Text style={[styles.count, { color: colors.muted }]}>{counts.get(item.id) ?? 0} ملاحظة</Text></View>
              <MaterialIcons name="chevron-left" size={22} color={colors.muted} />
            </GlassSurface>
          </Pressable>
        )}
        ListHeaderComponent={<View style={styles.header}><Text style={[styles.title, { color: colors.foreground }]}>مجلداتي</Text><Text style={[styles.subtitle, { color: colors.muted }]}>نظّم أفكارك في مساحات بسيطة وواضحة</Text></View>}
        ListFooterComponent={<Pressable onPress={() => setModalVisible(true)} style={({ pressed }) => [styles.addCard, { borderColor: colors.border }, pressed && styles.pressed]}><MaterialIcons name="create-new-folder" size={22} color={colors.primary} /><Text style={[styles.addText, { color: colors.primary }]}>إنشاء مجلد جديد</Text></Pressable>}
      />
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.overlay}><GlassSurface style={styles.modal}><Text style={[styles.modalTitle, { color: colors.foreground }]}>مجلد جديد</Text><TextInput value={name} onChangeText={setName} autoFocus placeholder="اسم المجلد" placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground, borderColor: colors.border }]} textAlign="right" />
          <View style={styles.swatches}>{folderColors.map((color) => <Pressable key={color} onPress={() => setChosenColor(color)} style={[styles.swatch, { backgroundColor: color }, chosenColor === color && styles.selectedSwatch]} />)}</View>
          <View style={styles.actions}><Pressable onPress={() => setModalVisible(false)} style={styles.cancel}><Text style={[styles.cancelText, { color: colors.muted }]}>إلغاء</Text></Pressable><Pressable onPress={submit} style={[styles.confirm, { backgroundColor: colors.primary }]}><Text style={styles.confirmText}>إنشاء</Text></Pressable></View>
        </GlassSurface></View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 30 }, header: { alignItems: "flex-end", paddingTop: 11, paddingBottom: 24 }, title: { fontSize: 29, fontWeight: "900", writingDirection: "rtl" }, subtitle: { fontSize: 14, marginTop: 5, writingDirection: "rtl" }, folderCard: { padding: 15, marginBottom: 11, flexDirection: "row", alignItems: "center", gap: 13 }, folderIcon: { width: 54, height: 54, borderRadius: 19, justifyContent: "center", alignItems: "center" }, folderText: { flex: 1, alignItems: "flex-end" }, folderName: { fontSize: 17, fontWeight: "800", writingDirection: "rtl" }, count: { fontSize: 13, marginTop: 4, writingDirection: "rtl" }, addCard: { marginTop: 5, padding: 18, borderStyle: "dashed", borderWidth: 1.5, borderRadius: 22, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 9 }, addText: { fontSize: 15, fontWeight: "800", writingDirection: "rtl" }, pressed: { opacity: 0.67, transform: [{ scale: 0.985 }] }, overlay: { flex: 1, backgroundColor: "rgba(14, 22, 48, 0.32)", justifyContent: "center", padding: 25 }, modal: { padding: 21 }, modalTitle: { textAlign: "right", fontWeight: "900", fontSize: 21, writingDirection: "rtl" }, input: { marginTop: 19, borderWidth: 1, borderRadius: 15, height: 51, paddingHorizontal: 14, fontSize: 16 }, swatches: { flexDirection: "row", justifyContent: "center", gap: 14, marginVertical: 21 }, swatch: { height: 29, width: 29, borderRadius: 15 }, selectedSwatch: { borderWidth: 3, borderColor: "#FFFFFF", outlineWidth: 2, outlineColor: "#5364CE" }, actions: { flexDirection: "row", justifyContent: "flex-end", gap: 10 }, cancel: { paddingHorizontal: 18, paddingVertical: 12 }, cancelText: { fontSize: 14, fontWeight: "800", writingDirection: "rtl" }, confirm: { paddingHorizontal: 19, paddingVertical: 12, borderRadius: 14 }, confirmText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800", writingDirection: "rtl" },
});
