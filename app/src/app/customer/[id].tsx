import { useLocalSearchParams } from 'expo-router';

import { PartyDetail } from '@/components/party-detail';

export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PartyDetail kind="customers" partyId={parseInt(id || '0', 10)} />;
}
