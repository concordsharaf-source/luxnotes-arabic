import AsyncStorage from "@react-native-async-storage/async-storage";

import type { AppSettings, Folder, NotebookData } from "@/types/note";

const STORAGE_KEY = "luxnotes.notebook.v1";

const defaultFolders: Folder[] = [
  { id: "folder_articles", name: "مقالات", color: "#6D77E8", createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "folder_ideas", name: "أفكار", color: "#D06B9D", createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "folder_work", name: "عمل", color: "#479F89", createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "folder_study", name: "دراسة", color: "#D49147", createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "folder_personal", name: "شخصي", color: "#946EBD", createdAt: "2026-01-01T00:00:00.000Z" },
];

const defaultSettings: AppSettings = {
  themeMode: "system",
  fontFamily: "cairo",
  fontSize: 19,
  sortOption: "updated_desc",
  language: "auto",
  lockEnabled: false,
  pinHash: null,
  biometricEnabled: false,
};

export function createInitialNotebookData(): NotebookData {
  return { version: 1, notes: [], folders: defaultFolders, settings: defaultSettings };
}

function isNotebookData(value: unknown): value is NotebookData {
  if (!value || typeof value !== "object") return false;
  const data = value as Partial<NotebookData>;
  return data.version === 1 && Array.isArray(data.notes) && Array.isArray(data.folders) && !!data.settings;
}

function normalizeData(value: NotebookData): NotebookData {
  return {
    version: 1,
    notes: value.notes.map((note) => ({
      ...note,
      blocks: note.blocks ?? [],
      images: note.images ?? [],
      deletedAt: note.deletedAt ?? null,
      isFavorite: Boolean(note.isFavorite),
      isPinned: Boolean(note.isPinned),
    })),
    folders: value.folders.length ? value.folders : defaultFolders,
    settings: { ...defaultSettings, ...value.settings },
  };
}

export async function loadNotebookData(): Promise<NotebookData> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) return createInitialNotebookData();
    const parsed: unknown = JSON.parse(stored);
    return isNotebookData(parsed) ? normalizeData(parsed) : createInitialNotebookData();
  } catch {
    return createInitialNotebookData();
  }
}

export async function saveNotebookData(data: NotebookData): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export async function replaceNotebookData(data: NotebookData): Promise<void> {
  await saveNotebookData(normalizeData(data));
}

export async function clearNotebookData(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

export function serializeNotebookData(data: NotebookData): string {
  return JSON.stringify(data, null, 2);
}

export function parseNotebookBackup(content: string): NotebookData | null {
  try {
    const parsed: unknown = JSON.parse(content);
    return isNotebookData(parsed) ? normalizeData(parsed) : null;
  } catch {
    return null;
  }
}
