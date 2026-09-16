import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { API } from '@/api/client';
import { useBrand } from '@/theme';
import { money, monthStartStr, todayStr } from '@/lib/format';
import { useI18n } from '@/i18n';
import { Card } from '@/components/ui';
import { Screen } from '@/components/screen';

type PL = {
  orders: number;
  revenue: number;
  cogs: number;
  gross_profit: number;
  import_costs: number;
  net_profit: number;
};

function Row({ label, value, color, bold }: { label: string; value: string; color?: string; bold?: boolean }) {
  const Brand = useBrand();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
      <Text style={{ fontSize: 14.5, color: Brand.mutedForeground }}>{label}</Text>
      <Text
        style={{
          fontSize: bold ? 16 : 14.5,
          fontWeight: bold ? 800 : 700,
          color: color || Brand.foreground,
        }}>
        {value}
      </Text>
    </View>
  );
}

export default function ReportsScreen() {
  const Brand = useBrand();
  const styles = {
    title: { fontSize: 24, fontWeight: '800' as const, color: Brand.foreground, marginBottom: 12 },
    cardTitle: { fontSize: 16, fontWeight: '700' as const, color: Brand.foreground, marginBottom: 6 },
    fieldLabel: { fontSize: 12.5, color: Brand.mutedForeground },
    fieldValue: { fontSize: 16, fontWeight: '700' as const, color: Brand.foreground, marginTop: 2 },
  };
  const { t } = useI18n();
  const [from, setFrom] = useState(monthStartStr());
  const [to, setTo] = useState(todayStr());
  const [pl, setPl] = useState<PL | null>(null);
  const [debts, setDebts] = useState<any>(null);

  useEffect(() => {
    API.profitLoss(from, to).then((r) => r.ok && setPl(r.data));
    API.debts().then((r) => r.ok && setDebts(r.data));
  }, [from, to]);

  const profitColor = (v: number) => (v >= 0 ? Brand.accent : Brand.destructive);

  return (
    <Screen title={t('period_report')}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <Card style={{ marginBottom: 12, flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>{t('from')}</Text>
            <Text style={styles.fieldValue}>{from}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>{t('to')}</Text>
            <Text style={styles.fieldValue}>{to}</Text>
          </View>
        </Card>

        <Card style={{ marginBottom: 12 }}>
          <Row label={t('orders')} value={pl ? String(pl.orders) : '...'} />
          <Row label={t('revenue')} value={pl ? money(pl.revenue) : '...'} />
          <Row label={t('cogs')} value={pl ? `- ${money(pl.cogs)}` : '...'} color={Brand.destructive} />
          <View style={{ borderTopWidth: 1, borderTopColor: Brand.border, marginVertical: 6 }} />
          <Row label={t('gross_profit')} value={pl ? money(pl.gross_profit) : '...'} color={pl ? profitColor(pl.gross_profit) : undefined} bold />
          <Row label={t('import_costs')} value={pl ? `- ${money(pl.import_costs)}` : '...'} />
          <View style={{ borderTopWidth: 1, borderTopColor: Brand.border, marginVertical: 6 }} />
          <Row label={t('net_profit')} value={pl ? money(pl.net_profit) : '...'} color={pl ? profitColor(pl.net_profit) : undefined} bold />
        </Card>

        <Card>
          <Text style={styles.cardTitle}>{t('debt_mgmt')}</Text>
          <Row label={t('receivables')} value={debts ? money(debts.receivables) : '...'} color={Brand.accent} />
          <Row label={t('payables')} value={debts ? money(debts.payables) : '...'} color={Brand.destructive} />
          <View style={{ borderTopWidth: 1, borderTopColor: Brand.border, marginVertical: 6 }} />
          <Row
            label={'Net'}
            value={debts ? money(debts.net) : '...'}
            color={debts ? profitColor(debts.net) : undefined}
            bold
          />
        </Card>
      </ScrollView>
    </Screen>
  );
}


