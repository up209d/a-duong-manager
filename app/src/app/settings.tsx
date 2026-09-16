import { Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useBrand, useThemeCtx } from '@/theme';
import { PALETTES } from '@/constants/theme';
import { ICON_SETS, Icon, useIconSet } from '@/icons';
import { Screen } from '@/components/screen';
import { Card } from '@/components/ui';
import { useI18n } from '@/i18n';

function ThemeCard({ id }: { id: string }) {
  const Brand = useBrand();
  const { setPaletteId } = useThemeCtx();
  const p = PALETTES.find((x) => x.id === id)!;
  const active = Brand.id === p.id;
  return (
    <Pressable
      onPress={() => setPaletteId(p.id)}
      style={({ pressed }) => ({
        flex: 1,
        minWidth: 150,
        borderRadius: 16,
        borderWidth: active ? 2.5 : 1,
        borderColor: active ? p.accent : Brand.border,
        backgroundColor: Brand.card,
        padding: 10,
        marginBottom: 10,
        opacity: pressed ? 0.85 : 1,
      })}>
      {/* mini preview */}
      <LinearGradient
        colors={[p.gradient[0], p.gradient[1]] as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 10, height: 64, overflow: 'hidden' }}>
        <View style={{ position: 'absolute', top: -14, right: -14, width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFFFFF', opacity: 0.12 }} />
        <View style={{ position: 'absolute', bottom: 8, left: 10, flexDirection: 'row' }}>
          <View style={{ width: 34, height: 18, borderRadius: 6, backgroundColor: '#FFFFFF', opacity: 0.9, marginRight: 6 }} />
          <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: '#FFFFFF', opacity: 0.5 }} />
        </View>
      </LinearGradient>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, paddingHorizontal: 2 }}>
        <Text style={{ flex: 1, fontSize: 14, fontWeight: 700, color: Brand.foreground }}>{p.name}</Text>
        {active ? <Icon name="check" size={18} color={p.accent} /> : null}
      </View>
    </Pressable>
  );
}

function IconSetCard({ setId }: { setId: string }) {
  const Brand = useBrand();
  const { set: activeSet, setIconSetId } = useIconSet();
  const s = ICON_SETS.find((x) => x.id === setId)!;
  const active = activeSet.id === s.id;
  return (
    <Card
      onPress={() => setIconSetId(s.id)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        borderWidth: active ? 2 : 1,
        borderColor: active ? Brand.accent : Brand.border,
      }}>
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          backgroundColor: Brand.muted,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}>
        <s.Icon name={s.id === 'ionicons' ? 'cube' : s.id === 'community' ? 'package-variant' : s.id === 'material' ? 'inventory-2' : s.id === 'feather' ? 'box' : s.id === 'antdesign' ? 'appstore' : s.id === 'entypo' ? 'box' : s.id === 'fontisto' ? 'shopping-package' : s.id === 'octicons' ? 'package' : 'archive'} size={22} color={Brand.primary} />
      </View>
      <Text style={{ flex: 1, fontSize: 15, fontWeight: 700, color: Brand.foreground }}>{s.name}</Text>
      {active ? <Icon name="check" size={18} color={Brand.accent} /> : null}
    </Card>
  );
}

export default function SettingsScreen() {
  const Brand = useBrand();
  const { t, lang, setLang } = useI18n();

  const styles = {
    sectionTitle: { fontSize: 17, fontWeight: '700' as const, color: Brand.foreground, marginBottom: 10, marginTop: 6 },
  };

  return (
    <Screen title={t('settings')} background>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Theme */}
        <Text style={styles.sectionTitle}>{t('theme_color')}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 0 }}>
          {PALETTES.map((p) => (
            <ThemeCard key={p.id} id={p.id} />
          ))}
        </View>

        {/* Icon set */}
        <Text style={styles.sectionTitle}>{t('icon_set')}</Text>
        {ICON_SETS.map((s) => (
          <IconSetCard key={s.id} setId={s.id} />
        ))}

        {/* Language */}
        <Text style={styles.sectionTitle}>{t('language')}</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          {(['vi', 'en'] as const).map((l) => (
            <Card
              key={l}
              onPress={() => setLang(l)}
              style={{
                flex: 1,
                alignItems: 'center',
                paddingVertical: 12,
                borderWidth: lang === l ? 2 : 1,
                borderColor: lang === l ? Brand.accent : Brand.border,
              }}>
              <Text style={{ fontSize: 15, fontWeight: 700, color: lang === l ? Brand.accent : Brand.foreground }}>
                {l === 'vi' ? 'Tiếng Việt' : 'English'}
              </Text>
            </Card>
          ))}
        </View>

        {/* About */}
        <Card style={{ alignItems: 'center', paddingVertical: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: Brand.gradient[0] + '22',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 10,
              }}>
              <Icon name="products" size={24} color={Brand.primary} />
            </View>
            <Text style={{ fontSize: 18, fontWeight: 800, color: Brand.foreground }}>
              {t('app_name')}
            </Text>
          </View>
          <Text style={{ fontSize: 13, color: Brand.mutedForeground }}>
            {t('version')} 0.1.0
          </Text>
        </Card>
      </ScrollView>
    </Screen>
  );
}
