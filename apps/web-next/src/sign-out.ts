import { useNavigate } from 'react-router';

// Stub until authentication exists: signing out only goes back to the home page.
export function useSignOut() {
  const navigate = useNavigate();

  return () => {
    void navigate('/');
  };
}
