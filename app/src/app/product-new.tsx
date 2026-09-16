import { useState } from 'react';

import { useI18n } from '@/i18n';
import { ProductForm } from '@/components/product-form';
import { Screen } from '@/components/screen';
import { useGoBack } from '@/lib/useGoBack';

export default function ProductNewScreen() {
  const { t } = useI18n();
  const goBack = useGoBack();
  const [formKey, setFormKey] = useState(0);
  return (
    <Screen title={t('add_product')}>
      <ProductForm
        key={formKey}
        onDone={(_id, again) => (again ? setFormKey((k) => k + 1) : goBack())}
      />
    </Screen>
  );
}
