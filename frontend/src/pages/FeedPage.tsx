import React from 'react';
import { useAuth } from '../context/AuthContext';

const FeedPage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Feed Page (Protected)</h1>
      <p>Welcome, {user?.firstName} {user?.lastName}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default FeedPage;
