import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";

import { createInitialNotebookData, loadNotebookData, saveNotebookData } from "@/lib/notebook-repository";
import { calculateTextStats, createId, findNotes, sortNotes } from "@/lib/notebook-utils";
import type { AppSettings, Folder, Note, NoteDraft, NotebookData, SortOption } from "@/types/note";

type UpdatePayload = Partial<Omit<Note, "id" | "createdAt">>;

type NotebookContextValue = {
  data: NotebookData;
  isReady: boolean;
  notes: Note[];
  activeNotes: Note[];
  trashedNotes: Note[];
  createNote: (draft?: Partial<NoteDraft>) => Promise<Note>;
  updateNote: (id: string, payload: UpdatePayload) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  restoreNote: (id: string) => Promise<void>;
  permanentlyDeleteNote: (id: string) => Promise<void>;
  duplicateNote: (id: string) => Promise<Note | null>;
  toggleFavorite: (id: string) => Promise<void>;
  togglePinned: (id: string) => Promise<void>;
  addFolder: (name: string, color: string) => Promise<Folder>;
  renameFolder: (id: string, name: string) => Promise<void>;
  removeFolder: (id: string) => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  search: (query: string, folderId?: string | null, sortOption?: SortOption) => Note[];
  replaceData: (nextData: NotebookData) => Promise<void>;
};

const NotebookContext = createContext<NotebookContextValue | null>(null);

export function NotebookProvider({ children }: PropsWithChildren) {
  const [data, setData] = useState<NotebookData>(createInitialNotebookData);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    loadNotebookData().then((loaded) => {
      if (mounted) {
        setData(loaded);
        setIsReady(true);
      }
    });
    return () => { mounted = false; };
  }, []);

  const commit = useCallback(async (next: NotebookData) => {
    setData(next);
    await saveNotebookData(next);
  }, []);

  const createNote = useCallback(async (draft: Partial<NoteDraft> = {}) => {
    const now = new Date().toISOString();
    const title = draft.title ?? "";
    const content = draft.content ?? "";
    const stats = calculateTextStats(`${title}\n${content}`);
    const note: Note = {
      id: createId("note"),
      title,
      content,
      blocks: draft.blocks ?? [{ id: createId("block"), type: "text", text: content }],
      createdAt: now,
      updatedAt: now,
      folderId: draft.folderId ?? null,
      isFavorite: false,
      isPinned: false,
      images: draft.images ?? [],
      ...stats,
      deletedAt: null,
    };
    const next = { ...data, notes: [note, ...data.notes] };
    await commit(next);
    return note;
  }, [commit, data]);

  const updateNote = useCallback(async (id: string, payload: UpdatePayload) => {
    const now = new Date().toISOString();
    const nextNotes = data.notes.map((note) => {
      if (note.id !== id) return note;
      const nextNote = { ...note, ...payload, updatedAt: now };
      const stats = calculateTextStats(`${nextNote.title}\n${nextNote.content}`);
      return { ...nextNote, ...stats };
    });
    await commit({ ...data, notes: nextNotes });
  }, [commit, data]);

  const deleteNote = useCallback(async (id: string) => {
    const now = new Date().toISOString();
    await commit({ ...data, notes: data.notes.map((note) => note.id === id ? { ...note, deletedAt: now, isPinned: false } : note) });
  }, [commit, data]);

  const restoreNote = useCallback(async (id: string) => {
    await commit({ ...data, notes: data.notes.map((note) => note.id === id ? { ...note, deletedAt: null, updatedAt: new Date().toISOString() } : note) });
  }, [commit, data]);

  const permanentlyDeleteNote = useCallback(async (id: string) => {
    await commit({ ...data, notes: data.notes.filter((note) => note.id !== id) });
  }, [commit, data]);

  const duplicateNote = useCallback(async (id: string) => {
    const source = data.notes.find((note) => note.id === id);
    if (!source) return null;
    const now = new Date().toISOString();
    const title = source.title ? `${source.title} — نسخة` : "ملاحظة بلا عنوان — نسخة";
    const stats = calculateTextStats(`${title}\n${source.content}`);
    const copy: Note = { ...source, id: createId("note"), title, ...stats, createdAt: now, updatedAt: now, isPinned: false, deletedAt: null };
    await commit({ ...data, notes: [copy, ...data.notes] });
    return copy;
  }, [commit, data]);

  const toggleField = useCallback(async (id: string, field: "isFavorite" | "isPinned") => {
    await commit({ ...data, notes: data.notes.map((note) => note.id === id ? { ...note, [field]: !note[field], updatedAt: new Date().toISOString() } : note) });
  }, [commit, data]);

  const addFolder = useCallback(async (name: string, color: string) => {
    const folder: Folder = { id: createId("folder"), name: name.trim(), color, createdAt: new Date().toISOString() };
    await commit({ ...data, folders: [...data.folders, folder] });
    return folder;
  }, [commit, data]);

  const renameFolder = useCallback(async (id: string, name: string) => {
    await commit({ ...data, folders: data.folders.map((folder) => folder.id === id ? { ...folder, name: name.trim() } : folder) });
  }, [commit, data]);

  const removeFolder = useCallback(async (id: string) => {
    await commit({
      ...data,
      folders: data.folders.filter((folder) => folder.id !== id),
      notes: data.notes.map((note) => note.folderId === id ? { ...note, folderId: null, updatedAt: new Date().toISOString() } : note),
    });
  }, [commit, data]);

  const updateSettings = useCallback(async (settings: Partial<AppSettings>) => {
    await commit({ ...data, settings: { ...data.settings, ...settings } });
  }, [commit, data]);

  const search = useCallback((query: string, folderId?: string | null, sortOption?: SortOption) => {
    const folderFiltered = data.notes.filter((note) => !note.deletedAt && (folderId === undefined || note.folderId === folderId));
    return sortNotes(findNotes(folderFiltered, query), sortOption ?? data.settings.sortOption);
  }, [data]);

  const replaceData = useCallback(async (nextData: NotebookData) => {
    await commit(nextData);
  }, [commit]);

  const value = useMemo<NotebookContextValue>(() => ({
    data,
    isReady,
    notes: data.notes,
    activeNotes: data.notes.filter((note) => !note.deletedAt),
    trashedNotes: data.notes.filter((note) => !!note.deletedAt),
    createNote,
    updateNote,
    deleteNote,
    restoreNote,
    permanentlyDeleteNote,
    duplicateNote,
    toggleFavorite: (id) => toggleField(id, "isFavorite"),
    togglePinned: (id) => toggleField(id, "isPinned"),
    addFolder,
    renameFolder,
    removeFolder,
    updateSettings,
    search,
    replaceData,
  }), [addFolder, createNote, data, deleteNote, duplicateNote, isReady, permanentlyDeleteNote, removeFolder, renameFolder, replaceData, restoreNote, search, toggleField, updateNote, updateSettings]);

  return <NotebookContext.Provider value={value}>{children}</NotebookContext.Provider>;
}

export function useNotebook(): NotebookContextValue {
  const context = useContext(NotebookContext);
  if (!context) throw new Error("useNotebook must be used within NotebookProvider");
  return context;
}
