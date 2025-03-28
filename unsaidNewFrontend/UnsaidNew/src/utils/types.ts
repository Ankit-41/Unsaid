export interface Comment {
  id: string;
  username: string;
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  parentId?: string;
  replies?: Comment[];
}

export interface Post {
  id: string;
  username: string;
  content: string;
  imageUrl?: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  comments: Comment[];
  spicyLevel?: number;
  isAnonymous?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}