import { BookResponse, BooksResponse } from "./book";
import { CommentResponse, CommentsResponse } from "./comment";
import { PostResponse, PostsResponse } from "./post";
import { ReviewResponse, ReviewsResponse } from "./review";
import { TodoResponse, TodosResponse } from "./todo";
import { UserResponse, UsersResponse } from "./user";

// Response 타입 정의
export type Response<T, K extends string> = {
  message: string;
} & {
  [key in K]: T;
};

// ListResponse 타입 정의
export type ListResponse<T, K extends string> = {
  message: string;
  page?: number;
  limit?: number;
  hasNextPage?: boolean;
} & {
  [key in K]: T[];
};

export type DummyDataResonses =
  | UserResponse
  | UsersResponse
  | TodoResponse
  | TodosResponse
  | PostResponse
  | PostsResponse
  | CommentResponse
  | CommentsResponse
  | BookResponse
  | BooksResponse
  | ReviewResponse
  | ReviewsResponse
  | null;
