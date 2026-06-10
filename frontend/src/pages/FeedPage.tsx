import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../hooks/usePosts';
import PostCard from '../components/PostCard';
import logoImage from '../assets/images/logo-copy.svg';

const FeedPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { useFeed, createPost, isCreating } = usePosts();

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useFeed();

  // Local state
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [postVisibility, setPostVisibility] = useState<'public' | 'private'>('public');
  const [attachedImageFile, setAttachedImageFile] = useState<File | null>(null);
  const [attachedImagePreview, setAttachedImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');

  // Infinite Scroll ref
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${(firstName || '').charAt(0)}${(lastName || '').charAt(0)}`.toUpperCase() || '?';
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setImageError('File size exceeds the 5MB limit.');
      return;
    }

    setImageError(null);
    if (attachedImagePreview) {
      URL.revokeObjectURL(attachedImagePreview);
    }
    setAttachedImageFile(file);
    setAttachedImagePreview(URL.createObjectURL(file));
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim() && !attachedImageFile) return;

    try {
      const formData = new FormData();
      formData.append('content', postContent);
      formData.append('visibility', postVisibility);
      if (attachedImageFile) {
        formData.append('image', attachedImageFile);
      }

      await createPost(formData);

      // Clear input form
      setPostContent('');
      if (attachedImagePreview) {
        URL.revokeObjectURL(attachedImagePreview);
      }
      setAttachedImageFile(null);
      setAttachedImagePreview(null);
      setPostVisibility('public');
    } catch (err) {
      alert((err as any)?.message || 'Failed to create post');
      console.error('Failed to create post:', err);
    }
  };

  // Intersection Observer for Infinite Scroll
  useEffect(() => {
    if (!hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasNextPage, fetchNextPage, isFetchingNextPage]);

  const posts = data?.pages.flatMap((page) => page.posts) || [];

  return (
    <div className={`_layout _layout_main_wrapper ${isDarkMode ? '_dark_wrapper' : ''}`} style={{ minHeight: '100vh' }}>
      {/* Theme Switching Button */}
      <div className="_layout_mode_swithing_btn" onClick={toggleDarkMode}>
        <button type="button" className="_layout_swithing_btn_link">
          <div className="_layout_swithing_btn">
            <div className={`_layout_swithing_btn_round ${isDarkMode ? 'active' : ''}`} />
          </div>
          <div className="_layout_change_btn_ic1">
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="16" fill="none" viewBox="0 0 11 16">
              <path fill="#fff" d="M2.727 14.977l.04-.498-.04.498zm-1.72-.49l.489-.11-.489.11zM3.232 1.212L3.514.8l-.282.413zM9.792 8a6.5 6.5 0 00-6.5-6.5v-1a7.5 7.5 0 017.5 7.5h-1zm-6.5 6.5a6.5 6.5 0 006.5-6.5h1a7.5 7.5 0 01-7.5 7.5v-1zm-.525-.02c.173.013.348.02.525.02v1c-.204 0-.405-.008-.605-.024l.08-.997zm-.261-1.83A6.498 6.498 0 005.792 7h1a7.498 7.498 0 01-3.791 6.52l-.495-.87zM5.792 7a6.493 6.493 0 00-2.841-5.374L3.514.8A7.493 7.493 0 016.792 7h-1zm-3.105 8.476c-.528-.042-.985-.077-1.314-.155-.316-.075-.746-.242-.854-.726l.977-.217c-.028-.124-.145-.09.106-.03.237.056.6.086 1.165.131l-.08.997zm.314-1.956c-.622.354-1.045.596-1.31.792a.967.967 0 00-.204.185c-.01.013.027-.038.009-.12l-.977.218a.836.836 0 01.144-.666c.112-.162.27-.3.433-.42.324-.24.814-.519 1.41-.858L3 13.52zM3.292 1.5a.391.391 0 00.374-.285A.382.382 0 003.514.8l-.563.826A.618.618 0 012.702.95a.609.609 0 01.59-.45v1z" />
            </svg>
          </div>
          <div className="_layout_change_btn_ic2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="4.389" stroke="#fff" transform="rotate(-90 12 12)" />
              <path stroke="#fff" stroke-linecap="round" d="M3.444 12H1M23 12h-2.444M5.95 5.95L4.222 4.22M19.778 19.779L18.05 18.05M12 3.444V1M12 23v-2.445M18.05 5.95l1.728-1.729M4.222 19.779L5.95 18.05" />
            </svg>
          </div>
        </button>
      </div>

      <div className="_main_layout">
        {/* Navigation Bar */}
        <nav className="navbar navbar-expand-lg navbar-light _header_nav _padd_t10">
          <div className="container _custom_container">
            <div className="_logo_wrap">
              <a className="navbar-brand" href="#0">
                <span className="h3 fw-bold text-primary mb-0 d-flex align-items-center" style={{ gap: '8px' }}>
                  <img src={logoImage} alt="Logo" style={{ width: '32px' }} />
                  Buddy Script
                </span>
              </a>
            </div>

            <div className="collapse navbar-collapse d-flex align-items-center justify-content-between">
              {/* Search Bar */}
              <div className="_header_form mx-auto" style={{ width: '400px' }}>
                <div className="_header_form_grp position-relative">
                  <svg className="_header_form_svg position-absolute" style={{ left: '15px', top: '50%', transform: 'translateY(-50%)' }} xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" viewBox="0 0 17 17">
                    <circle cx="7" cy="7" r="6" stroke="#666" />
                    <path stroke="#666" stroke-linecap="round" d="M16 16l-3-3" />
                  </svg>
                  <input
                    className="form-control me-2 _inpt1 ps-5"
                    type="search"
                    placeholder="input search text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Icons / Notifications dropdown & profile dropdown */}
              <ul className="navbar-nav mb-2 mb-lg-0 _header_nav_list ms-auto align-items-center" style={{ gap: '20px' }}>
                <li className="nav-item _header_nav_item">
                  <a className="nav-link _header_nav_link_active _header_nav_link" href="#0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="21" fill="none" viewBox="0 0 18 21">
                      <path className="_home_active" stroke="#000" strokeWidth="1.5" strokeOpacity=".6" d="M1 9.924c0-1.552 0-2.328.314-3.01.313-.682.902-1.187 2.08-2.196l1.143-.98C6.667 1.913 7.732 1 9 1c1.268 0 2.333.913 4.463 2.738l1.142.98c1.179 1.01 1.768 1.514 2.081 2.196.314.682.314 1.458.314 3.01v4.846c0 2.155 0 3.233-.67 3.902-.669.67-1.746.67-3.901.67H5.57c-2.155 0-3.232 0-3.902-.67C1 18.002 1 16.925 1 14.77V9.924z" />
                      <path className="_home_active" stroke="#000" strokeOpacity=".6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11.857 19.341v-5.857a1 1 0 00-1-1H7.143a1 1 0 00-1 1v5.857" />
                    </svg>
                  </a>
                </li>

                {/* Notifications Dropdown Toggle */}
                <li className="nav-item _header_nav_item position-relative">
                  <span
                    id="_notify_btn"
                    className="nav-link _header_nav_link _header_notify_btn"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="22" fill="none" viewBox="0 0 20 22">
                      <path fill="#000" fillOpacity=".6" fillRule="evenodd" d="M7.547 19.55c.533.59 1.218.915 1.93.915.714 0 1.403-.324 1.938-.916a.777.777 0 011.09-.056c.318.284.344.77.058 1.084-.832.917-1.927 1.423-3.086 1.423h-.002c-1.155-.001-2.248-.506-3.077-1.424a.762.762 0 01.057-1.083.774.774 0 011.092.057zM9.527 0c4.58 0 7.657 3.543 7.657 6.85 0 1.702.436 2.424.899 3.19.457.754.976 1.612.976 3.233-.36 4.14-4.713 4.478-9.531 4.478-4.818 0-9.172-.337-9.528-4.413-.003-1.686.515-2.544.973-3.299l.161-.27c.398-.679.737-1.417.737-2.918C1.871 3.543 4.948 0 9.528 0zm0 1.535c-3.6 0-6.11 2.802-6.11 5.316 0 2.127-.595 3.11-1.12 3.978-.422.697-.755 1.247-.755 2.444.173 1.93 1.455 2.944 7.986 2.944 6.494 0 7.817-1.06 7.988-3.01-.003-1.13-.336-1.681-.757-2.378-.526-.868-1.12-1.851-1.12-3.978 0-2.514-2.51-5.316-6.111-5.316z" clipRule="evenodd" />
                    </svg>
                    <span className="_counting">2</span>
                  </span>

                  {isNotificationOpen && (
                    <div id="_notify_drop" className="_notification_dropdown show d-block" style={{ top: '50px', right: 0 }}>
                      <div className="_notifications_content p-3 border-bottom d-flex justify-content-between align-items-center">
                        <h4 className="_notifications_content_title mb-0" style={{ fontSize: '16px', fontWeight: '600' }}>Notifications</h4>
                      </div>
                      <div className="_notifications_drop_box" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        <div className="_notification_box d-flex p-3 border-bottom" style={{ gap: '12px' }}>
                          <div className="avatar-fallback d-flex align-items-center justify-content-center bg-info text-white rounded-circle" style={{ width: '40px', height: '40px', minWidth: '40px', fontWeight: 'bold' }}>SJ</div>
                          <div className="_notification_txt">
                            <p className="_notification_para mb-1" style={{ fontSize: '13px' }}>
                              <span className="_notify_txt_link fw-bold text-dark">Steve Jobs</span> liked your public post.
                            </p>
                            <div className="_nitification_time" style={{ fontSize: '11px', color: '#999' }}>
                              <span>2 minutes ago</span>
                            </div>
                          </div>
                        </div>
                        <div className="_notification_box d-flex p-3 border-bottom" style={{ gap: '12px' }}>
                          <div className="avatar-fallback d-flex align-items-center justify-content-center bg-success text-white rounded-circle" style={{ width: '40px', height: '40px', minWidth: '40px', fontWeight: 'bold' }}>RS</div>
                          <div className="_notification_txt">
                            <p className="_notification_para mb-1" style={{ fontSize: '13px' }}>
                              <span className="_notify_txt_link fw-bold text-dark">Ryan Roslansky</span> commented on your post.
                            </p>
                            <div className="_nitification_time" style={{ fontSize: '11px', color: '#999' }}>
                              <span>15 minutes ago</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </li>

                {/* Profile Dropdown Toggle */}
                <li className="nav-item _header_nav_profile position-relative d-flex align-items-center" style={{ gap: '10px' }}>
                  <div className="avatar-fallback d-flex align-items-center justify-content-center bg-primary text-white rounded-circle" style={{ width: '45px', height: '45px', fontWeight: 'bold' }}>
                    {getInitials(user?.firstName, user?.lastName)}
                  </div>
                  <div className="_header_nav_dropdown d-flex align-items-center" onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)} style={{ cursor: 'pointer', gap: '6px' }}>
                    <p className="_header_nav_para mb-0" style={{ fontSize: '14px', fontWeight: '500' }}>
                      {user?.firstName} {user?.lastName}
                    </p>
                    <button id="_profile_drop_show_btn" className="_header_nav_dropdown_btn _dropdown_toggle" type="button" style={{ background: 'none', border: 'none' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="6" fill="none" viewBox="0 0 10 6">
                        <path fill="#112032" d="M5 5l.354.354L5 5.707l-.354-.353L5 5zm4.354-3.646l-4 4-.708-.708 4-4 .708.708zm-4.708 4l-4-4 .708-.708 4 4-.708.708z" />
                      </svg>
                    </button>
                  </div>

                  {isProfileDropdownOpen && (
                    <div id="_prfoile_drop" className="_nav_profile_dropdown _profile_dropdown show d-block" style={{ top: '10px', right: 0, width: '220px' }}>
                      <div className="_nav_profile_dropdown_info d-flex p-3 align-items-center" style={{ gap: '12px' }}>
                        <div className="avatar-fallback d-flex align-items-center justify-content-center bg-primary text-white rounded-circle" style={{ width: '40px', height: '40px', fontWeight: 'bold' }}>
                          {getInitials(user?.firstName, user?.lastName)}
                        </div>
                        <div className="_nav_profile_dropdown_info_txt">
                          <h4 className="_nav_dropdown_title mb-0" style={{ fontSize: '14px', fontWeight: '600', textAlign: 'left' }}>
                            {user?.firstName} {user?.lastName}
                          </h4>
                          <span className="text-muted" style={{ fontSize: '12px', textAlign: 'left' }}>{user?.email}</span>
                        </div>
                      </div>
                      <hr className="my-0" />
                      <ul className="_nav_dropdown_list list-unstyled p-0 mt-1">
                        <li className="_nav_dropdown_list_item">
                          <button
                            onClick={logout}
                            className="btn btn-link text-danger text-start w-100 p-2 d-flex align-items-center"
                            style={{ textDecoration: 'none', fontSize: '14px', gap: '8px' }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 19 19" stroke="currentColor" strokeWidth="1.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6.667 18H2.889A1.889 1.889 0 011 16.111V2.89A1.889 1.889 0 012.889 1h3.778M13.277 14.222L18 9.5l-4.723-4.722M18 9.5H6.667" />
                            </svg>
                            Log Out
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </li>
              </ul>
            </div>
          </div>
        </nav>

        {/* Main Feed Container */}
        <div className="container _custom_container mt-4">
          <div className="_layout_inner_wrap">
            <div className="row">
              {/* Left Sidebar */}
              <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
              
              </div>

              {/* Middle Section (Feed & Create Post) */}
              <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                <div className="_layout_middle_wrap">
                  <div className="_layout_middle_inner">
                    {/* High fidelity Stories Mock row */}
                    <div className="_feed_inner_ppl_card _mar_b16 bg-white p-3 shadow-sm rounded mb-4" style={{ border: '1px solid #e9ecef' }}>
                      <div className="row g-2">
                        <div className="col-3">
                          <div className="_feed_inner_profile_story _b_radious6 text-center" style={{ border: '1px dashed #ced4da', borderRadius: '6px', height: '110px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#f8f9fa' }}>
                            <span style={{ fontSize: '24px' }}>➕</span>
                            <span className="text-secondary mt-1 d-block" style={{ fontSize: '11px', fontWeight: '500' }}>Your Story</span>
                          </div>
                        </div>
                        <div className="col-3">
                          <div className="_feed_inner_public_story _b_radious6 text-center bg-light p-2" style={{ borderRadius: '6px', height: '110px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid #e9ecef' }}>
                            <div className="avatar-fallback mx-auto d-flex align-items-center justify-content-center bg-info text-white rounded-circle" style={{ width: '28px', height: '28px', fontWeight: 'bold', fontSize: '11px' }}>SJ</div>
                            <span style={{ fontSize: '11px', fontWeight: '500', color: '#112032' }}>Steve Jobs</span>
                          </div>
                        </div>
                        <div className="col-3">
                          <div className="_feed_inner_public_story _b_radious6 text-center bg-light p-2" style={{ borderRadius: '6px', height: '110px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid #e9ecef' }}>
                            <div className="avatar-fallback mx-auto d-flex align-items-center justify-content-center bg-success text-white rounded-circle" style={{ width: '28px', height: '28px', fontWeight: 'bold', fontSize: '11px' }}>RR</div>
                            <span style={{ fontSize: '11px', fontWeight: '500', color: '#112032' }}>Ryan R.</span>
                          </div>
                        </div>
                        <div className="col-3">
                          <div className="_feed_inner_public_story _b_radious6 text-center bg-light p-2" style={{ borderRadius: '6px', height: '110px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid #e9ecef' }}>
                            <div className="avatar-fallback mx-auto d-flex align-items-center justify-content-center bg-warning text-white rounded-circle" style={{ width: '28px', height: '28px', fontWeight: 'bold', fontSize: '11px' }}>AJ</div>
                            <span style={{ fontSize: '11px', fontWeight: '500', color: '#112032' }}>Alice J.</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Create Post Box */}
                    <div className="_feed_inner_text_area _b_radious6 _padd_b24 _padd_t24 _padd_r24 _padd_l24 _mar_b16 bg-white shadow-sm rounded p-4 mb-4" style={{ border: '1px solid #e9ecef' }}>
                      <form onSubmit={handleCreatePost}>
                        <div className="_feed_inner_text_area_box d-flex mb-3 align-items-start" style={{ gap: '15px' }}>
                          <div className="avatar-fallback d-flex align-items-center justify-content-center bg-primary text-white rounded-circle" style={{ width: '50px', height: '45px', fontWeight: 'bold' }}>
                            {getInitials(user?.firstName, user?.lastName)}
                          </div>
                          <div className="w-100">
                            <textarea
                              className="form-control"
                              placeholder="Write something..."
                              value={postContent}
                              onChange={(e) => setPostContent(e.target.value)}
                              style={{ border: 'none', background: 'transparent', resize: 'none', height: '80px', paddingLeft: 0, paddingRight: 0, fontSize: '15px' }}
                            />
                          </div>
                        </div>

                        {/* Image Preview attachment */}
                        {attachedImagePreview && (
                          <div className="position-relative mb-3 rounded overflow-hidden" style={{ maxHeight: '200px', width: 'fit-content' }}>
                            <img src={attachedImagePreview} alt="Attachment Preview" style={{ maxHeight: '200px', objectFit: 'contain' }} />
                            <button
                              type="button"
                              className="btn btn-dark btn-sm position-absolute rounded-circle"
                              onClick={() => {
                                if (attachedImagePreview) {
                                  URL.revokeObjectURL(attachedImagePreview);
                                }
                                setAttachedImageFile(null);
                                setAttachedImagePreview(null);
                              }}
                              style={{ top: '8px', right: '8px', opacity: 0.8, border: 'none', fontSize: '12px', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              &times;
                            </button>
                          </div>
                        )}

                        {imageError && (
                          <div className="text-danger mb-3" style={{ fontSize: '13px' }}>
                            {imageError}
                          </div>
                        )}

                        <div className="d-flex justify-content-between align-items-center pt-3 border-top" style={{ borderColor: '#f1f3f5' }}>
                          <div className="d-flex align-items-center" style={{ gap: '16px' }}>
                            {/* Photo Upload Attachment Link */}
                            <label className="m-0 d-flex align-items-center text-muted" style={{ cursor: 'pointer', fontSize: '14px', gap: '6px' }}>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                style={{ display: 'none' }}
                              />
                              <span>🖼️</span> Photo
                            </label>

                            {/* Visibility dropdown */}
                            <div className="d-flex align-items-center text-muted" style={{ gap: '6px' }}>
                              <span></span>
                              <select
                                className="form-select form-select-sm border-0 bg-transparent text-muted"
                                value={postVisibility}
                                onChange={(e) => setPostVisibility(e.target.value as 'public' | 'private')}
                                style={{ fontSize: '13px', width: '100px', padding: '0 24px 0 0', cursor: 'pointer' }}
                              >
                                <option value="public">Public</option>
                                <option value="private">Private</option>
                              </select>
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="btn btn-primary px-4 py-1.5 d-flex align-items-center"
                            disabled={isCreating || (!postContent.trim() && !attachedImageFile)}
                            style={{ borderRadius: '6px', fontWeight: '500', gap: '8px' }}
                          >
                            {isCreating ? 'Posting...' : 'Post'} 🚀
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Post Feed List */}
                    <div className="posts-feed">
                      {posts.map((post) => (
                        <PostCard key={post._id} post={post} />
                      ))}

                      {/* Infinite Scroll trigger element */}
                      {hasNextPage && (
                        <div ref={loadMoreRef} className="text-center py-4">
                          {isFetchingNextPage ? (
                            <div className="spinner-border text-primary spinner-border-sm" role="status">
                              <span className="visually-hidden">Loading more...</span>
                            </div>
                          ) : (
                            <span className="text-muted" style={{ fontSize: '13px' }}>Scroll down to load more</span>
                          )}
                        </div>
                      )}

                      {!isLoading && posts.length === 0 && (
                        <div className="text-center py-5 bg-white rounded shadow-sm" style={{ border: '1px solid #e9ecef' }}>
                          <span style={{ fontSize: '40px' }}>📭</span>
                          <h4 className="mt-3" style={{ fontSize: '16px', fontWeight: '600', color: '#112032' }}>Your Feed is Empty</h4>
                          <p className="text-muted mb-0" style={{ fontSize: '13px' }}>Create your first public or private post to see it here!</p>
                        </div>
                      )}

                      {isLoading && (
                        <div className="d-flex flex-column gap-3">
                          {/* Skeleton loading cards */}
                          {[1, 2, 3].map((n) => (
                            <div key={n} className="bg-white p-4 rounded shadow-sm mb-4" style={{ border: '1px solid #e9ecef' }}>
                              <div className="d-flex align-items-center mb-3" style={{ gap: '15px' }}>
                                <div className="bg-light rounded-circle" style={{ width: '45px', height: '45px' }} />
                                <div className="w-50">
                                  <div className="bg-light rounded mb-1" style={{ height: '14px' }} />
                                  <div className="bg-light rounded" style={{ height: '10px', width: '60%' }} />
                                </div>
                              </div>
                              <div className="bg-light rounded mb-2" style={{ height: '16px' }} />
                              <div className="bg-light rounded mb-3" style={{ height: '16px', width: '80%' }} />
                              <div className="bg-light rounded" style={{ height: '200px' }} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
                <div className="_layout_right_sidebar_wrap">
                  {/* You Might Like list */}
                  <div className="_layout_right_sidebar_inner bg-white shadow-sm rounded p-4 mb-4">
                    <div className="_right_inner_area_info_content _mar_b24 mb-3 d-flex justify-content-between align-items-center">
                      <h4 className="_right_inner_area_info_content_title _title5 mb-0" style={{ fontSize: '16px', fontWeight: '600' }}>You Might Like</h4>
                      <a className="_right_inner_area_info_content_txt_link text-decoration-none text-primary" href="#0" style={{ fontSize: '12px' }}>See All</a>
                    </div>
                    <hr className="_underline my-2" />
                    <div className="_right_inner_area_info_ppl mt-3">
                      <div className="_right_inner_area_info_box d-flex align-items-center mb-3" style={{ gap: '10px' }}>
                        <div className="avatar-fallback d-flex align-items-center justify-content-center bg-warning text-white rounded-circle" style={{ width: '40px', height: '40px', fontWeight: 'bold' }}>RS</div>
                        <div className="_right_inner_area_info_box_txt">
                          <h5 className="_right_inner_area_info_box_title mb-0" style={{ fontSize: '13px', fontWeight: '600' }}>Radovan SkillArena</h5>
                          <p className="_right_inner_area_info_box_para text-muted mb-0" style={{ fontSize: '11px' }}>Founder & CEO at Trophy</p>
                        </div>
                      </div>
                      <div className="_right_info_btn_grp d-flex" style={{ gap: '8px' }}>
                        <button type="button" className="btn btn-light btn-sm w-50" style={{ fontSize: '12px', borderRadius: '4px' }}>Ignore</button>
                        <button type="button" className="btn btn-primary btn-sm w-50" style={{ fontSize: '12px', borderRadius: '4px' }}>Follow</button>
                      </div>
                    </div>
                  </div>

                  {/* Friends online list */}
                  <div className="_layout_right_sidebar_inner bg-white shadow-sm rounded p-4">
                    <div className="_feed_right_inner_area_card_content _mar_b24 mb-3 d-flex justify-content-between align-items-center">
                      <h4 className="_feed_right_inner_area_card_content_title _title5 mb-0" style={{ fontSize: '16px', fontWeight: '600' }}>Your Friends</h4>
                      <a className="_feed_right_inner_area_card_content_txt_link text-decoration-none text-primary" href="#0" style={{ fontSize: '12px' }}>See All</a>
                    </div>
                    <div className="friends-list d-flex flex-column mt-3" style={{ gap: '16px' }}>
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center" style={{ gap: '10px' }}>
                          <div className="avatar-fallback d-flex align-items-center justify-content-center bg-info text-white rounded-circle position-relative" style={{ width: '36px', height: '36px', fontWeight: 'bold', fontSize: '12px' }}>
                            SJ
                            <span className="position-absolute bg-success border border-white rounded-circle" style={{ width: '8px', height: '8px', bottom: '0', right: '0' }} />
                          </div>
                          <div>
                            <h6 className="mb-0" style={{ fontSize: '13px', fontWeight: '600',textAlign:'left' }}>Steve Jobs</h6>
                            <p className="text-muted mb-0" style={{ fontSize: '11px' }}>CEO of Apple . Online</p>
                          </div>
                        </div>
                      </div>

                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center" style={{ gap: '10px' }}>
                          <div className="avatar-fallback d-flex align-items-center justify-content-center bg-success text-white rounded-circle position-relative" style={{ width: '36px', height: '36px', fontWeight: 'bold', fontSize: '12px' }}>
                            RR
                            <span className="position-absolute bg-success border border-white rounded-circle" style={{ width: '8px', height: '8px', bottom: '0', right: '0' }} />
                          </div>
                          <div>
                            <h6 className="mb-0" style={{ fontSize: '13px', fontWeight: '600', textAlign: 'left' }}>Ryan Roslansky</h6>
                            <p className="text-muted mb-0" style={{ fontSize: '11px' }}>CEO of Linkedin . Online</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedPage;
