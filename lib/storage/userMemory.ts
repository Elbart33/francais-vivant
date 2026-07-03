import { SituationAttempt, UserMemory } from "@/types";

const STORAGE_KEY = "fv_user_memory_v1";

const emptyMemory: UserMemory = {
  attempts: [],
  errorFrequency: {},
  situationsCompleted: [],
  streakDays: 0,
  lastVisit: null,
};

export function loadMemory(): UserMemory {
  if (typeof window === "undefined") return emptyMemory;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyMemory;
    const parsed = JSON.parse(raw) as UserMemory;
    return { ...emptyMemory, ...parsed };
  } catch {
    return emptyMemory;
  }
}

export function saveMemory(memory: UserMemory) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
}

export function recordAttempt(attempt: SituationAttempt): UserMemory {
  const memory = loadMemory();

  memory.attempts.push(attempt);
  if (memory.attempts.length > 200) {
    memory.attempts = memory.attempts.slice(-200);
  }

  for (const note of [...attempt.correctionNotes, ...attempt.improvementNotes]) {
    memory.errorFrequency[note.ruleId] = (memory.errorFrequency[note.ruleId] || 0) + 1;
  }

  if (!memory.situationsCompleted.includes(attempt.situationId)) {
    memory.situationsCompleted.push(attempt.situationId);
  }

  memory.streakDays = computeStreak(memory.lastVisit, memory.streakDays);
  memory.lastVisit = new Date().toISOString();

  saveMemory(memory);
  return memory;
}

function computeStreak(lastVisit: string | null, currentStreak: number): number {
  if (!lastVisit) return 1;
  const last = new Date(lastVisit);
  const now = new Date();
  const diffDays = Math.floor(
    (stripTime(now).getTime() - stripTime(last).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays === 0) return currentStreak || 1;
  if (diffDays === 1) return (currentStreak || 0) + 1;
  return 1;
}

function stripTime(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function topErrorIds(memory: UserMemory, limit = 5): string[] {
  return Object.entries(memory.errorFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);
}

export function resetMemory() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
