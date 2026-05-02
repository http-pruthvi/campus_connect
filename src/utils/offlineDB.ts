import { openDB } from "idb";

const dbPromise = openDB("CampusConnectDB", 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("notices")) {
      db.createObjectStore("notices", { keyPath: "id" });
    }
  },
});

export const saveNoticesOffline = async (notices) => {
  const db = await dbPromise;
  const tx = db.transaction("notices", "readwrite");
  const store = tx.objectStore("notices");
  await store.clear(); // remove old data
  notices.forEach((n) => store.put(n));
  await tx.done;
};

export const getNoticesOffline = async () => {
  const db = await dbPromise;
  return await db.getAll("notices");
};
