import { useLocalSearchParams } from 'expo-router';

import { useI18n } from '@/i18n';
import { ProductForm } from '@/components/product-form';
import { Screen } from '@/components/screen';
import { useGoBack } from '@/lib/useGoBack';

export default function ProductEditScreen() {
  const { t } = useI18n();
  const goBack = useGoBack();
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = parseInt(id || '0', 10);
  return (
    <Screen title={t('edit')}>
      <ProductForm productId={productId} onDone={goBack} />
    </Screen>
  );
}
