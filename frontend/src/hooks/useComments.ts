import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Post } from "./usePosts";
import { apiClient } from "../services/apiClient";

export interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  post: string;
  parentComment: string | null;
  likedBy: string[];
  createdAt: string;
  updatedAt: string;
  replies?: Comment[];
}

export const useComments = (postId: string) => {
  const queryClient = useQueryClient();

  const adjustPostCommentsCount = (delta: number) => {
    queryClient.setQueriesData({ queryKey: ["posts"] }, (oldData: any) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        pages: oldData.pages.map((page: any) => ({
          ...page,
          posts: page.posts.map((post: Post) =>
            post._id === postId
              ? {
                  ...post,
                  commentsCount: Math.max(0, (post.commentsCount || 0) + delta),
                }
              : post,
          ),
        })),
      };
    });
  };

  const usePostComments = () => {
    return useQuery({
      queryKey: ["comments", postId],
      queryFn: () => {
        return apiClient.get<{
          comments: Comment[];
          nextCursor: string | null;
        }>(`/posts/${postId}/comments`);
      },
      staleTime: 5000,
    });
  };

  const createCommentMutation = useMutation({
    mutationFn: (newComment: {
      content: string;
      parentComment?: string | null;
    }) => {
      return apiClient.post<Comment>(`/posts/${postId}/comments`, newComment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      adjustPostCommentsCount(1);
    },
  });

  const likeCommentMutation = useMutation({
    mutationFn: (commentId: string) => {
      return apiClient.post<Comment>(`/comments/${commentId}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => {
      return apiClient.delete<{ removed: number }>(`/comments/${commentId}`);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      const removedCount = typeof result?.removed === "number" ? result.removed : 1;
      adjustPostCommentsCount(-removedCount);
    },
  });

  return {
    usePostComments,
    createComment: createCommentMutation.mutateAsync,
    isCreatingComment: createCommentMutation.isPending,
    likeComment: likeCommentMutation.mutateAsync,
    deleteComment: deleteCommentMutation.mutateAsync,
  };
};
