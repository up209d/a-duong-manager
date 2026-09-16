import { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';

import { API } from '@/api/client';
import { useBrand } from '@/theme';
import { money } from '@/lib/format';
import { useI18n } from '@/i18n';
import { Button, Card, Field } from '@/components/ui';
import { Screen } from '@/components/screen';
import { useGoBack } from '@/lib/useGoBack';

export function PartyForm({
  kind,
  partyId,
}: {
  kind: 'customers' | 'suppliers';
  partyId?: number;
}) {
  const Brand = useBrand();
  const { t } = useI18n();
  const goBack = useGoBack();
  const isCustomer = kind === 'customers';
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!partyId) return;
    const fn = isCustomer ? API.customer : API.supplier;
    fn(partyId).then((r) => {
      if (!r.ok) return;
      setName(r.data.name);
      setPhone(r.data.phone || '');
      setAddress(r.data.address || '');
    });
  }, [partyId, isCustomer]);

  const title = partyId
    ? t('edit')
    : isCustomer
      ? t('add_customer')
      : t('add_supplier');

  async function save() {
    if (!name.trim()) {
      setError(t('required'));
      return;
    }
    setSaving(true);
    setError('');
    const body = {
      name: name.trim(),
      phone: phone.trim() || null,
      address: address.trim() || null,
    };
    const r = partyId
      ? isCustomer
        ? await API.updateCustomer(partyId, body)
        : await API.updateSupplier(partyId, body)
      : isCustomer
        ? await API.createCustomer(body)
        : await API.createSupplier(body);
    setSaving(false);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    goBack();
  }

  return (
    <Screen title={title}>
      <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
        <Card style={{ marginBottom: 16 }}>
          <Field label={isCustomer ? t('customer') : t('supplier')} value={name} onChangeText={setName} required />
          <Field label={t('phone')} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <Field label={t('address')} value={address} onChangeText={setAddress} />
        </Card>
        {error ? <Text style={{ color: Brand.destructive, fontWeight: 600, marginBottom: 10 }}>{error}</Text> : null}
        <Button label={t('save')} onPress={save} disabled={saving} />
        {partyId ? (
          <View style={{ alignItems: 'center', marginTop: 16 }}>
            <Text
              onPress={() => {
                Alert.alert(t('confirm_delete'), t('delete'), [
                  { text: t('cancel'), style: 'cancel' },
                  { text: t('delete'), style: 'destructive', onPress: goBack },
                ]);
              }}
              style={{ color: Brand.destructive, fontWeight: 600, padding: 8 }}>
              {t('delete')}
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

