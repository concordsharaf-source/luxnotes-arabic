export type NoteImage = {
  id: string;
  uri: string;
  width?: number;
  height?: number;
  caption?: string;
  createdAt: string;
};

export type NoteBlock =
  | { id: string; type: "text"; text: string }
  | { id: string; type: "image"; imageId: string };

export type Note = {
  id: string;
  title: string;
  content: string;
  blocks: NoteBlock[];
  createdAt: string;
  updatedAt: string;
  folderId: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  labelColor: string | null;
  images: NoteImage[];
  wordCount: number;
  characterCount: number;
  deletedAt: string | null;
};

export type Folder = {
  id: string;
  name: string;
  color: string;
  createdAt: string;
};

export type SortOption = "updated_desc" | "created_desc" | "created_asc" | "title_asc" | "title_desc";
export type ThemeMode = "light" | "dark" | "system";
export type FontFamily = "cairo" | "tajawal" | "system";
export type AppLanguage = "auto" | "ar" | "en";

export type AppSettings = {
  themeMode: ThemeMode;
  fontFamily: FontFamily;
  fontSize: number;
  sortOption: SortOption;
  language: AppLanguage;
  lockEnabled: boolean;
  pinHash: string | null;
  biometricEnabled: boolean;
};

export type NotebookData = {
  version: 1;
  notes: Note[];
  folders: Folder[];
  settings: AppSettings;
};

export type NoteDraft = Pick<Note, "title" | "content" | "folderId"> &
  Partial<Pick<Note, "images" | "blocks">>;
