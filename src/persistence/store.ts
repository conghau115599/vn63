import { openDB } from "idb";
import type { GameState } from "../simulation/types";
import { deserialize, serialize } from "../simulation/save";
const database = () =>
  openDB("vn63-monthly-v2", 1, {
    upgrade(db) {
      db.createObjectStore("snapshots");
    },
  });
export async function saveGame(state: GameState) {
  const db = await database();
  const tx = db.transaction("snapshots", "readwrite");
  const previous = await tx.store.get("active");
  let needsBackup = false;
  if (state.calendarMode && typeof previous === "string") {
    try {
      needsBackup = !JSON.parse(previous).calendarMode;
    } catch {
      needsBackup = true;
    }
  }
  if (needsBackup && !(await tx.store.get("backup-before-weekly-v1")))
    await tx.store.put(previous, "backup-before-weekly-v1");
  await tx.store.put(serialize(state), "active");
  await tx.done;
  db.close();
}
export async function loadRecovery(): Promise<string | null> {
  const db = await database();
  const value = await db.get("snapshots", "backup-before-weekly-v1");
  db.close();
  return typeof value === "string" ? value : null;
}
export async function loadGame(): Promise<GameState | null> {
  const db = await database();
  const text = await db.get("snapshots", "active");
  db.close();
  return typeof text === "string" ? deserialize(text) : null;
}
