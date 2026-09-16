import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { API } from '@/api/client';
import { useBrand } from '@/theme';
import { money } from '@/lib/format';
import { useI18n } from '@/i18n';
import { Button, Card, Field } from '@/components/ui';
import { Screen } from '@/components/screen';

type Party = { id: number; name: string; phone: string | null; address: string | null; current_debt: number };
type Payment = { id: number; amount: number; note: string | null; created_at: string };

export function PartyDetail({
  kind,
  partyId,
}: {
  kind: 'customers' | 'suppliers';
  partyId: number;
}) {
  const Brand = useBrand();
  const { t } = useI18n();
  const router = useRouter();
  const isCustomer = kind === 'customers';
  const [party, setParty] = useState<Party | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => {
    const fn = isCustomer ? API.customer : API.supplier;
    fn(partyId).then((r) => {
      if (r.ok) {
        setParty(r.data);
        setPayments(r.data.payments || []);
      }
      setRefreshing(false);
    });
  }, [partyId, isCustomer]);

  useEffect(() => {
    load();
  }, [load]);

  async function recordPayment() {
    const amt = parseInt(amount, 10) || 0;
    if (amt <= 0) return;
    const r = await API.recordPayment(kind, partyId, amt, note.trim() || undefined);
    if (r.ok) {
      setAmount('');
      setNote('');
      load();
    }
  }

  const styles = { cardTitle: { fontSize: 16, fontWeight: '700' as const, color: Brand.foreground, marginBottom: 10 } };

  return (
    <Screen title={party?.name || (isCustomer ? t('customer') : t('supplier'))}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}>
        <Card style={{ marginBottom: 12 }}>
          {party?.phone ? (
            <Text style={{ fontSize: 13.5, color: Brand.mutedForeground, marginTop: 4 }}>
              {party.phone}
            </Text>
          ) : null}
          {party?.address ? (
            <Text style={{ fontSize: 13.5, color: Brand.mutedForeground, marginTop: 2 }}>
              {party.address}
            </Text>
          ) : null}
        </Card>

        {party && party.current_debt > 0 ? (
          <View
            style={{
              backgroundColor: Brand.destructive,
              borderRadius: 14,
              padding: 16,
              marginBottom: 12,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <View>
              <Text style={{ color: '#FFFFFFAA', fontSize: 13 }}>{t('total_debt')}</Text>
              <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: 800, marginTop: 2 }}>
                {money(party.current_debt)}
              </Text>
            </View>
            <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: 700 }}>
              {isCustomer ? t('receivables') : t('payables')}
            </Text>
          </View>
        ) : null}

        <Card style={{ marginBottom: 12 }}>
          <Text style={styles.cardTitle}>{isCustomer ? t('collect_debt') : t('pay_debt')}</Text>
          <Field
            label={t('amount')}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            suffix={'\u20AB'}
          />
          <Field label={t('note')} value={note} onChangeText={setNote} />
          <Button
            label={isCustomer ? t('collect_debt') : t('pay_debt')}
            variant={isCustomer ? 'accent' : 'danger'}
            onPress={recordPayment}
          />
        </Card>

        <Card>
          <Text style={styles.cardTitle}>{t('payment_records')}</Text>
          {payments.length === 0 ? (
            <Text style={{ color: Brand.mutedForeground, fontSize: 14 }}>{t('no_data')}</Text>
          ) : (
            payments.map((p) => (
              <View
                key={p.id}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingVertical: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: Brand.border,
                }}>
                <View>
                  <Text style={{ fontSize: 14.5, fontWeight: 700, color: Brand.foreground }}>
                    {money(p.amount)}
                  </Text>
                  {p.note ? (
                    <Text style={{ fontSize: 12.5, color: Brand.mutedForeground }}>{p.note}</Text>
                  ) : null}
                </View>
                <Text style={{ fontSize: 12.5, color: Brand.mutedForeground }}>
                  {p.created_at.slice(0, 16)}
                </Text>
              </View>
            ))
          )}
        </Card>

        <Pressable
          onPress={() =>
            router.push((isCustomer ? `/customer-edit/${partyId}` : `/supplier-edit/${partyId}`) as any)
          }
          style={{ alignItems: 'center', marginTop: 18, padding: 8 }}>
          <Text style={{ color: Brand.accent, fontWeight: 700 }}>{t('edit')}</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

