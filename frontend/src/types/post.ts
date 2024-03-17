import { User } from "./user";
export type Post = {
  _id: string;
  title: string;
  description: string;
  videoId: string;
  user: User;
  voted: boolean;
  upvotes: number;
  downvotes: number;
};
