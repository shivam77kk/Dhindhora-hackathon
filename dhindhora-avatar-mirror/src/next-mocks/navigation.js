import { useNavigate, useLocation, useSearchParams as useRSearch } from 'react-router-dom';
export function useRouter() { 
  const navigate = useNavigate(); 
  return { push: navigate, replace: (path) => navigate(path, {replace: true}), back: () => navigate(-1) }; 
}
export function usePathname() { 
  const location = useLocation();
  return location.pathname; 
}
export function useSearchParams() { 
  const [searchParams] = useRSearch();
  return searchParams; 
}
