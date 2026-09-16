import { useI18n } from '@/i18n';
import { TransactionForm } from '@/components/transaction-form';
import { Screen } from '@/components/screen';
import { useGoBack } from '@/lib/useGoBack';

export default function ExportNewScreen() {
  const { t } = useI18n();
  const goBack = useGoBack();
  return (
    <Screen title={t('new_export')}>
      <TransactionForm type="EXPORT" onDone={goBack} />
    </Screen>
  );
}
