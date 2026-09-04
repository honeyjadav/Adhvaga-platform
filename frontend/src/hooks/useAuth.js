import { useDispatch, useSelector } from 'react-redux';
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectIsAdmin,
  selectAuthStatus,
  selectAuthError,
  logout as logoutAction,
} from '../redux/slices/authSlice.js';

export function useAuth() {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);
  const status = useSelector(selectAuthStatus);
  const error = useSelector(selectAuthError);

  const logout = () => dispatch(logoutAction());

  return { user, isAuthenticated, isAdmin, status, error, logout };
}
