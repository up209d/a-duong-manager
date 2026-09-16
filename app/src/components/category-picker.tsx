import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { API } from '@/api/client';
import { useBrand } from '@/theme';
import { Icon } from '@/icons';
import { useI18n } from '@/i18n';
import { Button } from '@/components/ui';

type Cat = { id: number; name: string; product_count: number };

// Bottom-sheet modal: multi-select categories (checkboxes) + inline add-new.
// Controlled: `visible`, `initial` (selected names), `onConfirm(names)`, `onClose`.
export function CategorySelectModal({
  visible,
  initial,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  initial: string[];
  onClose: () => void;
  onConfirm: (names: string[]) => void;
}) {
  const Brand = useBrand();
  const { t } = useI18n();
  const [cats, setCats] = useState<Cat[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (visible) {
      setSelected(initial);
      setNewName('');
      API.listCategories().then((r) => r.ok && setCats(r.data));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  function toggle(name: string) {
    setSelected((s) => (s.includes(name) ? s.filter((n) => n !== name) : [...s, name]));
  }

  async function addNew() {
    const name = newName.trim();
    if (!name) return;
    await API.createCategory(name);
    setNewName('');
    const r = await API.listCategories();
    if (r.ok) setCats(r.data);
    setSelected((s) => (s.includes(name) ? s : [...s, name]));
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(0,0,0,0.45)',
        }}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <SafeAreaView
          style={{
            backgroundColor: Brand.card,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: '82%',
          }}>
          {/* handle + header */}
          <View style={{ alignItems: 'center', marginTop: 8, marginBottom: 4 }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: Brand.border }} />
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingTop: 6,
              paddingBottom: 10,
            }}>
            <Text style={{ fontSize: 18, fontWeight: 800, color: Brand.foreground }}>
              {t('choose_categories')}
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Icon name="close" size={22} color={Brand.mutedForeground} />
            </Pressable>
          </View>

          {/* list */}
          <ScrollView style={{ paddingHorizontal: 16 }} contentContainerStyle={{ paddingBottom: 8 }}>
            {cats.map((c) => {
              const on = selected.includes(c.name);
              return (
                <Pressable
                  key={c.id}
                  onPress={() => toggle(c.name)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 13,
                    borderBottomWidth: 1,
                    borderBottomColor: Brand.border,
                  }}>
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      borderWidth: 2,
                      borderColor: on ? Brand.accent : Brand.border,
                      marginRight: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: on ? Brand.accent : 'transparent',
                    }}>
                    {on ? <Icon name="check" size={14} color="#fff" /> : null}
                  </View>
                  <Text style={{ flex: 1, fontSize: 15, color: Brand.foreground, fontWeight: on ? 700 : 500 }}>
                    {c.name}
                  </Text>
                  <Text style={{ fontSize: 12, color: Brand.mutedForeground }}>
                    {c.product_count} {t('products_in')}
                  </Text>
                </Pressable>
              );
            })}

            {/* add-new row */}
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 14, alignItems: 'center' }}>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: Brand.muted,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: Brand.border,
                  paddingHorizontal: 12,
                }}>
                <TextInput
                  style={{ flex: 1, paddingVertical: 10, fontSize: 15, color: Brand.foreground }}
                  placeholder={t('add_category_hint')}
                  placeholderTextColor={Brand.mutedForeground}
                  value={newName}
                  onChangeText={setNewName}
                  onSubmitEditing={addNew}
                />
              </View>
              <Pressable
                onPress={addNew}
                disabled={!newName.trim()}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: Brand.accent,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: newName.trim() ? 1 : 0.4,
                }}>
                <Icon name="plus" size={20} color="#fff" />
              </Pressable>
            </View>
          </ScrollView>

          {/* footer */}
          <View
            style={{
              flexDirection: 'row',
              gap: 10,
              padding: 16,
              borderTopWidth: 1,
              borderTopColor: Brand.border,
            }}>
            <View style={{ flex: 1 }}>
              <Button label={t('clear_all')} variant="outline" onPress={() => setSelected([])} />
            </View>
            <View style={{ flex: 2 }}>
              <Button
                label={t('confirm')}
                onPress={() => {
                  onConfirm(selected);
                  onClose();
                }}
              />
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
