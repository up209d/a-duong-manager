import { Pressable, StyleSheet, Text, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { useBrand } from '@/theme';
import { Icon } from '@/icons';

/**
 * Cheap animated background: 2-3 soft blobs drifting slowly (transform/opacity only).
 * Colors come from the active palette gradient. Render inside a View with overflow:hidden.
 */
export function Aurora({ opacity = 0.5 }: { opacity?: number }) {
  const Brand = useBrand();
  const [c1, c2] = Brand.gradient;
  const t = useSharedValue(0);
  t.value = withRepeat(
    withSequence(withTiming(1, { duration: 9000 }), withTiming(0, { duration: 9000 })),
    -1,
    false
  );
  const s1 = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(t.value, [0, 1], [0, 40]) },
      { translateY: interpolate(t.value, [0, 1], [0, -30]) },
      { scale: interpolate(t.value, [0, 1], [1, 1.15]) },
    ],
  }));
  const s2 = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(t.value, [0, 1], [0, -35]) },
      { translateY: interpolate(t.value, [0, 1], [0, 25]) },
      { scale: interpolate(t.value, [0, 1], [1.1, 1]) },
    ],
  }));
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', opacity }}>
      <Animated.View
        style={[
          s1,
          {
            position: 'absolute',
            top: -60,
            right: -40,
            width: 220,
            height: 220,
            borderRadius: 110,
            backgroundColor: c1,
            opacity: 0.22,
          },
        ]}
      />
      <Animated.View
        style={[
          s2,
          {
            position: 'absolute',
            bottom: -70,
            left: -50,
            width: 240,
            height: 240,
            borderRadius: 120,
            backgroundColor: c2,
            opacity: 0.18,
          },
        ]}
      />
      <View
        style={{
          position: 'absolute',
          top: 40,
          left: 30,
          width: 90,
          height: 90,
          borderRadius: 45,
          backgroundColor: c2,
          opacity: 0.12,
        }}
      />
    </View>
  );
}

/** Screen background: soft vertical tint (palette) + aurora blobs. */
export function ScreenBackground() {
  const Brand = useBrand();
  return (
    <LinearGradient
      colors={[Brand.gradient[0] + '14', Brand.background, Brand.background]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.4, y: 1 }}
      style={StyleSheet.absoluteFill}
    >
      <Aurora />
    </LinearGradient>
  );
}

// ---------- Card ----------
export function Card({
  children,
  style,
  onPress,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}) {
  const Brand = useBrand();
  const inner = (
    <View
      style={[
        {
          backgroundColor: Brand.card,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: Brand.border,
          padding: 14,
          shadowColor: Brand.primary,
          shadowOpacity: 0.06,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
          elevation: 3,
        },
        style,
      ]}>
      {children}
    </View>
  );
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1, transform: [{ scale: pressed ? 0.985 : 1 }] } as any)}>
        {inner}
      </Pressable>
    );
  }
  return inner;
}

// ---------- Button ----------
export function Button({
  label,
  onPress,
  variant = 'primary',
  style,
  disabled,
  icon,
}: {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'accent' | 'danger' | 'outline' | 'ghost';
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  icon?: string; // semantic icon name
}) {
  const Brand = useBrand();
  const isGradient = variant === 'primary' || variant === 'accent' || variant === 'danger';
  const colors = isGradient
    ? variant === 'primary'
      ? [Brand.gradient[0], Brand.gradient[1]]
      : variant === 'accent'
        ? [Brand.accent, Brand.gradient[1]]
        : [Brand.destructive, '#F87171']
    : null;
  const bg =
    variant === 'danger' ? Brand.destructive : variant === 'outline' || variant === 'ghost' ? 'transparent' : Brand.primary;
  const fg =
    variant === 'outline' || variant === 'ghost'
      ? variant === 'ghost'
        ? Brand.mutedForeground
        : Brand.primary
      : '#FFFFFF';

  const content = (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
      {icon ? <Icon name={icon} size={18} color={fg} /> : null}
      <Text style={{ color: fg, fontSize: 16, fontWeight: 700 }}>{label}</Text>
    </View>
  );

  // Shared padding so gradient and solid buttons have identical sizing.
  const pad = { paddingVertical: 14, paddingHorizontal: 18 };
  const basePress = ({ pressed }: { pressed: boolean }) =>
    [
      {
        borderRadius: 14,
        alignItems: 'center' as const,
        borderWidth: variant === 'outline' ? 1.5 : 0,
        borderColor: Brand.primary,
        opacity: disabled ? 0.5 : 1,
        transform: [{ scale: pressed ? 0.97 : 1 }],
      },
      style,
    ] as any;

  if (colors) {
    // Padding lives INSIDE the gradient so the colored box is full-height,
    // not a slim bar with transparent margin around it.
    return (
      <Pressable onPress={onPress} disabled={disabled} style={basePress as any}>
        <LinearGradient
          colors={colors as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 14, width: '100%', ...pad }}>
          {content}
        </LinearGradient>
      </Pressable>
    );
  }
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={(s) => [
        { backgroundColor: bg, ...pad },
        basePress(s),
      ] as any}>
      {content}
    </Pressable>
  );
}

// ---------- Field (label + input) ----------
export function Field({
  label,
  value,
  onChangeText,
  keyboardType,
  placeholder,
  required,
  suffix,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  keyboardType?: 'default' | 'numeric' | 'phone-pad' | 'decimal-pad';
  placeholder?: string;
  required?: boolean;
  suffix?: string;
}) {
  const Brand = useBrand();
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ color: Brand.foreground, fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
        {label}
        {required ? <Text style={{ color: Brand.destructive }}> *</Text> : null}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: Brand.muted,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: Brand.border,
          paddingHorizontal: 12,
        }}>
        {/* width:0 + flex:1 lets the input shrink below content width (keeps suffix visible) */}
        <View style={{ flex: 1, width: 0 }}>
          <TextInput
            style={{ paddingVertical: 12, fontSize: 16, color: Brand.foreground }}
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
            placeholder={placeholder}
            placeholderTextColor={Brand.mutedForeground}
          />
        </View>
        {suffix ? (
          <Text style={{ fontSize: 15, color: Brand.mutedForeground, marginLeft: 8, flexShrink: 0 }}>
            {suffix}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

// ---------- SectionRow (icon tile + title + subtitle, like reference app) ----------
export function SectionRow({
  title,
  subtitle,
  onPress,
  icon,
  tint,
}: {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  icon: string; // semantic icon name (see src/icons)
  tint?: string;
}) {
  const Brand = useBrand();
  const t = tint || Brand.primary;
  return (
    <Card
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        backgroundColor: Brand.card,
      }}>
      <View
        style={{
          width: 46,
          height: 46,
          borderRadius: 14,
          backgroundColor: t + '1A',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}>
        <Icon name={icon} size={24} color={t} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: 700, color: Brand.foreground }}>{title}</Text>
        {subtitle ? (
          <Text style={{ fontSize: 13, color: Brand.mutedForeground, marginTop: 2 }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Icon name="forward" size={18} color={Brand.mutedForeground} />
    </Card>
  );
}

// ---------- Empty state ----------
export function EmptyState({ icon, text, actionLabel, onAction }: {
  icon: string; // semantic icon name
  text: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const Brand = useBrand();
  return (
    <View style={{ alignItems: 'center', paddingVertical: 48 }}>
      <View
        style={{
          width: 84,
          height: 84,
          borderRadius: 42,
          backgroundColor: Brand.muted,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 14,
        }}>
        <Icon name={icon} size={38} color={Brand.mutedForeground} />
      </View>
      <Text style={{ fontSize: 16, fontWeight: 600, color: Brand.foreground }}>{text}</Text>
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          style={({ pressed }) => ({
            marginTop: 18,
            borderRadius: 22,
            borderWidth: 1.5,
            borderColor: Brand.accent,
            paddingHorizontal: 22,
            paddingVertical: 10,
            opacity: pressed ? 0.7 : 1,
          })}>
          <Text style={{ color: Brand.accent, fontWeight: 700, fontSize: 15 }}>
            + {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

// ---------- Stat (big number + label) ----------
export function Stat({ label, value, color }: {
  label: string;
  value: string;
  color?: string;
}) {
  const Brand = useBrand();
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text
        style={{
          fontSize: 18,
          fontWeight: 800,
          color: color || Brand.foreground,
          textAlign: 'center',
          paddingVertical: 2,
        }}>
        {value}
      </Text>
      <Text style={{ fontSize: 12, color: '#FFFFFFCC', marginTop: 2 }}>{label}</Text>
    </View>
  );
}
