import { useLocalStorage } from './use-local-storage';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

export function useAuth() {
  const [email, setEmail] = useLocalStorage<string | null>('candidateos_email', null);
  const navigate = useNavigate();

  const login = useCallback((userEmail: string) => {
    setEmail(userEmail);
    navigate('/dashboard');
  }, [setEmail, navigate]);

  const logout = useCallback(() => {
    setEmail(null);
    navigate('/login');
  }, [setEmail, navigate]);

  return { email, isAuthenticated: !!email, login, logout };
}