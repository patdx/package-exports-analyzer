import { useEffect, useMemo, useState } from 'react';

const getLocation = () => `${window.location.pathname}${window.location.search}`;

export const useLocation = () => {
  const [location, setLocation] = useState(getLocation);

  useEffect(() => {
    const handleChange = () => setLocation(getLocation());
    window.addEventListener('popstate', handleChange);
    return () => window.removeEventListener('popstate', handleChange);
  }, []);

  return location;
};

export const usePathname = () => {
  const location = useLocation();
  return location.split('?')[0];
};

export const useSearchParams = () => {
  const location = useLocation();
  return useMemo(() => {
    const query = location.split('?')[1] ?? '';
    return new URLSearchParams(query);
  }, [location]);
};

export const navigate = (to: string) => {
  window.history.pushState({}, '', to);
  window.dispatchEvent(new PopStateEvent('popstate'));
};

export const replace = (to: string) => {
  window.history.replaceState({}, '', to);
  window.dispatchEvent(new PopStateEvent('popstate'));
};
