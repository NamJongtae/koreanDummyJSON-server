import { ListResponse, Response } from "./response";

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  userId: number;
  postId: number;
}

export type CommentResponse = Response<Comment, "comment">;
export type CommentsResponse = ListResponse<Comment, "comments">;
