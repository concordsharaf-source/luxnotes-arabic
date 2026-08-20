import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { GlassSurface } from "@/components/glass-surface";
import { LinedPaper } from "@/components/lined-paper";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { calculateTextStats, detectWritingDirection, formatDate } from "@/lib/notebook-utils";
import { useNotebook } from "@/providers/notebook-provider";
import { exportNotePdf } from "@/lib/backup-service";
import { createId } from "@/lib/notebook-utils";
import type { NoteImage } from "@/types/note";

export default function NoteEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useColors();
  const { notes, data, updateNote, toggleFavorite, togglePinned, duplicateNote, deleteNote } = useNotebook();
  const note = notes.find((item) => item.id === id);
  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [saved, setSaved] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const [moveVisible, setMoveVisible] = useState(false);
  const pendingChange = useRef<{ title: string; content: string } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialised = useRef(false);
  const stats = useMemo(() => calculateTextStats(`${title}\n${content}`), [content, title]);
  const contentDirection = detectWritingDirection(content);
  const contentFont = data.settings.fontFamily === "cairo" ? "Cairo_400Regular" : data.settings.fontFamily === "tajawal" ? "Tajawal_400Regular" : undefined;
  const titleFont = data.settings.fontFamily === "tajawal" ? "Tajawal_700Bold" : data.settings.fontFamily === "cairo" ? "Cairo_800ExtraBold" : undefined;

  const persist = async (nextTitle: string, nextContent: string) => {
    pendingChange.current = null;
    await updateNote(id, { title: nextTitle, content: nextContent, blocks: [{ id: `text_${id}`, type: "text", text: nextContent }] });
    setSaved(true);
  };

  const schedulePersist = (nextTitle: string, nextContent: string) => {
    if (!initialised.current) return;
    setSaved(false);
    pendingChange.current = { title: nextTitle, content: nextContent };
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => persist(nextTitle, nextContent), 650);
  };

  const addImages = async (camera = false) => {
    if (!note) return;
    try {
      if (camera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) { Alert.alert("إذن الكاميرا مطلوب", "السماح بالكاميرا يتيح لك إرفاق صور بملاحظتك."); return; }
      }
      const result = camera
        ? await ImagePicker.launchCameraAsync({ quality: 0.82 })
        : await ImagePicker.launchImageLibraryAsync({ allowsMultipleSelection: true, quality: 0.82 });
      if (result.canceled) return;
      const images: NoteImage[] = result.assets.map((asset) => ({ id: createId("image"), uri: asset.uri, width: asset.width, height: asset.height, createdAt: new Date().toISOString() }));
      const allImages = [...note.images, ...images];
      await updateNote(id, { images: allImages, blocks: [{ id: `text_${id}`, type: "text", text: content }, ...allImages.map((image) => ({ id: `block_${image.id}`, type: "image" as const, imageId: image.id }))] });
    } catch { Alert.alert("تعذر إضافة الصورة", "حاول مرة أخرى أو تأكد من أذونات التطبيق."); }
  };

  const removeImage = async (imageId: string) => {
    if (!note) return;
    const remaining = note.images.filter((image) => image.id !== imageId);
    await updateNote(id, { images: remaining, blocks: [{ id: `text_${id}`, type: "text", text: content }, ...remaining.map((image) => ({ id: `block_${image.id}`, type: "image" as const, imageId: image.id }))] });
  };

  const exportPdf = async () => {
    if (!note) return;
    try { const shared = await exportNotePdf({ ...note, title, content }); if (!shared) Alert.alert("المشاركة غير متاحة", "تصدير PDF يعمل من تطبيق الهاتف على جهاز يدعم المشاركة."); } catch { Alert.alert("تعذر تصدير PDF", "حاول مرة أخرى بعد التأكد من وجود مساحة كافية."); }
  };

  const duplicateAndOpen = async () => {
    await persist(title, content);
    const duplicate = await duplicateNote(id);
    setMenuVisible(false);
    if (duplicate) router.replace({ pathname: "/note/[id]", params: { id: duplicate.id } });
  };

  const deleteCurrentNote = () => {
    setMenuVisible(false);
    Alert.alert("نقل إلى سلة المحذوفات", "يمكنك استعادة الملاحظة لاحقًا من الإعدادات.", [
      { text: "إلغاء", style: "cancel" },
      { text: "نقل إلى السلة", style: "destructive", onPress: () => void (async () => { await deleteNote(id); router.back(); })() },
    ]);
  };

  const moveToFolder = async (folderId: string | null) => {
    await updateNote(id, { folderId });
    setMoveVisible(false);
  };

  useEffect(() => {
    initialised.current = true;
    return () => { if (timer.current) clearTimeout(timer.current); if (pendingChange.current) void persist(pendingChange.current.title, pendingChange.current.content); };
  }, []);

  if (!note) return <ScreenContainer className="p-5"><Text style={{ color: colors.foreground, textAlign: "center", marginTop: 40 }}>الملاحظة غير متاحة.</Text></ScreenContainer>;

  return (
    <ScreenContainer edges={["top", "left", "right", "bottom"]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.background }]}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.headerButton, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]} accessibilityLabel="عودة"><MaterialIcons name="arrow-forward" size={22} color={colors.foreground} /></Pressable>
          <View style={styles.status}><View style={[styles.statusDot, { backgroundColor: saved ? "#52A990" : "#D49147" }]} /><Text style={[styles.statusText, { color: colors.muted }]}>{saved ? "تم الحفظ" : "يجري الحفظ…"}</Text></View>
          <View style={styles.actions}><Pressable onPress={() => setMenuVisible(true)} style={({ pressed }) => [styles.iconAction, pressed && styles.pressed]} accessibilityLabel="إجراءات الملاحظة"><MaterialIcons name="more-horiz" size={23} color={colors.muted} /></Pressable><Pressable onPress={() => void togglePinned(id)} style={({ pressed }) => [styles.iconAction, note.isPinned && { backgroundColor: "#EEF0FF" }, pressed && styles.pressed]}><MaterialIcons name="push-pin" size={20} color={note.isPinned ? colors.primary : colors.muted} /></Pressable><Pressable onPress={() => void toggleFavorite(id)} style={({ pressed }) => [styles.iconAction, note.isFavorite && { backgroundColor: "#FCF0F7" }, pressed && styles.pressed]}><MaterialIcons name={note.isFavorite ? "star" : "star-border"} size={22} color={note.isFavorite ? "#D06B9D" : colors.muted} /></Pressable></View>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.metaRow}><Text style={[styles.dateText, { color: colors.muted }]}>آخر تعديل {formatDate(note.updatedAt)}</Text><Text style={[styles.folderText, { color: colors.primary }]}>{data.folders.find((item) => item.id === note.folderId)?.name ?? "غير مصنفة"}</Text></View>
          <LinedPaper>
            <TextInput value={title} onChangeText={(value) => { setTitle(value); schedulePersist(value, content); }} onBlur={() => void persist(title, content)} placeholder="عنوان الملاحظة" placeholderTextColor={colors.muted} style={[styles.titleInput, { color: colors.foreground, fontFamily: titleFont }]} textAlign={detectWritingDirection(title) === "rtl" ? "right" : "left"} multiline />
            <View style={[styles.titleDivider, { backgroundColor: colors.border }]} />
            <TextInput value={content} onChangeText={(value) => { setContent(value); schedulePersist(title, value); }} onBlur={() => void persist(title, content)} placeholder="ابدأ الكتابة…" placeholderTextColor={colors.muted} style={[styles.contentInput, { color: colors.foreground, fontSize: data.settings.fontSize, lineHeight: data.settings.fontSize * 1.78, fontFamily: contentFont }]} textAlign={contentDirection === "rtl" ? "right" : "left"} multiline textAlignVertical="top" autoFocus={!note.title && !note.content} />
            {note.images.length > 0 && <View style={styles.imageList}>{note.images.map((image) => <View key={image.id} style={styles.imageWrap}><Image source={{ uri: image.uri }} style={styles.attachedImage} resizeMode="cover" /><Pressable accessibilityLabel="إزالة الصورة" onPress={() => void removeImage(image.id)} style={styles.removeImage}><MaterialIcons name="close" size={16} color="#FFFFFF" /></Pressable></View>)}</View>}
          </LinedPaper>
          <View style={styles.attachmentBar}><Pressable onPress={() => void addImages()} style={({ pressed }) => [styles.attachmentButton, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}><MaterialIcons name="image" size={20} color={colors.primary} /><Text style={[styles.attachmentText, { color: colors.foreground }]}>صورة</Text></Pressable><Pressable onPress={() => void addImages(true)} style={({ pressed }) => [styles.attachmentButton, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}><MaterialIcons name="photo-camera" size={20} color={colors.primary} /><Text style={[styles.attachmentText, { color: colors.foreground }]}>كاميرا</Text></Pressable></View>
          <GlassSurface style={styles.stats}><View style={styles.stat}><Text style={[styles.statNumber, { color: colors.foreground }]}>{stats.wordCount}</Text><Text style={[styles.statLabel, { color: colors.muted }]}>كلمة</Text></View><View style={[styles.statDivider, { backgroundColor: colors.border }]} /><View style={styles.stat}><Text style={[styles.statNumber, { color: colors.foreground }]}>{stats.characterCount}</Text><Text style={[styles.statLabel, { color: colors.muted }]}>حرف</Text></View><View style={[styles.statDivider, { backgroundColor: colors.border }]} /><Text style={[styles.autoSave, { color: colors.muted }]}>الحفظ التلقائي مفعّل</Text></GlassSurface>
        </ScrollView>
      </KeyboardAvoidingView>
      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}><Pressable onPress={() => setMenuVisible(false)} style={styles.menuOverlay}><GlassSurface style={styles.actionMenu}><Pressable onPress={() => void exportPdf()} style={({ pressed }) => [styles.menuAction, pressed && styles.pressed]}><MaterialIcons name="picture-as-pdf" size={21} color={colors.primary} /><Text style={[styles.menuText, { color: colors.foreground }]}>تصدير PDF</Text></Pressable><Pressable onPress={() => void duplicateAndOpen()} style={({ pressed }) => [styles.menuAction, pressed && styles.pressed]}><MaterialIcons name="content-copy" size={21} color={colors.primary} /><Text style={[styles.menuText, { color: colors.foreground }]}>نسخ الملاحظة</Text></Pressable><Pressable onPress={() => { setMenuVisible(false); setMoveVisible(true); }} style={({ pressed }) => [styles.menuAction, pressed && styles.pressed]}><MaterialIcons name="drive-file-move" size={21} color={colors.primary} /><Text style={[styles.menuText, { color: colors.foreground }]}>نقل إلى مجلد</Text></Pressable><View style={[styles.menuDivider, { backgroundColor: colors.border }]} /><Pressable onPress={deleteCurrentNote} style={({ pressed }) => [styles.menuAction, pressed && styles.pressed]}><MaterialIcons name="delete-outline" size={21} color="#C94E59" /><Text style={[styles.menuText, { color: "#C94E59" }]}>نقل إلى سلة المحذوفات</Text></Pressable></GlassSurface></Pressable></Modal>
      <Modal visible={moveVisible} transparent animationType="slide" onRequestClose={() => setMoveVisible(false)}><View style={styles.moveOverlay}><GlassSurface style={styles.moveSheet}><View style={styles.sheetHeader}><Pressable onPress={() => setMoveVisible(false)} style={styles.sheetClose}><MaterialIcons name="close" size={21} color={colors.muted} /></Pressable><Text style={[styles.sheetTitle, { color: colors.foreground }]}>نقل إلى مجلد</Text></View><Pressable onPress={() => void moveToFolder(null)} style={({ pressed }) => [styles.folderChoice, pressed && styles.pressed]}><MaterialIcons name="notes" size={22} color={colors.primary} /><Text style={[styles.folderChoiceText, { color: colors.foreground }]}>غير مصنفة</Text>{note.folderId === null && <MaterialIcons name="check" size={20} color={colors.primary} />}</Pressable>{data.folders.map((folder) => <Pressable key={folder.id} onPress={() => void moveToFolder(folder.id)} style={({ pressed }) => [styles.folderChoice, pressed && styles.pressed]}><MaterialIcons name="folder" size={22} color={folder.color} /><Text style={[styles.folderChoiceText, { color: colors.foreground }]}>{folder.name}</Text>{note.folderId === folder.id && <MaterialIcons name="check" size={20} color={colors.primary} />}</Pressable>)}</GlassSurface></View></Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 }, header: { height: 65, borderBottomWidth: StyleSheet.hairlineWidth, paddingHorizontal: 19, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, headerButton: { height: 40, width: 40, borderRadius: 15, alignItems: "center", justifyContent: "center", borderWidth: StyleSheet.hairlineWidth }, status: { flexDirection: "row", alignItems: "center", gap: 6 }, statusDot: { height: 7, width: 7, borderRadius: 5 }, statusText: { fontSize: 12, writingDirection: "rtl" }, actions: { flexDirection: "row", alignItems: "center", gap: 3 }, iconAction: { height: 37, width: 37, borderRadius: 13, alignItems: "center", justifyContent: "center" }, pressed: { opacity: 0.67, transform: [{ scale: 0.96 }] }, scrollContent: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 35 }, metaRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 11 }, dateText: { fontSize: 12, writingDirection: "rtl" }, folderText: { fontSize: 12, fontWeight: "700", writingDirection: "rtl" }, titleInput: { minHeight: 51, fontSize: 28, lineHeight: 39, fontWeight: "900", padding: 0, writingDirection: "rtl" }, titleDivider: { height: StyleSheet.hairlineWidth, marginTop: 9, marginBottom: 10 }, contentInput: { flex: 1, minHeight: 375, padding: 0, fontWeight: "400" }, imageList: { gap: 11, marginTop: 12 }, imageWrap: { position: "relative" }, attachedImage: { width: "100%", height: 205, borderRadius: 17, backgroundColor: "#E9E8FF" }, removeImage: { position: "absolute", top: 9, right: 9, height: 30, width: 30, borderRadius: 15, backgroundColor: "rgba(24, 30, 50, 0.75)", alignItems: "center", justifyContent: "center" }, attachmentBar: { flexDirection: "row", justifyContent: "flex-end", gap: 9, marginTop: 13 }, attachmentButton: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderWidth: StyleSheet.hairlineWidth, borderRadius: 15 }, attachmentText: { fontSize: 13, fontWeight: "800", writingDirection: "rtl" }, stats: { marginTop: 14, paddingHorizontal: 16, paddingVertical: 12, flexDirection: "row", justifyContent: "flex-end", alignItems: "center", gap: 13, borderRadius: 18 }, stat: { alignItems: "center" }, statNumber: { fontSize: 15, fontWeight: "900" }, statLabel: { fontSize: 11, marginTop: 1, writingDirection: "rtl" }, statDivider: { width: StyleSheet.hairlineWidth, height: 28 }, autoSave: { fontSize: 11, writingDirection: "rtl", marginRight: "auto" }, menuOverlay: { flex: 1, backgroundColor: "rgba(12, 20, 42, 0.2)", justifyContent: "flex-end", padding: 18 }, actionMenu: { paddingVertical: 7, paddingHorizontal: 8, borderRadius: 23 }, menuAction: { minHeight: 50, flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 13, paddingHorizontal: 12 }, menuText: { fontSize: 15, fontWeight: "800", writingDirection: "rtl" }, menuDivider: { height: StyleSheet.hairlineWidth, marginHorizontal: 10 }, moveOverlay: { flex: 1, backgroundColor: "rgba(12, 20, 42, 0.2)", justifyContent: "flex-end", padding: 12 }, moveSheet: { padding: 15, borderRadius: 25 }, sheetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 5, paddingBottom: 10 }, sheetClose: { padding: 5 }, sheetTitle: { fontSize: 18, fontWeight: "900", writingDirection: "rtl" }, folderChoice: { minHeight: 50, alignItems: "center", flexDirection: "row", gap: 12, paddingHorizontal: 8 }, folderChoiceText: { flex: 1, fontSize: 15, fontWeight: "700", textAlign: "right", writingDirection: "rtl" },
});
