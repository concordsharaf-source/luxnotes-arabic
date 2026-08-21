import { describe, expect, it } from "vitest";

import { calculateTextStats, detectWritingDirection, findNotes, getExcerpt, normalizeSearchText, sortNotes } from "@/lib/notebook-utils";
import type { Note } from "@/types/note";

const note = (id: string, title: string, content: string, updatedAt: string, isPinned = false): Note => ({
  id,
  title,
  content,
  blocks: [],
  createdAt: updatedAt,
  updatedAt,
  folderId: null,
  isFavorite: false,
  isPinned,
  labelColor: null,
  images: [],
  wordCount: 0,
  characterCount: 0,
  deletedAt: null,
});

describe("notebook utilities", () => {
  it("counts Arabic and English words while preserving character count", () => {
    expect(calculateTextStats("مرحبا بالعالم Hello world")).toEqual({ wordCount: 4, characterCount: 25 });
  });

  it("detects text direction from the first strong character", () => {
    expect(detectWritingDirection("   مرحباً، Hello")).toBe("rtl");
    expect(detectWritingDirection("  A paragraph بالعربية")).toBe("ltr");
  });

  it("searches titles and note content without case sensitivity", () => {
    const notes = [note("1", "فكرة بحث", "محتوى قصير", "2026-01-01"), note("2", "Essay", "A SEARCHABLE paragraph", "2026-01-02")];
    expect(findNotes(notes, "search").map((item) => item.id)).toEqual(["2"]);
    expect(findNotes(notes, "فكرة").map((item) => item.id)).toEqual(["1"]);
  });

  it("normalizes Arabic composed and decomposed forms during search", () => {
    const notes = [note("1", "أفكار اليوم", "", "2026-01-01")];
    expect(normalizeSearchText("أفكار")).toBe(normalizeSearchText("أفكار"));
    expect(findNotes(notes, "أفكار").map((item) => item.id)).toEqual(["1"]);
  });

  it("keeps pinned notes before notes sorted by date", () => {
    const sorted = sortNotes([note("1", "أ", "", "2026-01-03"), note("2", "ب", "", "2026-01-01", true)], "updated_desc");
    expect(sorted.map((item) => item.id)).toEqual(["2", "1"]);
  });

  it("creates a readable short excerpt", () => {
    expect(getExcerpt("  نص   منسق   جيداً  ")).toBe("نص منسق جيداً");
  });
});
