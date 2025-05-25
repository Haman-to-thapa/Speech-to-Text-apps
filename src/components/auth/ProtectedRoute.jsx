import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useGetMeQuery } from '../../store/api/authApi';
import { setUser, logout } from '../../store/slices/authSlice';
import AuthPage from './AuthPage';

const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();
  const { token, isAuthenticated } = useSelector((state) => state.auth);
  
  const { data, error, isLoading } = useGetMeQuery(undefined, {
    skip: !token,
  });

  useEffect(() => {
    if (data?.user) {
      dispatch(setUser(data.user));
    } else if (error) {
      dispatch(logout());
    }
  }, [data, error, dispatch]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!token || !isAuthenticated) {
    return <AuthPage />;
  }

  return children;
};

export default ProtectedRoute;
