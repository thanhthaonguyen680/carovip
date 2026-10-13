"use client";

// No accounts: everything a player owns (nickname, finished games) lives in this browser's
// localStorage. Read through useSyncExternalStore so server render and hydration agree.

import { useSyncExternalStore } from "react";
import type { Level } from "@/lib/ai";
import type { Stone } from "@/lib/game";

export type GameMode = "ai" | "local";

export type GameRecord = {
  id: string;
  mode: GameMode;
  level?: Level;
  // Which stone the person played against the computer (unset for two players on one device).
  humanStone?: Stone;
  moves: number[];
  winner: Stone | "draw";
  endedAt: number;
};

const HISTORY_KEY = "carovip:history";
const NAME_KEY = "carovip:name";
const CHANGE_EVENT = "carovip:storage";
const MAX_RECORDS = 100;
const NO_RECORDS: GameRecord[] = [];
export const DEFAULT_NAME = "Kỳ thủ";

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeRaw(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // Private mode or storage full: the game still works, it just isn't remembered.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

// getSnapshot must return the same reference until the data changes, so parse once per raw value.
let historyRaw: string | null = null;
let historyParsed: GameRecord[] = NO_RECORDS;

function readHistory(): GameRecord[] {
  const raw = readRaw(HISTORY_KEY);
  if (raw !== historyRaw) {
    historyRaw = raw;
    try {
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      historyParsed = Array.isArray(parsed) ? (parsed as GameRecord[]) : NO_RECORDS;
    } catch {
      historyParsed = NO_RECORDS;
    }
  }
  return historyParsed;
}

export function useHistory(): GameRecord[] {
  return useSyncExternalStore(subscribe, readHistory, () => NO_RECORDS);
}

export function saveGame(record: Omit<GameRecord, "id" | "endedAt">) {
  const endedAt = Date.now();
  const full: GameRecord = { ...record, id: `${endedAt}-${Math.random().toString(36).slice(2, 8)}`, endedAt };
  writeRaw(HISTORY_KEY, JSON.stringify([full, ...readHistory()].slice(0, MAX_RECORDS)));
}

export function clearHistory() {
  writeRaw(HISTORY_KEY, null);
}

function readName(): string {
  const stored = readRaw(NAME_KEY);
  if (stored !== null) return stored;
  const generated = `${DEFAULT_NAME} ${1000 + Math.floor(Math.random() * 9000)}`;
  try {
    window.localStorage.setItem(NAME_KEY, generated);
  } catch {
    return DEFAULT_NAME;
  }
  return generated;
}

export function usePlayerName(): string {
  return useSyncExternalStore(subscribe, readName, () => DEFAULT_NAME);
}

export function setPlayerName(name: string) {
  writeRaw(NAME_KEY, name);
}
