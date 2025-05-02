import AppRouter from '@routers/app-router';
import { useDispatch } from 'react-redux';
import * as AuthService from '@services/auth-service';
import { updateUser } from '@redux/Slices/userSlice';
import { jwtDecode } from 'jwt-decode';
import { useEffect } from 'react';

export default function App() {
  const dispatch = useDispatch();
  const token = localStorage.getItem('token');

  const handleGetDetailUser = async ({ id, token }) => {
    const res = await AuthService.getDetailUserByUserId({ id });
    dispatch(updateUser({ ...res.data.result, token }));
  };

  useEffect(() => {
    if (token && token !== 'undefined') {
      const decoded = jwtDecode(token);
      if (decoded && decoded?.userId) {
        handleGetDetailUser({ id: decoded.userId, token });
      }
    }
  }, [token]);

  return <AppRouter />;
}
