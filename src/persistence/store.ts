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
  await tx.store.put(serialize(state), "active");
  await tx.done;
  db.close();
}
export async function loadGame(): Promise<GameState | null> {
  const db = await database();
  const text = await db.get("snapshots", "active");
  db.close();
  return typeof text === "string" ? deserialize(text) : null;
}
