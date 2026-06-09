import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePosts } from '../hooks/usePosts';
import type { Post } from '../hooks/usePosts';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';
import CommentSection from './CommentSection';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { user } = useAuth();
  const { likePost, deletePost } = usePosts();

  const [isCommentsExpanded, setIsCommentsExpanded] = useState(false);
  const [isLikesModalOpen, setIsLikesModalOpen] = useState(false);
  const [isPostDropdownOpen, setIsPostDropdownOpen] = useState(false);

  // Fetch likes on-demand for the "See who liked" modal
  const { data: likesData, isLoading: isLoadingLikes } = useQuery({
    queryKey: ['postLikes', post._id],
    queryFn: () => apiClient.get<{ likes: any[] }>(`/posts/${post._id}/likes`),
    enabled: isLikesModalOpen,
  });

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${(firstName || '').charAt(0)}${(lastName || '').charAt(0)}`.toUpperCase() || '?';
  };

  const handleLike = async () => {
    try {
      await likePost(post._id);
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(post._id);
        setIsPostDropdownOpen(false);
      } catch (err) {
        console.error('Failed to delete post:', err);
      }
    }
  };

  const hasLiked = post.likedBy.includes(user?._id || '');
  const isAuthor = user?._id === post.author?._id;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const diff = Math.floor((new Date().getTime() - date.getTime()) / 1000); // in seconds
    if (diff < 60) return 'Just now';
    const mins = Math.floor(diff / 60);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16 bg-white shadow-sm rounded">
      <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
        <div className="_feed_inner_timeline_post_top d-flex justify-content-between align-items-center mb-3">
          <div className="_feed_inner_timeline_post_box d-flex align-items-center">
            {/* Fallback initials styled exactly as _post_img */}
            <div className="avatar-fallback me-3 d-flex align-items-center justify-content-center bg-primary text-white rounded-circle" style={{ width: '45px', height: '45px', fontWeight: 'bold', fontSize: '15px' }}>
              {getInitials(post.author?.firstName, post.author?.lastName)}
            </div>
            <div className="_feed_inner_timeline_post_box_txt">
              <h4 className="_feed_inner_timeline_post_box_title mb-0" style={{ fontSize: '15px', fontWeight: '600', color: '#112032', textAlign: 'left' }}>
                {post.author?.firstName} {post.author?.lastName}
              </h4>
              <p className="_feed_inner_timeline_post_box_para text-muted mb-0" style={{ fontSize: '12px', textAlign: 'left' }}>
                {formatDate(post.createdAt)} . <span className="text-capitalize" style={{ cursor: 'default' }}>{post.visibility}</span>
              </p>
            </div>
          </div>

          {/* Timeline Dropdown Toggle */}
          <div className="_feed_inner_timeline_post_box_dropdown position-relative">
            <div className="_feed_timeline_post_dropdown">
              <button
                type="button"
                className="_feed_timeline_post_dropdown_link"
                onClick={() => setIsPostDropdownOpen(!isPostDropdownOpen)}
                style={{ background: 'none', border: 'none', padding: 0 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="4" height="17" fill="none" viewBox="0 0 4 17">
                  <circle cx="2" cy="2" r="2" fill="#C4C4C4" />
                  <circle cx="2" cy="8" r="2" fill="#C4C4C4" />
                  <circle cx="2" cy="15" r="2" fill="#C4C4C4" />
                </svg>
              </button>
            </div>

            {/* Dropdown Menu List */}
            <div className={`_feed_timeline_dropdown _timeline_dropdown ${isPostDropdownOpen ? 'show' : ''}`} style={{ right: 0, top: '25px', zIndex: 100 }}>
              <ul className="_feed_timeline_dropdown_list list-unstyled mb-0">
                <li className="_feed_timeline_dropdown_item">
                  <a href="#0" className="_feed_timeline_dropdown_link text-decoration-none" onClick={(e) => { e.preventDefault(); alert('Post saved to bookmarks.'); setIsPostDropdownOpen(false); }}>
                    <span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 18 18">
                        <path stroke="#1890FF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M14.25 15.75L9 12l-5.25 3.75v-12a1.5 1.5 0 011.5-1.5h7.5a1.5 1.5 0 011.5 1.5v12z" />
                      </svg>
                    </span>
                    Save Post
                  </a>
                </li>
                <li className="_feed_timeline_dropdown_item">
                  <a href="#0" className="_feed_timeline_dropdown_link text-decoration-none" onClick={(e) => { e.preventDefault(); alert('Notifications turned on.'); setIsPostDropdownOpen(false); }}>
                    <span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="22" fill="none" viewBox="0 0 20 22">
                        <path fill="#377DFF" fillRule="evenodd" d="M7.547 19.55c.533.59 1.218.915 1.93.915.714 0 1.403-.324 1.938-.916a.777.777 0 011.09-.056c.318.284.344.77.058 1.084-.832.917-1.927 1.423-3.086 1.423h-.002c-1.155-.001-2.248-.506-3.077-1.424a.762.762 0 01.057-1.083.774.774 0 011.092.057zM9.527 0c4.58 0 7.657 3.543 7.657 6.85 0 1.702.436 2.424.899 3.19.457.754.976 1.612.976 3.233-.36 4.14-4.713 4.478-9.531 4.478-4.818 0-9.172-.337-9.528-4.413-.003-1.686.515-2.544.973-3.299l.161-.27c.398-.679.737-1.417.737-2.918C1.871 3.543 4.948 0 9.528 0zm0 1.535c-3.6 0-6.11 2.802-6.11 5.316 0 2.127-.595 3.11-1.12 3.978-.422.697-.755 1.247-.755 2.444.173 1.93 1.455 2.944 7.986 2.944 6.494 0 7.817-1.06 7.988-3.01-.003-1.13-.336-1.681-.757-2.378-.526-.868-1.12-1.851-1.12-3.978 0-2.514-2.51-5.316-6.111-5.316z" clipRule="evenodd" />
                      </svg>
                    </span>
                    Notifications
                  </a>
                </li>
                {isAuthor && (
                  <li className="_feed_timeline_dropdown_item">
                    <a href="#0" className="_feed_timeline_dropdown_link text-danger text-decoration-none" onClick={(e) => { e.preventDefault(); handleDelete(); }}>
                      <span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 18 18">
                          <path stroke="#FF4D4F" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M2.25 4.5h13.5M6 4.5V3a1.5 1.5 0 011.5-1.5h3A1.5 1.5 0 0112 3v1.5m2.25 0V15a1.5 1.5 0 01-1.5 1.5h-7.5a1.5 1.5 0 01-1.5-1.5V4.5h10.5zM7.5 8.25v4.5M10.5 8.25v4.5" />
                        </svg>
                      </span>
                      Delete Post
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Post Content Title */}
        <h4 className="_feed_inner_timeline_post_title" style={{ fontSize: '15px', fontWeight: 'normal', color: '#444', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
          {post.content}
        </h4>

        {/* Post Image Attachment */}
        {post.imageUrl && (
          <div className="_feed_inner_timeline_image mb-3 rounded overflow-hidden" style={{ maxHeight: '420px' }}>
            <img src={post.imageUrl} alt="" className="_time_img w-100" style={{ objectFit: 'cover', maxHeight: '420px' }} />
          </div>
        )}

        {/* Visibility Badge (🔒 Private — only shown to post author) */}
        {post.visibility === 'private' && isAuthor && (
          <div className="mb-3">
            <span className="badge bg-secondary py-1.5 px-2" style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              🔒 Private (Only you can see this)
            </span>
          </div>
        )}
      </div>

      {/* Reactions and Comments totals */}
      <div className="_feed_inner_timeline_total_reacts _padd_r24 _padd_l24 _mar_b26 d-flex justify-content-between align-items-center">
        <div className="_feed_inner_timeline_total_reacts_image d-flex align-items-center">
          <img src="/src/assets/images/react_img1.png" alt="Image" className="_react_img1" />
          <img src="/src/assets/images/react_img2.png" alt="Image" className="_react_img" />
          <img src="/src/assets/images/react_img3.png" alt="Image" className="_react_img _rect_img_mbl_none" />
          <button
            onClick={() => setIsLikesModalOpen(true)}
            className="btn btn-link p-0 text-decoration-none ms-2"
            style={{ fontSize: '13px', color: '#666', fontWeight: '500' }}
          >
            <span>{post.likedBy.length} likes</span>
          </button>
        </div>
        <div className="_feed_inner_timeline_total_reacts_txt d-flex" style={{ gap: '16px' }}>
          <p className="_feed_inner_timeline_total_reacts_para1 mb-0">
            <a href="#0" onClick={(e) => { e.preventDefault(); setIsCommentsExpanded(!isCommentsExpanded); }}>
              <span>{post.commentsCount}</span> Comment
            </a>
          </p>
          <p className="_feed_inner_timeline_total_reacts_para2 mb-0"><span>122</span> Share</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="_feed_inner_timeline_reaction border-top border-bottom py-1" style={{ borderColor: '#f1f3f5' }}>
        <button
          onClick={handleLike}
          className={`_feed_inner_timeline_reaction_emoji _feed_reaction ${hasLiked ? '_feed_reaction_active' : ''}`}
          style={{ background: 'transparent', border: 'none' }}
        >
          <span className="_feed_inner_timeline_reaction_link">
            <span>
              👍
              {hasLiked ? 'Liked' : 'Like'}
            </span>
          </span>
        </button>
        <button
          onClick={() => setIsCommentsExpanded(!isCommentsExpanded)}
          className="_feed_inner_timeline_reaction_comment _feed_reaction"
          style={{ background: 'transparent', border: 'none' }}
        >
          <span className="_feed_inner_timeline_reaction_link">
            Comment
          </span>
        </button>
        <button
          onClick={() => alert('Post shared successfully.')}
          className="_feed_inner_timeline_reaction_share _feed_reaction"
          style={{ background: 'transparent', border: 'none' }}
        >
          <span className="_feed_inner_timeline_reaction_link">
            Share
          </span>
        </button>
      </div>

      {/* Expanded Comments section block */}
      {isCommentsExpanded && (
        <div className="border-top mt-2 pt-3" style={{ borderColor: '#f1f3f5', padding: '0 24px' }}>
          <CommentSection postId={post._id} />
        </div>
      )}

      {/* See Who Liked - Modal Dialog */}
      {isLikesModalOpen && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content" style={{ borderRadius: '8px', border: 'none' }}>
              <div className="modal-header d-flex justify-content-between align-items-center p-3" style={{ borderBottom: '1px solid #dee2e6' }}>
                <h5 className="modal-title" style={{ fontSize: '16px', fontWeight: '600' }}>Liked By</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsLikesModalOpen(false)}
                  style={{ background: 'none', border: 'none', fontSize: '20px', lineHeight: '1' }}
                >
                  &times;
                </button>
              </div>
              <div className="modal-body p-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {isLoadingLikes ? (
                  <div className="text-center py-3 text-muted" style={{ fontSize: '14px' }}>
                    Loading likes...
                  </div>
                ) : likesData?.likes && likesData.likes.length > 0 ? (
                  <div className="d-flex flex-column" style={{ gap: '12px' }}>
                    {likesData.likes.map((likedUser) => (
                      <div key={likedUser._id} className="d-flex align-items-center">
                        <div className="avatar-fallback me-3 d-flex align-items-center justify-content-center bg-secondary text-white rounded-circle" style={{ width: '32px', height: '32px', fontSize: '11px', fontWeight: 'bold' }}>
                          {getInitials(likedUser.firstName, likedUser.lastName)}
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: '500', color: '#112032' }}>
                          {likedUser.firstName} {likedUser.lastName}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-3 text-muted" style={{ fontSize: '14px' }}>
                    No likes yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
