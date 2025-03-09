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
    | "title"
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
    anonymous?: boolean;
    uid: string;
  }
) => {
  const coord = [data.lat, data.long];
  const osm = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${coord[0]}&lon=${coord[1]}&format=json`,
    {
      headers: {
        "User-Agent": "DropIt v0.1",
      },
    }
  );

  const osmResponse = await osm.json();

  console.log("OSM Response", osmResponse);

  const docRef = await addDoc(collection(db, "posts"), {
    ...data,
    osm: osmResponse,
  });

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
