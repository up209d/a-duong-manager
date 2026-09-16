import { useRouter } from 'expo-router';

// Go back if there is navigation history; otherwise fall back to the home tab.
// Use this instead of a bare `router.back()` for any "go back" action (back button,
// post-save navigation, etc.) so deep-linked entry points never get stuck.
export function useGoBack() {
  const router = useRouter();
  return function goBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };
}
