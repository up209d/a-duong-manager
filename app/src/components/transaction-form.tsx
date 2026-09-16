import { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { API } from '@/api/client';
import { useBrand } from '@/theme';
import { Icon } from '@/icons';
import { money, num } from '@/lib/format';
import { useI18n } from '@/i18n';
import { Button, Card, Field } from '@/components/ui';

type Product = {
  id: number;
  name: string;
  sku: string;
  unit: string | null;
  selling_price: number;
  cost_price: number;
  stock_quantity: number;
};
type Entity = { id: number; name: string; phone?: string | null };
type Line = {
  product_id: number;
  name: string;
  unit: string;
  stock: number;
  quantity: string;
  unit_price: string;
};

export function TransactionForm({
  type,
  onDone,
}: {
  type: 'IMPORT' | 'EXPORT';
  onDone: () => void;
}) {
  const Brand = useBrand();
  const { t } = useI18n();
  const isImport = type === 'IMPORT';

  const [entity, setEntity] = useState<Entity | null>(null);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [discount, setDiscount] = useState('');
  const [extraFee, setExtraFee] = useState('');
  const [paid, setPaid] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // pickers
  const [entityModal, setEntityModal] = useState(false);
  const [entityQ, setEntityQ] = useState('');
  const [productModal, setProductModal] = useState(false);
  const [productQ, setProductQ] = useState('');
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    (isImport ? API.listSuppliers() : API.listCustomers()).then((r) =>
      r.ok ? setEntities(r.data.items) : null
    );
    API.listProducts().then((r) => (r.ok ? setProducts(r.data.items) : null));
  }, [isImport]);

  const subtotal = lines.reduce((s, l) => s + (parseInt(l.quantity, 10) || 0) * (parseInt(l.unit_price, 10) || 0), 0);
  const total = subtotal - (parseInt(discount, 10) || 0) + (parseInt(extraFee, 10) || 0);
  const paidNum = parseInt(paid, 10) || 0;
  const status = paidNum >= total ? 'paid' : paidNum > 0 ? 'partial' : 'unpaid';

  function addProduct(p: Product) {
    setProductModal(false);
    setProductQ('');
    const defaultPrice = isImport ? p.cost_price : p.selling_price;
    setLines((ls) => {
      const existing = ls.find((l) => l.product_id === p.id);
      if (existing) return ls;
      return [
        ...ls,
        {
          product_id: p.id,
          name: p.name,
          unit: p.unit || '',
          stock: p.stock_quantity,
          quantity: '1',
          unit_price: String(defaultPrice || ''),
        },
      ];
    });
  }

  function setLine(i: number, patch: Partial<Line>) {
    setLines((ls) => ls.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  }

  async function save() {
    if (lines.length === 0) {
      setError(t('choose_product') + ' - ' + t('required'));
      return;
    }
    setSaving(true);
    setError('');
    const r = await API.createTransaction({
      type,
      entity_id: entity?.id || null,
      items: lines.map((l) => ({
        product_id: l.product_id,
        quantity: parseInt(l.quantity, 10) || 0,
        unit_price: parseInt(l.unit_price, 10) || 0,
      })),
      discount: parseInt(discount, 10) || 0,
      extra_fee: parseInt(extraFee, 10) || 0,
      paid_amount: paidNum,
      note: note.trim() || null,
    });
    setSaving(false);
    if (!r.ok) {
      if (r.error === 'insufficient_stock') {
        Alert.alert(t('insufficient_stock'), `${r.data?.product_name || ''} - ${t('stock')}: ${r.data?.available ?? ''}`);
      } else {
        setError(r.error);
      }
      return;
    }
    const code = r.data.code;
    Alert.alert(t('transaction_saved'), `${code} - ${t('total')}: ${money(total)}`, [
      { text: t('save_and_new'), onPress: () => { setLines([]); setDiscount(''); setExtraFee(''); setPaid(''); setNote(''); setEntity(null); } },
      { text: t('save'), onPress: onDone },
    ]);
  }

  const entityLabel = isImport ? t('supplier') : t('customer');
  const statusText = status === 'paid' ? t('status_paid') : status === 'partial' ? t('status_partial') : t('status_unpaid');

  const styles = {
    cardTitle: { fontSize: 16, fontWeight: '700' as const, color: Brand.foreground, marginBottom: 10 },
    error: { color: Brand.destructive, fontWeight: '600' as const, marginBottom: 10 },
  };

  return (
    <View style={{ flex: 1, backgroundColor: Brand.background }}>
      <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
        {/* Entity */}
        <Card onPress={() => setEntityModal(true)} style={{ marginBottom: 12, flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12.5, color: Brand.mutedForeground }}>{entityLabel}</Text>
            <Text style={{ fontSize: 16, fontWeight: 700, color: Brand.foreground, marginTop: 2 }}>
              {entity ? entity.name : t(isImport ? 'choose_supplier' : 'choose_customer')}
            </Text>
          </View>
          {entity ? (
            <Pressable hitSlop={8} onPress={() => setEntity(null)}>
              <Icon name="close" size={18} color={Brand.destructive} />
            </Pressable>
          ) : (
            <Icon name="forward" size={18} color={Brand.mutedForeground} />
          )}
        </Card>

        {/* Lines */}
        <Card style={{ marginBottom: 12 }}>
          <Text style={styles.cardTitle}>
            {t('products')} {lines.length > 0 && `(${lines.length})`}
          </Text>
          {lines.map((l, i) => (
            <View
              key={l.product_id}
              style={{
                backgroundColor: Brand.muted,
                borderRadius: 10,
                padding: 10,
                marginBottom: 8,
              }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ flex: 1, fontSize: 14.5, fontWeight: 700, color: Brand.foreground, marginRight: 8 }}>
                  {l.name}
                </Text>
                <Pressable hitSlop={8} onPress={() => setLines((ls) => ls.filter((_, j) => j !== i))}>
                  <Icon name="close" size={16} color={Brand.destructive} />
                </Pressable>
              </View>
              {!isImport ? (
                <Text style={{ fontSize: 12, color: Brand.mutedForeground, marginBottom: 6 }}>
                  {t('stock')}: {num(l.stock)} {l.unit}
                </Text>
              ) : null}
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <MiniInput
                    label={t('quantity')}
                    value={l.quantity}
                    onChange={(v) => setLine(i, { quantity: v })}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <MiniInput
                    label={t('unit_price')}
                    value={l.unit_price}
                    onChange={(v) => setLine(i, { unit_price: v })}
                  />
                </View>
              </View>
            </View>
          ))}
          <Button
            label={`+ ${t('choose_product')}`}
            variant="outline"
            onPress={() => setProductModal(true)}
          />
        </Card>

        {/* Money */}
        <Card style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Field
                label={t('discount')}
                value={discount}
                onChangeText={setDiscount}
                keyboardType="numeric"
                suffix={'\u20AB'}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Field
                label={t('extra_fee')}
                value={extraFee}
                onChangeText={setExtraFee}
                keyboardType="numeric"
                suffix={'\u20AB'}
              />
            </View>
          </View>
          <Field label={t('paid_amount')} value={paid} onChangeText={setPaid} keyboardType="numeric" suffix={'\u20AB'} />
          <Field label={t('note')} value={note} onChangeText={setNote} />
        </Card>

        {/* Total */}
        <View
          style={{
            backgroundColor: Brand.primary,
            borderRadius: 14,
            padding: 16,
            marginBottom: 14,
          }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: '#FFFFFFAA', fontSize: 14 }}>{t('subtotal')}</Text>
            <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: 700 }}>{money(subtotal)}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: '#FFFFFFAA', fontSize: 14 }}>{t('discount')}</Text>
            <Text style={{ color: '#FCA5A5', fontSize: 15, fontWeight: 700 }}>- {money(parseInt(discount, 10) || 0)}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            <Text style={{ color: '#FFFFFFAA', fontSize: 14 }}>{t('extra_fee')}</Text>
            <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: 700 }}>+ {money(parseInt(extraFee, 10) || 0)}</Text>
          </View>
          <View style={{ borderTopWidth: 1, borderTopColor: '#FFFFFF33', paddingTop: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: 800 }}>{t('total')}</Text>
              <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: 800 }}>{money(total)}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              <Text style={{ color: '#FFFFFFAA', fontSize: 13 }}>{t('payment_status')}</Text>
              <Text style={{ fontSize: 14, fontWeight: 800, color: status === 'paid' ? '#6EE7B7' : status === 'partial' ? '#FCD34D' : '#FCA5A5' }}>
                {statusText}
              </Text>
            </View>
          </View>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          label={isImport ? t('new_import') : t('new_export')}
          variant={isImport ? 'accent' : 'danger'}
          onPress={save}
          disabled={saving}
        />
      </ScrollView>

      {/* Entity picker */}
      <Modal visible={entityModal} transparent animationType="slide" onRequestClose={() => setEntityModal(false)}>
        <PickerModal title={entityLabel} onClose={() => setEntityModal(false)} value={entityQ} onChange={(e) => {
          const text = e.nativeEvent.text;
          setEntityQ(text);
          (isImport ? API.listSuppliers(text) : API.listCustomers(text)).then((r) => r.ok && setEntities(r.data.items));
        }}>
          {entities.map((e) => (
            <Pressable
              key={e.id}
              onPress={() => {
                setEntity(e);
                setEntityModal(false);
              }}
              style={{ padding: 14, borderBottomWidth: 1, borderBottomColor: Brand.border }}>
              <Text style={{ fontSize: 15.5, fontWeight: 600, color: Brand.foreground }}>{e.name}</Text>
              {e.phone ? <Text style={{ fontSize: 13, color: Brand.mutedForeground }}>{e.phone}</Text> : null}
            </Pressable>
          ))}
        </PickerModal>
      </Modal>

      {/* Product picker */}
      <Modal visible={productModal} transparent animationType="slide" onRequestClose={() => setProductModal(false)}>
        <PickerModal title={t('products')} onClose={() => setProductModal(false)} value={productQ} onChange={(e) => {
          const text = e.nativeEvent.text;
          setProductQ(text);
          API.listProducts(text).then((r) => r.ok && setProducts(r.data.items));
        }}>
          {products.map((p) => (
            <Pressable key={p.id} onPress={() => addProduct(p)}
              style={{ padding: 14, borderBottomWidth: 1, borderBottomColor: Brand.border }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ flex: 1, fontSize: 15.5, fontWeight: 600, color: Brand.foreground, marginRight: 8 }}>{p.name}</Text>
                <Text style={{ fontSize: 13.5, fontWeight: 700, color: isImport ? Brand.accent : Brand.destructive }}>
                  {isImport ? money(p.cost_price) : money(p.selling_price)}
                </Text>
              </View>
              <Text style={{ fontSize: 12.5, color: Brand.mutedForeground }}>
                {p.sku} {p.unit ? `\u00B7 ${t('stock')}: ${num(p.stock_quantity)} ${p.unit}` : ''}
              </Text>
            </Pressable>
          ))}
        </PickerModal>
      </Modal>
    </View>
  );
}

// ---------- small pieces ----------
function MiniInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const Brand = useBrand();
  return (
    <View>
      <Text style={{ fontSize: 11.5, color: Brand.mutedForeground, marginBottom: 3 }}>{label}</Text>
      <TextInput
        style={{
          backgroundColor: Brand.card,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: Brand.border,
          paddingHorizontal: 10,
          paddingVertical: 9,
          fontSize: 15,
          fontWeight: 700,
          color: Brand.foreground,
        }}
        value={value}
        onChangeText={onChange}
        keyboardType="numeric"
      />
    </View>
  );
}

function PickerModal({
  title,
  value,
  onChange,
  onClose,
  children,
}: {
  title: string;
  value: string;
  onChange: (e: any) => void;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const Brand = useBrand();
  return (
    <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000066' }}>
      <View style={{ backgroundColor: Brand.card, borderTopLeftRadius: 18, borderTopRightRadius: 18, maxHeight: '70%' }}>
        <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: Brand.border }}>
          <Text style={{ fontSize: 17, fontWeight: 800, color: Brand.foreground }}>{title}</Text>
          <TextInput
            style={{
              marginTop: 10,
              backgroundColor: Brand.muted,
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 10,
              fontSize: 15,
              color: Brand.foreground,
            }}
            placeholder={t_search()}
            placeholderTextColor={Brand.mutedForeground}
            value={value}
            onChangeText={(t) => onChange({ nativeEvent: { text: t } })}
          />
        </View>
        <ScrollView style={{ maxHeight: 400 }}>{children}</ScrollView>
      </View>
    </View>
  );
}

function t_search() {
  return '\u1EE8ng t\u00ECm';
}


