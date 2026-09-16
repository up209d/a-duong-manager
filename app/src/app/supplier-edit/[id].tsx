import { useLocalSearchParams } from 'expo-router';

import { PartyForm } from '@/components/party-form';

export default function SupplierEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PartyForm kind="suppliers" partyId={parseInt(id || '0', 10)} />;
}
