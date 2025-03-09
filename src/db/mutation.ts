import { db } from "@/firebase";
import { addDoc, collection } from "firebase/firestore";
import { Post } from "./schema";

export const addPost = async (
  data: Pick<Post, "content" | "private"> & {
    lat: number;
    long: number;
  }
) => {
  const docRef = await addDoc(collection(db, "posts"), data);
  return docRef.id;
};
