import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

import { parseNotebookBackup, serializeNotebookData } from "@/lib/notebook-repository";
import type { Note, NotebookData } from "@/types/note";

function safeFilename(value: string): string {
  return value.replace(/[^\p{L}\p{N}_-]+/gu, "_").replace(/^_+|_+$/g, "").slice(0, 36) || "ملاحظة";
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
}

function noteHtml(note: Note): string {
  const title = escapeHtml(note.title || "ملاحظة بلا عنوان");
  const paragraphs = escapeHtml(note.content || "").split("\n").map((paragraph) => `<p>${paragraph || "&nbsp;"}</p>`).join("");
  return `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8" /><style>@page { margin: 38px; } body { font-family: Arial, sans-serif; color: #1E2741; direction: rtl; text-align: right; line-height: 1.85; } h1 { font-size: 25px; margin-bottom: 7px; } .meta { color: #69738A; font-size: 12px; border-bottom: 1px solid #DEE2EA; padding-bottom: 16px; margin-bottom: 24px; } p { font-size: 16px; margin: 0 0 14px; white-space: pre-wrap; }</style></head><body><h1>${title}</h1><div class="meta">تم التصدير من دفتري</div>${paragraphs || "<p>ملاحظة فارغة</p>"}</body></html>`;
}

async function shareFile(uri: string, mimeType: string, dialogTitle: string): Promise<boolean> {
  if (!(await Sharing.isAvailableAsync())) return false;
  await Sharing.shareAsync(uri, { mimeType, dialogTitle });
  return true;
}

export async function exportBackup(data: NotebookData): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const uri = `${FileSystem.cacheDirectory}luxnotes-backup-${Date.now()}.json`;
  await FileSystem.writeAsStringAsync(uri, serializeNotebookData(data), { encoding: FileSystem.EncodingType.UTF8 });
  return shareFile(uri, "application/json", "حفظ نسخة احتياطية من دفتري");
}

export async function importBackup(): Promise<NotebookData | null> {
  const result = await DocumentPicker.getDocumentAsync({ type: ["application/json", "text/json", "text/plain"], copyToCacheDirectory: true });
  if (result.canceled) return null;
  const asset = result.assets[0];
  let content = "";
  if (Platform.OS === "web" && asset.file) content = await asset.file.text();
  else content = await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.UTF8 });
  return parseNotebookBackup(content);
}

export async function exportNotePdf(note: Note): Promise<boolean> {
  if (Platform.OS === "web") {
    await Print.printAsync({});
    return true;
  }
  const result = await Print.printToFileAsync({ html: noteHtml(note) });
  const filename = `${safeFilename(note.title)}.pdf`;
  const targetUri = `${FileSystem.cacheDirectory}${filename}`;
  await FileSystem.moveAsync({ from: result.uri, to: targetUri });
  return shareFile(targetUri, "application/pdf", "تصدير الملاحظة PDF");
}
