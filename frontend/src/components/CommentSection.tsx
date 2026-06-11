import React, { useState } from "react";
import { useComments } from "../hooks/useComments";
import { useAuth } from "../context/AuthContext";

interface CommentSectionProps {
  postId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const { user } = useAuth();
  const {
    usePostComments,
    createComment,
    isCreatingComment,
    likeComment,
    deleteComment,
  } = useComments(postId);

  const { data, isLoading } = usePostComments();
  const [newCommentText, setNewCommentText] = useState("");
  const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const getInitials = (firstName?: string, lastName?: string) => {
    return (
      `${(firstName || "").charAt(0)}${(lastName || "").charAt(0)}`.toUpperCase() ||
      "?"
    );
  };

  const handleCreateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    try {
      await createComment({ content: newCommentText, parentComment: null });
      setNewCommentText("");
    } catch (err) {
      alert((err as any)?.message || "Failed to create comment");
      console.error("Failed to create comment:", err);
    }
  };

  const handleCreateReply = async (
    e: React.FormEvent,
    parentCommentId: string,
  ) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      await createComment({
        content: replyText,
        parentComment: parentCommentId,
      });
      setReplyText("");
      setReplyToCommentId(null);
    } catch (err) {
      alert((err as any)?.message || "Failed to create comment");
      console.error("Failed to create reply:", err);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const diff = Math.floor((new Date().getTime() - date.getTime()) / 1000); // in seconds
    if (diff < 60) return "Just now";
    const mins = Math.floor(diff / 60);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-3 text-muted" style={{ fontSize: "13px" }}>
        Loading comments...
      </div>
    );
  }

  const comments = data?.comments || [];

  return (
    <div className="mt-2">
      {/* Create Comment Form */}
      <div
        style={{
          background: "#F0F2F5",
          borderRadius: "20px",
          padding: "6px 12px",
        }}
        className="mb-3"
      >
        <form
          className="d-flex align-items-center w-100"
          onSubmit={handleCreateComment}
        >
          <div
            className="d-flex align-items-center flex-grow-1 me-2"
            style={{ gap: "10px" }}
          >
            <div
              className="avatar-fallback d-flex align-items-center justify-content-center bg-primary text-white rounded-circle fw-bold"
              style={{
                width: "36px",
                height: "36px",
                minWidth: "36px",
                fontSize: "12px",
              }}
            >
              {getInitials(user?.firstName, user?.lastName)}
            </div>
            <textarea
              className="form-control"
              placeholder="Write a comment..."
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              style={{
                resize: "none",
                height: "36px",
                border: "none",
                background: "transparent",
                outline: "none",
                boxShadow: "none",
                fontSize: "13px",
                padding: "6px 0",
              }}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-sm px-3 d-flex align-items-center justify-content-center"
            disabled={isCreatingComment || !newCommentText.trim()}
            style={{
              fontSize: "12px",
              borderRadius: "16px",
              height: "32px",
              fontWeight: "500",
            }}
          >
            Comment
          </button>
        </form>
      </div>

      {/* Comments List */}
      <div
        className="comments-list mt-3 d-flex flex-column"
        style={{ gap: "16px" }}
      >
        {comments.map((comment) => {
          const hasLiked = comment.likedBy.includes(user?._id || "");
          return (
            <div key={comment._id} className="d-flex flex-column">
              {/* Parent Comment block */}
              <div className="d-flex align-items-start w-100">
                <div className="me-2" style={{ flexShrink: 0 }}>
                  <div
                    className="avatar-fallback d-flex align-items-center justify-content-center bg-secondary text-white rounded-circle fw-semibold"
                    style={{
                      width: "36px",
                      height: "36px",
                      minWidth: "36px",
                      fontSize: "12px",
                    }}
                  >
                    {getInitials(
                      comment.author?.firstName,
                      comment.author?.lastName,
                    )}
                  </div>
                </div>
                <div
                  className="flex-grow-1"
                  style={{ maxWidth: "calc(100% - 44px)" }}
                >
                  {/* Bubble content */}
                  <div
                    style={{
                      background: "#F0F2F5",
                      padding: "10px 14px",
                      borderRadius: "18px",
                      width: "fit-content",
                      maxWidth: "100%",
                      position: "relative",
                      textAlign: "left",
                    }}
                  >
                    <h4
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#112032",
                        margin: "0 0 2px 0",
                        textAlign: "left",
                      }}
                    >
                      {comment.author?.firstName} {comment.author?.lastName}
                    </h4>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#1c1e21",
                        lineHeight: "1.4",
                        margin: 0,
                        whiteSpace: "pre-wrap",
                        textAlign: "left",
                      }}
                    >
                      {comment.content}
                    </p>

                    {/* Total Reactions badge overlay */}
                    {comment.likedBy.length > 0 && (
                      <div
                        className="d-flex align-items-center bg-white shadow-sm px-1.5 py-0.5"
                        style={{
                          position: "absolute",
                          right: "-10px",
                          bottom: "-10px",
                          borderRadius: "10px",
                          border: "1px solid #e4e6eb",
                          padding: "2px 6px",
                          gap: "3px",
                          zIndex: 1,
                        }}
                      >
                        <span style={{ fontSize: "10px" }}>👍</span>
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: "600",
                            color: "#65676b",
                          }}
                        >
                          {comment.likedBy.length}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions line underneath the bubble */}
                  <div
                    className="d-flex align-items-center text-muted mt-1 ms-2"
                    style={{
                      gap: "12px",
                      fontSize: "11px",
                      justifyContent: "flex-start",
                      textAlign: "left",
                    }}
                  >
                    <span
                      style={{
                        cursor: "pointer",
                        fontWeight: hasLiked ? "600" : "normal",
                      }}
                      className={hasLiked ? "text-primary" : ""}
                      onClick={() => likeComment(comment._id)}
                    >
                      Like
                    </span>
                    <span
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setReplyToCommentId(
                          replyToCommentId === comment._id ? null : comment._id,
                        );
                        setReplyText("");
                      }}
                    >
                      Reply
                    </span>
                    {user?._id === comment.author?._id && (
                      <span
                        style={{ cursor: "pointer" }}
                        className="text-danger"
                        onClick={() => deleteComment(comment._id)}
                      >
                        Delete
                      </span>
                    )}
                    <span>{formatTime(comment.createdAt)}</span>
                  </div>

                  {/* Reply Input Box nested directly under bubble and actions */}
                  {replyToCommentId === comment._id && (
                    <div
                      className="mt-2 ms-2 p-2"
                      style={{ background: "#F0F2F5", borderRadius: "16px" }}
                    >
                      <form
                        className="d-flex align-items-center w-100"
                        onSubmit={(e) => handleCreateReply(e, comment._id)}
                      >
                        <div
                          className="avatar-fallback me-2 d-flex align-items-center justify-content-center bg-primary text-white rounded-circle fw-bold"
                          style={{
                            width: "28px",
                            height: "28px",
                            minWidth: "28px",
                            fontSize: "10px",
                          }}
                        >
                          {getInitials(user?.firstName, user?.lastName)}
                        </div>
                        <textarea
                          className="form-control flex-grow-1 me-2"
                          placeholder="Write a reply..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          style={{
                            resize: "none",
                            height: "32px",
                            border: "none",
                            background: "transparent",
                            outline: "none",
                            boxShadow: "none",
                            fontSize: "12px",
                            padding: "4px 0",
                          }}
                        />
                        <div
                          className="d-flex align-items-center"
                          style={{ gap: "6px" }}
                        >
                          <button
                            type="button"
                            className="btn btn-light btn-sm px-2 py-1"
                            onClick={() => setReplyToCommentId(null)}
                            style={{ fontSize: "10px", borderRadius: "12px" }}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="btn btn-primary btn-sm px-2 py-1"
                            disabled={!replyText.trim()}
                            style={{ fontSize: "10px", borderRadius: "12px" }}
                          >
                            Reply
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Nested Comment Replies List */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div
                      className="replies-container mt-2"
                      style={{
                        borderLeft: "2px solid #dee2e6",
                        paddingLeft: "12px",
                      }}
                    >
                      {comment.replies.map((reply) => {
                        const replyHasLiked = reply.likedBy.includes(
                          user?._id || "",
                        );
                        return (
                          <div
                            key={reply._id}
                            className="d-flex align-items-start mt-2"
                          >
                            <div className="me-2" style={{ flexShrink: 0 }}>
                              <div
                                className="avatar-fallback d-flex align-items-center justify-content-center bg-info text-white rounded-circle fw-semibold"
                                style={{
                                  width: "28px",
                                  height: "28px",
                                  minWidth: "28px",
                                  fontSize: "10px",
                                }}
                              >
                                {getInitials(
                                  reply.author?.firstName,
                                  reply.author?.lastName,
                                )}
                              </div>
                            </div>
                            <div
                              className="flex-grow-1"
                              style={{ maxWidth: "calc(100% - 36px)" }}
                            >
                              {/* Reply Bubble content */}
                              <div
                                style={{
                                  background: "#F0F2F5",
                                  padding: "8px 12px",
                                  borderRadius: "16px",
                                  width: "fit-content",
                                  maxWidth: "100%",
                                  position: "relative",
                                  textAlign: "left",
                                }}
                              >
                                <h5
                                  style={{
                                    fontSize: "12px",
                                    fontWeight: "600",
                                    color: "#112032",
                                    margin: "0 0 2px 0",
                                    textAlign: "left",
                                  }}
                                >
                                  {reply.author?.firstName}{" "}
                                  {reply.author?.lastName}
                                </h5>
                                <p
                                  style={{
                                    fontSize: "12px",
                                    color: "#1c1e21",
                                    lineHeight: "1.4",
                                    margin: 0,
                                    whiteSpace: "pre-wrap",
                                    textAlign: "left",
                                  }}
                                >
                                  {reply.content}
                                </p>

                                {/* Reply Total Reactions badge overlay */}
                                {reply.likedBy.length > 0 && (
                                  <div
                                    className="d-flex align-items-center bg-white shadow-sm px-1 py-0.5"
                                    style={{
                                      position: "absolute",
                                      right: "-8px",
                                      bottom: "-8px",
                                      borderRadius: "8px",
                                      border: "1px solid #e4e6eb",
                                      padding: "1px 4px",
                                      gap: "2px",
                                      zIndex: 1,
                                    }}
                                  >
                                    <span style={{ fontSize: "8px" }}>👍</span>
                                    <span
                                      style={{
                                        fontSize: "8px",
                                        fontWeight: "600",
                                        color: "#65676b",
                                      }}
                                    >
                                      {reply.likedBy.length}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Reply Actions line */}
                              <div
                                className="d-flex align-items-center text-muted mt-1 ms-2"
                                style={{
                                  gap: "10px",
                                  fontSize: "10px",
                                  justifyContent: "flex-start",
                                  textAlign: "left",
                                }}
                              >
                                <span
                                  style={{
                                    cursor: "pointer",
                                    fontWeight: replyHasLiked
                                      ? "600"
                                      : "normal",
                                  }}
                                  className={
                                    replyHasLiked ? "text-primary" : ""
                                  }
                                  onClick={() => likeComment(reply._id)}
                                >
                                  Like
                                </span>
                                {user?._id === reply.author?._id && (
                                  <span
                                    style={{ cursor: "pointer" }}
                                    className="text-danger"
                                    onClick={() => deleteComment(reply._id)}
                                  >
                                    Delete
                                  </span>
                                )}
                                <span>{formatTime(reply.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {comments.length === 0 && (
          <div
            className="text-center py-3 text-muted"
            style={{ fontSize: "13px" }}
          >
            No comments yet. Be the first to comment!
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
