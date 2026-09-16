import { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { API } from '@/api/client';
import { useBrand } from '@/theme';
import { money } from '@/lib/format';
import { useI18n } from '@/i18n';
import { Card } from '@/components/ui';
import { Screen } from '@/components/screen';

type Tx = {
  id: number;
  code: string;
  type: 'IMPORT' | 'EXPORT';
  entity_name: string | null;
  subtotal: number;
  discount: number;
  extra_fee: number;
  total_amount: number;
  paid_amount: number;
  note: string | null;
  created_at: string;
  cogs: number;
  gross_profit: number;
  items: { name: string; quantity: number; unit: string | null; unit_price: number; price_label: string | null }[];
};

export default function TransactionDetailScreen() {
  const Brand = useBrand();
  const { t } = useI18n();
  const { id } = useLocalSearchParams<{ id: string }>();
  const txId = parseInt(id || '0', 10);
  const [tx, setTx] = useState<Tx | null>(null);

  useEffect(() => {
    API.transaction(txId).then((r) => r.ok && setTx(r.data));
  }, [txId]);

  if (!tx) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Brand.background }}>
        <Text style={{ color: Brand.mutedForeground }}>{t('loading')}</Text>
      </SafeAreaView>
    );
  }

  const isExport = tx.type === 'EXPORT';
  const color = isExport ? Brand.destructive : Brand.accent;
  const styles = { cardTitle: { fontSize: 16, fontWeight: '700' as const, color: Brand.foreground, marginBottom: 6 } };

  return (
    <Screen title={tx.code}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <View
          style={{
            backgroundColor: color,
            borderRadius: 14,
            padding: 16,
            marginBottom: 12,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <View>
            <Text style={{ color: '#FFFFFFAA', fontSize: 13 }}>
              {isExport ? t('stock_out') : t('stock_in')} {'\u00B7'} {tx.created_at.slice(0, 16)}
            </Text>
            <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: 800, marginTop: 2 }}>{tx.code}</Text>
          </View>
          <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: 800 }}>{money(tx.total_amount)}</Text>
        </View>

        <Card style={{ marginBottom: 12 }}>
          <Row label={t('entity_name')} value={tx.entity_name || t('walk_in')} />
          <Row label={t('subtotal')} value={money(tx.subtotal)} />
          {tx.discount > 0 ? <Row label={t('discount')} value={`- ${money(tx.discount)}`} color={Brand.destructive} /> : null}
          {tx.extra_fee > 0 ? <Row label={t('extra_fee')} value={`+ ${money(tx.extra_fee)}`} /> : null}
          <Row label={t('paid_amount')} value={money(tx.paid_amount)} color={Brand.accent} />
          {isExport ? <Row label={t('cogs')} value={money(tx.cogs)} /> : null}
          {isExport ? (
            <Row label={t('gross_profit')} value={money(tx.gross_profit)} color={tx.gross_profit >= 0 ? Brand.accent : Brand.destructive} />
          ) : null}
          {tx.note ? <Row label={t('note')} value={tx.note} /> : null}
        </Card>

        <Card>
          <Text style={styles.cardTitle}>{t('products')}</Text>
          {tx.items.map((it, i) => (
            <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={{ fontSize: 14.5, fontWeight: 600, color: Brand.foreground }}>{it.name}</Text>
                <Text style={{ fontSize: 12.5, color: Brand.mutedForeground, marginTop: 2 }}>
                  {it.quantity} {it.unit || ''} {it.price_label ? `\u00D7 ${it.price_label}` : ''}
                </Text>
              </View>
              <Text style={{ fontSize: 14.5, fontWeight: 700, color: Brand.foreground }}>
                {money(it.quantity * it.unit_price)}
              </Text>
            </View>
          ))}
        </Card>
      </ScrollView>
    </Screen>
  );
}

function Row({ label, value, color }: { label: string; value: string; color?: string }) {
  const Brand = useBrand();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
      <Text style={{ fontSize: 14, color: Brand.mutedForeground }}>{label}</Text>
      <Text style={{ fontSize: 14.5, fontWeight: 700, color: color || Brand.foreground }}>{value}</Text>
    </View>
  );
}


