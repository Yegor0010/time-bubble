import { useEffect } from 'react';
import { useUserStore } from '~/stores/user-store';

export function useTheme() {
  const theme = useUserStore((state) => state.user.settings.theme);

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove both dark and light classes first
    root.classList.remove('dark', 'light');
    
    if (theme === 'system') {
      // Check system preference
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      
      if (systemTheme === 'dark') {
        root.classList.add('dark');
      }
      
      // Listen for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        root.classList.remove('dark', 'light');
        if (e.matches) {
          root.classList.add('dark');
        }
      };
      
      mediaQuery.addEventListener('change', handleChange);
      
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    } else if (theme === 'dark') {
      root.classList.add('dark');
    }
    // For 'light' theme, we don't add any class (default is light)
  }, [theme]);

  return theme;
}
