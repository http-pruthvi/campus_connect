import { getFirestore, collection, addDoc, getDocs, query, orderBy } from "firebase/firestore";
import { auth } from "../firebase";

const db = getFirestore();

export const addNotice = async (notice) => {
  try {
    await addDoc(collection(db, "notices"), notice);
  } catch (err) {
    console.error("Error adding notice:", err);
  }
};

export const getAllNotices = async () => {
  const q = query(collection(db, "notices"), orderBy("date", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
