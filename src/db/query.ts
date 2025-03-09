import { db } from "@/firebase";
import {
  and,
  collection,
  DocumentData,
  or,
  query,
  Query,
  where,
} from "firebase/firestore";
import { Post } from "./schema";

export const getPosts = (uid?: string, lat?: number, long?: number) => {
  const latFixed = Number(lat?.toFixed(3)) ?? 0;
  const longFixed = Number(long?.toFixed(3)) ?? 0;

  return query(
    collection(db, "posts"),
    and(
      where("lat", ">", latFixed - 0.005),
      where("lat", "<", latFixed + 0.005),
      where("long", ">", longFixed - 0.005),
      where("long", "<", longFixed + 0.005),
      or(where("private", "==", "public"), where("uid", "==", uid))
    )
  ) as Query<Post, DocumentData>;
};

export const getPostsByUID = (uid: string) => {
  return query(collection(db, "posts"), where("uid", "==", uid)) as Query<
    Post,
    DocumentData
  >;
};
