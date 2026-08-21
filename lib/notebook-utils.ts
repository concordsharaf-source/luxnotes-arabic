import type { Note, NoteBlock, SortOption } from "@/types/note";

export function createId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function getPlainText(note: Pick<Note, "title" | "content" | "blocks">): string {
  const blocksText = note.blocks
    .filter((block): block is Extract<NoteBlock, { type: "text" }> => block.type === "text")
    .map((block) => block.text)
    .join("\n");
  return `${note.title}\n${note.content || blocksText}`.trim();
}

export function calculateTextStats(text: string): { wordCount: number; characterCount: number } {
  const normalized = text.trim().replace(/\s+/g, " ");
  return {
    wordCount: normalized ? normalized.split(" ").length : 0,
    characterCount: Array.from(text).length,
  };
}

export function normalizeSearchText(text: string): string {
  return text.normalize("NFC").toLocaleLowerCase();
}

export function withTextStats(note: Note): Note {
  const stats = calculateTextStats(`${note.title}\n${note.content}`);
  return { ...note, ...stats };
}

export function detectWritingDirection(text: string): "rtl" | "ltr" {
  const firstStrongCharacter = text.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]|[A-Za-z]/)?.[0];
  return firstStrongCharacter && /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(firstStrongCharacter)
    ? "rtl"
    : "ltr";
}

export function sortNotes(notes: Note[], option: SortOption): Note[] {
  const pinnedFirst = (left: Note, right: Note) => Number(right.isPinned) - Number(left.isPinned);
  return [...notes].sort((left, right) => {
    const pinnedComparison = pinnedFirst(left, right);
    if (pinnedComparison !== 0) return pinnedComparison;
    if (option === "title_asc") return left.title.localeCompare(right.title, "ar");
    if (option === "title_desc") return right.title.localeCompare(left.title, "ar");
    if (option === "created_asc") return left.createdAt.localeCompare(right.createdAt);
    if (option === "created_desc") return right.createdAt.localeCompare(left.createdAt);
    return right.updatedAt.localeCompare(left.updatedAt);
  });
}

export function findNotes(notes: Note[], query: string): Note[] {
  const normalizedQuery = normalizeSearchText(query.trim());
  if (!normalizedQuery) return notes;
  return notes.filter((note) => normalizeSearchText(getPlainText(note)).includes(normalizedQuery));
}

export function getExcerpt(content: string, limit = 128): string {
  const normalized = content.replace(/\s+/g, " ").trim();
  return normalized.length > limit ? `${normalized.slice(0, limit).trimEnd()}…` : normalized;
}

export function formatDate(value: string, locale = "ar"): string {
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}
