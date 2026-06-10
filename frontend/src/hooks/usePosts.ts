import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/apiClient';

export interface Author {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Post {
  _id: string;
  content: string;
  imageUrl: string | null;
  visibility: 'public' | 'private';
  author: Author;
  likedBy: string[];
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
}

export const usePosts = () => {
  const queryClient = useQueryClient();

  const useFeed = () => {
    return useInfiniteQuery({
      queryKey: ['posts'],
      queryFn: async ({ pageParam }) => {
        return apiClient.get<{ posts: Post[]; nextCursor: string | null }>(
          `/posts?limit=10${pageParam ? `&cursor=${pageParam}` : ''}`
        );
      },
      initialPageParam: null as string | null,
      getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    });
  };

  const createPostMutation = useMutation({
    mutationFn: (formData: FormData) => {
      return apiClient.post<Post>('/posts', formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const likePostMutation = useMutation({
    mutationFn: (postId: string) => {
      return apiClient.post<Post>(`/posts/${postId}/like`);
    },
    onSuccess: (updatedPost) => {
      queryClient.setQueriesData({ queryKey: ['posts'] }, (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((post: Post) =>
              post._id === updatedPost._id ? { ...post, likedBy: updatedPost.likedBy } : post
            ),
          })),
        };
      });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: (postId: string) => {
      return apiClient.delete(`/posts/${postId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  return {
    useFeed,
    createPost: createPostMutation.mutateAsync,
    isCreating: createPostMutation.isPending,
    likePost: likePostMutation.mutateAsync,
    deletePost: deletePostMutation.mutateAsync,
  };
};
