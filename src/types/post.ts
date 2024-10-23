import { ListResponse, Response } from "./response";

export interface Post {
  id: number;
  title: string;
  content: string;
  imgUrl: string;
  createdAt: string;
  userId: string;
}

export type PostResponse = Response<Post, "post">;
export type PostsResponse = ListResponse<Post, "posts">;
