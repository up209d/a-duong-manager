import { useLocalSearchParams } from 'expo-router';

import { PartyDetail } from '@/components/party-detail';

export default function SupplierDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PartyDetail kind="suppliers" partyId={parseInt(id || '0', 10)} />;
}
