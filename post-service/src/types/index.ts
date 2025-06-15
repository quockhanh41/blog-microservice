export interface Post {
  id: string;
  author_id: string;
  username: string;
  title: string;
  content: string;
  created_at: Date;
}

export interface UserReference {
  user_id: string;
  username: string;
  updated_at: Date;
}

export interface CreatePostRequest {
  title: string;
  content: string;
}

export interface GetPostsQuery {
  user_ids?: string[];
  limit?: number;
  sort?: 'asc' | 'desc';
}

export interface UserUpdatedEvent {
  user_id: string;
  username: string;
  timestamp: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  created_at: string;
}
