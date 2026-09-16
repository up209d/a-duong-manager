import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_PALETTE, PALETTES, type Palette } from '@/constants/theme';

const STORAGE_KEY = 'manage.theme.palette';

type ThemeCtx = {
  palette: Palette;
  ready: boolean;
  setPaletteId: (id: string) => void;
};

const Ctx = createContext<ThemeCtx>({
  palette: DEFAULT_PALETTE,
  ready: false,
  setPaletteId: () => {},
});

export function useThemeCtx() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useThemeCtx must be used within ThemeProvider');
  return ctx;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [palette, setPalette] = useState<Palette>(DEFAULT_PALETTE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((id) => {
        if (id) {
          const p = PALETTES.find((x) => x.id === id);
          if (p) setPalette(p);
        }
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  function setPaletteId(id: string) {
    const p = PALETTES.find((x) => x.id === id) || DEFAULT_PALETTE;
    setPalette(p);
    AsyncStorage.setItem(STORAGE_KEY, p.id).catch(() => {});
  }

  return <Ctx.Provider value={{ palette, ready, setPaletteId }}>{children}</Ctx.Provider>;
}

/**
 * Returns the active palette. Usage in a component:
 *   const Brand = useBrand();
 * (named Brand so existing code keeps working)
 */
export function useBrand(): Palette {
  return useContext(Ctx).palette;
}
