import { atom } from 'jotai';

export interface Comment {
  _id: string;
  user: {
    _id: string;
    name: string;
  };
  text: string;
  createdAt: string;
}

export interface Post {
  _id: string;
  content: string;
  author: {
    _id: string;
    name: string;
  };
  status: 'pending' | 'approved' | 'disapproved' | 'removed';
  likes: string[];
  comments: Comment[];
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PostsState {
  posts: Post[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
}

// Initial posts state
const initialPostsState: PostsState = {
  posts: [],
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 1
};

// Posts atom
export const postsAtom = atom<PostsState>(initialPostsState);

// Current post atom (for viewing a single post)
export const currentPostAtom = atom<{
  post: Post | null;
  loading: boolean;
  error: string | null;
}>({
  post: null,
  loading: false,
  error: null
});

// Admin posts state (for different status tabs)
export const adminPostsAtom = atom<{
  pending: PostsState;
  approved: PostsState;
  disapproved: PostsState;
  removed: PostsState;
  activeTab: 'pending' | 'approved' | 'disapproved' | 'removed';
}>({
  pending: { ...initialPostsState },
  approved: { ...initialPostsState },
  disapproved: { ...initialPostsState },
  removed: { ...initialPostsState },
  activeTab: 'pending'
});
