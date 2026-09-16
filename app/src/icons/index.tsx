import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import * as Font from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBrand } from '@/theme';
import { useI18n } from '@/i18n';
import {
  AntDesign,
  Entypo,
  Feather,
  Fontisto,
  Foundation,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  Octicons,
} from '@expo/vector-icons';

type IconComponent = React.ComponentType<{
  name: any; // each set has its own glyph union; we pass validated names only
  size?: number;
  color?: any; // string | OpaqueColorValue
  style?: any;
}>;

const STORAGE_KEY = 'manage.theme.iconset';

export type IconSetId =
  | 'ionicons'
  | 'community'
  | 'material'
  | 'feather'
  | 'antdesign'
  | 'entypo'
  | 'fontisto'
  | 'octicons'
  | 'foundation';

export const ICON_SETS: { id: IconSetId; name: string; nameEn: string; Icon: IconComponent }[] = [
  { id: 'ionicons', name: 'Ionicons', nameEn: 'Ionicons', Icon: Ionicons },
  { id: 'community', name: 'Material Community', nameEn: 'Material Community', Icon: MaterialCommunityIcons },
  { id: 'material', name: 'Material', nameEn: 'Material', Icon: MaterialIcons },
  { id: 'feather', name: 'Feather', nameEn: 'Feather', Icon: Feather },
  { id: 'antdesign', name: 'Ant Design', nameEn: 'Ant Design', Icon: AntDesign },
  { id: 'entypo', name: 'Entypo', nameEn: 'Entypo', Icon: Entypo },
  { id: 'fontisto', name: 'Fontisto', nameEn: 'Fontisto', Icon: Fontisto },
  { id: 'octicons', name: 'Octicons', nameEn: 'Octicons', Icon: Octicons },
  { id: 'foundation', name: 'Foundation', nameEn: 'Foundation', Icon: Foundation },
];

/**
 * Semantic icon names used across the app. Each maps to a glyph per icon set.
 * Add new semantic names here (all 9 sets), then use <Icon name="..." />.
 */
export const ICON_MAP: Record<string, Record<IconSetId, string>> = {
  home: {
    ionicons: 'home', community: 'home', material: 'home', feather: 'home',
    antdesign: 'home', entypo: 'home', fontisto: 'fa-home', octicons: 'home', foundation: 'home',
  },
  products: {
    ionicons: 'cube', community: 'package-variant', material: 'inventory-2', feather: 'box',
    antdesign: 'appstore', entypo: 'box', fontisto: 'shopping-package', octicons: 'package', foundation: 'archive',
  },
  history: {
    ionicons: 'time', community: 'history', material: 'history', feather: 'clock',
    antdesign: 'history', entypo: 'clock', fontisto: 'history', octicons: 'history', foundation: 'clock',
  },
  more: {
    ionicons: 'apps', community: 'apps', material: 'grid-view', feather: 'grid',
    antdesign: 'menu', entypo: 'menu', fontisto: 'nav-icon-grid', octicons: 'apps', foundation: 'social-windows',
  },
  stock_in: {
    ionicons: 'arrow-down', community: 'arrow-down-circle', material: 'file-download', feather: 'download',
    antdesign: 'download', entypo: 'arrow-down', fontisto: 'download', octicons: 'arrow-down', foundation: 'download',
  },
  stock_out: {
    ionicons: 'arrow-up-circle', community: 'arrow-up-circle', material: 'upload', feather: 'upload',
    antdesign: 'upload', entypo: 'arrow-up', fontisto: 'upload', octicons: 'arrow-up', foundation: 'arrow-up',
  },
  customer: {
    ionicons: 'people', community: 'account-group', material: 'groups', feather: 'users',
    antdesign: 'team', entypo: 'users', fontisto: 'user-secret', octicons: 'people', foundation: 'at-sign',
  },
  supplier: {
    ionicons: 'storefront', community: 'store', material: 'storefront', feather: 'shopping-bag',
    antdesign: 'shop', entypo: 'shop', fontisto: 'shopping-bag', octicons: 'package-dependencies', foundation: 'shopping-bag',
  },
  orders: {
    ionicons: 'receipt', community: 'clipboard-text', material: 'article', feather: 'clipboard',
    antdesign: 'profile', entypo: 'note', fontisto: 'file-1', octicons: 'checklist', foundation: 'list',
  },
  sale: {
    ionicons: 'pricetags', community: 'tag-multiple', material: 'sell', feather: 'tag',
    antdesign: 'tag', entypo: 'tag', fontisto: 'hashtag', octicons: 'tag', foundation: 'price-tag',
  },
  debt: {
    ionicons: 'wallet', community: 'wallet', material: 'payments', feather: 'credit-card',
    antdesign: 'pay-circle', entypo: 'credit-card', fontisto: 'money-symbol', octicons: 'credit-card', foundation: 'dollar',
  },
  report: {
    ionicons: 'bar-chart', community: 'chart-line', material: 'insights', feather: 'bar-chart-2',
    antdesign: 'bar-chart', entypo: 'pie-chart', fontisto: 'bar-chart', octicons: 'graph', foundation: 'graph-bar',
  },
  search: {
    ionicons: 'search', community: 'magnify', material: 'search', feather: 'search',
    antdesign: 'search', entypo: 'magnifying-glass', fontisto: 'search', octicons: 'search', foundation: 'magnifying-glass',
  },
  back: {
    ionicons: 'chevron-back', community: 'chevron-left', material: 'arrow_back_ios', feather: 'chevron-left',
    antdesign: 'left', entypo: 'chevron-left', fontisto: 'arrow-left', octicons: 'arrow-left', foundation: 'arrow-left',
  },
  forward: {
    ionicons: 'chevron-forward', community: 'chevron-right', material: 'arrow_forward', feather: 'chevron-right',
    antdesign: 'right', entypo: 'chevron-right', fontisto: 'arrow-right', octicons: 'chevron-right', foundation: 'arrow-right',
  },
  plus: {
    ionicons: 'add', community: 'plus', material: 'add', feather: 'plus',
    antdesign: 'plus', entypo: 'plus', fontisto: 'plus-a', octicons: 'plus', foundation: 'plus',
  },
  trash: {
    ionicons: 'trash', community: 'trash-can', material: 'delete', feather: 'trash-2',
    antdesign: 'delete', entypo: 'trash', fontisto: 'trash', octicons: 'trash', foundation: 'trash',
  },
  close: {
    ionicons: 'close', community: 'close', material: 'close', feather: 'x',
    antdesign: 'close', entypo: 'cross', fontisto: 'close', octicons: 'x', foundation: 'x-circle',
  },
  check: {
    ionicons: 'checkmark', community: 'check', material: 'check', feather: 'check',
    antdesign: 'check', entypo: 'check', fontisto: 'check', octicons: 'check', foundation: 'check',
  },
  settings: {
    ionicons: 'settings', community: 'cog', material: 'settings', feather: 'settings',
    antdesign: 'setting', entypo: 'cog', fontisto: 'player-settings', octicons: 'gear', foundation: 'wrench',
  },
  globe: {
    ionicons: 'globe', community: 'web', material: 'language', feather: 'globe',
    antdesign: 'global', entypo: 'globe', fontisto: 'world-o', octicons: 'globe', foundation: 'map',
  },
  money: {
    ionicons: 'cash', community: 'cash-multiple', material: 'payments', feather: 'dollar-sign',
    antdesign: 'dollar', entypo: 'dollar', fontisto: 'money-symbol', octicons: 'credit-card', foundation: 'dollar',
  },
  phone: {
    ionicons: 'call', community: 'phone', material: 'call', feather: 'phone',
    antdesign: 'customer-service', entypo: 'phone', fontisto: 'phone', octicons: 'device-mobile', foundation: 'telephone',
  },
  note: {
    ionicons: 'document-text', community: 'note-text', material: 'note', feather: 'edit-3',
    antdesign: 'file-text', entypo: 'note', fontisto: 'file-1', octicons: 'note', foundation: 'clipboard-notes',
  },
  alert: {
    ionicons: 'warning', community: 'alert-circle', material: 'warning', feather: 'alert-circle',
    antdesign: 'exclamation-circle', entypo: 'warning', fontisto: 'exclamation', octicons: 'alert', foundation: 'alert',
  },
  eye: {
    ionicons: 'eye', community: 'eye', material: 'visibility', feather: 'eye',
    antdesign: 'eye', entypo: 'eye', fontisto: 'eye', octicons: 'eye', foundation: 'eye',
  },
  camera: {
    ionicons: 'camera', community: 'camera', material: 'camera', feather: 'camera',
    antdesign: 'camera', entypo: 'camera', fontisto: 'camera', octicons: 'device-camera', foundation: 'camera',
  },
  barcode: {
    ionicons: 'qr-code', community: 'barcode-scan', material: 'qr-code-2', feather: 'type',
    antdesign: 'barcode', entypo: 'adjust', fontisto: 'qrcode', octicons: 'code-square', foundation: 'pencil',
  },
};

type IconCtx = {
  set: (typeof ICON_SETS)[number];
  setIconSetId: (id: IconSetId) => void;
};

const Ctx = createContext<IconCtx>({
  set: ICON_SETS[0],
  setIconSetId: () => {},
});

// Local copies of the icon fonts (app/assets/fonts) so the app never depends
// on node_modules asset URLs (Metro serves those flakily, intermittent 500s).
// Family names match what @expo/vector-icons registers per set.
const LOCAL_FONTS: Record<string, number> = {
  anticon: require('../../assets/fonts/AntDesign.ttf'),
  entypo: require('../../assets/fonts/Entypo.ttf'),
  feather: require('../../assets/fonts/Feather.ttf'),
  Fontisto: require('../../assets/fonts/Fontisto.ttf'),
  foundation: require('../../assets/fonts/Foundation.ttf'),
  ionicons: require('../../assets/fonts/Ionicons.ttf'),
  'material-community': require('../../assets/fonts/MaterialCommunityIcons.ttf'),
  material: require('../../assets/fonts/MaterialIcons.ttf'),
  octicons: require('../../assets/fonts/Octicons.ttf'),
};

export function IconProvider({ children }: { children: ReactNode }) {
  const Brand = useBrand();
  const { t } = useI18n();
  const [id, setId] = useState<IconSetId>('ionicons');
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((v) => {
        if (v && ICON_SETS.some((s) => s.id === v)) setId(v as IconSetId);
      })
      .catch(() => {});
  }, []);

  // Load every icon font from local assets BEFORE any icon mounts.
  // @expo/vector-icons checks Font.isLoaded(family) first, so once these are
  // registered it never fetches the node_modules copies.
  useEffect(() => {
    Font.loadAsync(LOCAL_FONTS)
      .then(() => setFontsReady(true))
      .catch(() => setFontsReady(true)); // never block the app forever
  }, []);

  function setIconSetId(v: IconSetId) {
    setId(v);
    AsyncStorage.setItem(STORAGE_KEY, v).catch(() => {});
  }

  const set = ICON_SETS.find((s) => s.id === id) || ICON_SETS[0];

  if (!fontsReady) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: Brand.background,
        }}>
        <ActivityIndicator size="large" color={Brand.primary} />
        <Text style={{ marginTop: 12, fontSize: 14, color: Brand.mutedForeground }}>
          {t('loading')}
        </Text>
      </View>
    );
  }

  return <Ctx.Provider value={{ set, setIconSetId }}>{children}</Ctx.Provider>;
}

export function useIconSet() {
  return useContext(Ctx);
}

/**
 * Semantic icon: <Icon name="stock_in" size={22} color="#000" />
 * Renders with the icon set chosen in Settings.
 */
export function Icon({
  name,
  size = 22,
  color = '#000000',
  style,
}: {
  name: string;
  size?: number;
  color?: string;
  style?: any;
}) {
  const { set } = useIconSet();
  const glyph = ICON_MAP[name]?.[set.id] || ICON_MAP[name]?.ionicons || 'help';
  return <set.Icon name={glyph as any} size={size} color={color} style={style} />;
}
