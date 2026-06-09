import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/apiClient';

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

  const usePostComments = () => {
    return useQuery({
      queryKey: ['comments', postId],
      queryFn: () => {
        return apiClient.get<{ comments: Comment[]; nextCursor: string | null }>(
          `/posts/${postId}/comments`
        );
      },
      staleTime: 5000,
    });
  };

  const createCommentMutation = useMutation({
    mutationFn: (newComment: { content: string; parentComment?: string | null }) => {
      return apiClient.post<Comment>(`/posts/${postId}/comments`, newComment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const likeCommentMutation = useMutation({
    mutationFn: (commentId: string) => {
      return apiClient.post<Comment>(`/comments/${commentId}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => {
      return apiClient.delete(`/comments/${commentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
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
