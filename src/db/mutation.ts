import { db } from "@/firebase";
import {
  addDoc,
  collection,
  doc,
  increment,
  updateDoc,
} from "firebase/firestore";
import { Post } from "./schema";

export const addPost = async (
  data: Pick<
    Post,
    | "content"
    | "private"
    | "author"
    | "likes"
    | "hates"
    | "createdAt"
    | "updatedAt"
  > & {
    lat: number;
    long: number;
  }
) => {
  const docRef = await addDoc(collection(db, "posts"), data);
  return docRef.id;
};

export const addLikes = async (
  postId: string,
  sign: "increament" | "decreament"
) => {
  const docRef = doc(db, "posts", postId);

  await updateDoc(docRef, {
    likes: increment(sign === "increament" ? 1 : -1),
  });
};
