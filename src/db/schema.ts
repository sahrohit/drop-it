import { FieldValue } from "firebase/firestore";

export type Post = {
  id: string;
  title: string;
  content: string;
  createdAt: FieldValue;
  updatedAt: FieldValue;
  lat: number;
  long: number;
  remarks: string;

  private: "public" | "private" | "location";
  category: string;
  tags: string[];

  likes: number;
  hates: number;

  author: {
    displayName?: string;
    email?: string;
    photoURL?: string;
  };
};
