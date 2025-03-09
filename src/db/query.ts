import { db } from "@/firebase";
import {
  and,
  collection,
  DocumentData,
  query,
  Query,
  where,
} from "firebase/firestore";
import { Post } from "./schema";

export const getPosts = (lat?: number, long?: number) => {
  const latFixed = Number(lat?.toFixed(3)) ?? 0;
  const longFixed = Number(long?.toFixed(3)) ?? 0;

  return query(
    collection(db, "posts"),
    and(
      where("lat", ">", latFixed - 0.005),
      where("lat", "<", latFixed + 0.005),
      where("long", ">", longFixed - 0.005),
      where("long", "<", longFixed + 0.005)
    )
  ) as Query<Post, DocumentData>;
};
