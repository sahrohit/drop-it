export type Post = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  latitude: number;
  longitude: number;
  remarks: string;

  private: "public" | "private" | "location";
  category: string;
  tags: string[];
};
